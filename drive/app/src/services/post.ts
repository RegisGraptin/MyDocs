import { mockData } from "@/mock";
import { CalimeroApp } from '@calimero-network/calimero-client';
import documentService from './document';
import type { DocOpPayload, DocOp_Insert, DocOp_Delete } from '@/api/AbiClient';

const mock = mockData.html;

export type Post = {
  title: string;
  content: string;
  cover: string;
  author: string;
  readingTime: number;
  createdAt: string;
};

/**
 * getPost: fetch the Post either from Calimero (if `app` provided) or from localStorage/mock
 * savePost: persist the Post to Calimero (if `app` provided) or to localStorage
 */

const getPost = async (app?: CalimeroApp): Promise<Post> => {
  // If we have a Calimero app instance, try to read document from chain
  if (app) {
    try {
      const res = await documentService.getDocument(app);
      // res expected to be DocumentView { content, version, ... }
      if (res && typeof res.content === 'string') {
        try {
          const parsed: Post = JSON.parse(res.content);
          return parsed;
        } catch (e) {
          // content not JSON — fall back to mock
          return mock as Post;
        }
      }
    } catch (e) {
      console.warn('Calimero getDocument failed, falling back to local:', e);
      // continue to local fallback
    }
  }

  // Local/browser fallback
  return new Promise<Post>((resolve, reject) => {
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        try {
          const data = localStorage.getItem('post');
          const parsed: Post = data ? JSON.parse(data) : (mock as Post);
          if (!data) {
            savePost(parsed);
          }
          return resolve(parsed);
        } catch (err) {
          return reject(err);
        }
      }
      return resolve(mock as Post);
    }, 200);
  });
};

const savePost = async (data: Partial<Post>, app?: CalimeroApp): Promise<void> => {
  const value: Post = data?.content?.trim() ? ({ ...mock, ...data } as Post) : (mock as Post);

  // If app provided, prefer to persist using applyOps (optimistic concurrency)
  if (app) {
    // Try to persist on-chain with a couple of retries before falling back
    const attempts = 2;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        // Fetch current document to compute ops and get version (use generated client via documentService)
        const current = await documentService.getDocument(app).catch(() => null);
        if (!current || typeof current.content !== 'string') {
          console.log(`[post.save] attempt ${attempt}/${attempts}: creating document`);
          await documentService.createDocument(app, JSON.stringify(value));
          return;
        }

        const currentContent = current.content || '';
        const currentLen = currentContent.length;
        const newContent = JSON.stringify(value);

        // Build operations using the typed DocOpPayload shape generated in AbiClient
        const ops: DocOpPayload[] = [];
        if (currentLen > 0) {
          const del: DocOp_Delete = { index: 0, len: currentLen };
          ops.push({ name: 'Delete', payload: del });
        }
        const ins: DocOp_Insert = { index: 0, content: newContent };
        ops.push({ name: 'Insert', payload: ins });

        const expectVersion = typeof current.version === 'number' ? current.version : undefined;

        try {
          console.log(`[post.save] attempt ${attempt}: applying ops`, ops, 'expectVersion=', expectVersion);
          await documentService.applyOps(app, ops as any, expectVersion ?? null);
          return;
        } catch (err) {
          console.warn(`[post.save] applyOps failed (attempt ${attempt}):`, err);
        }

        // fallback to createDocument
        try {
          await documentService.createDocument(app, newContent);
          return;
        } catch (e2) {
          console.warn(`[post.save] createDocument failed (attempt ${attempt}):`, e2);
        }
      } catch (e) {
        console.warn(`[post.save] persistence attempt ${attempt} failed:`, e);
      }

      // small backoff
      if (attempt < attempts) await new Promise((r) => setTimeout(r, 200));
    }
    console.warn('Calimero persistence failed after retries, falling back to localStorage');
  }

  // Local/browser fallback
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('post', JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const postService = {
  get: getPost,
  save: savePost,
};

export default postService;
