import { useCallback, useEffect, useRef, useState } from 'react';

import { useCalimero } from '@calimero-network/calimero-client';

import documentService from '@/services/document';

export interface DocumentView {
  content: string;
  version?: number;
  updated_ms?: number;
  last_editor?: string | null;
}

export interface UseDocumentOptions {
  contextId: string;
  onUpdate?: (doc: DocumentView) => void;
}

export function useDocument({ contextId, onUpdate }: UseDocumentOptions) {
  const { app } = useCalimero();

  const [doc, setDoc] = useState<DocumentView | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentSubscriptionRef = useRef<string | null>(null);
  const hasSubscribedRef = useRef(false);
  const isProcessingEvent = useRef(false);

  const parseDocumentEvent = useCallback((eventData: any): DocumentView | null => {
    try {
      if (!eventData) return null;

      // Handle direct event structure
      if (eventData.event_type) {
        switch (eventData.event_type) {
          case 'DocumentCreated':
            return { content: eventData.content || '', version: eventData.version };
          case 'DocumentUpdated':
            return { content: eventData.content || '', version: eventData.version, last_editor: eventData.editor };
        }
      }

      // Handle execution events array
      if (eventData.events && Array.isArray(eventData.events)) {
        for (const executionEvent of eventData.events) {
          const kind = executionEvent.kind;
          const raw = executionEvent.data;

          if (!kind || raw === undefined || raw === null) continue;

          // Try decode byte-array payload
          try {
            if (Array.isArray(raw) && raw.every((n: any) => typeof n === 'number')) {
              const decoder = new TextDecoder();
              const jsonStr = decoder.decode(new Uint8Array(raw));
              const payload = JSON.parse(jsonStr);
              if (kind === 'DocumentCreated') {
                return { content: payload.content || '', version: payload.version };
              }
              if (kind === 'DocumentUpdated') {
                return { content: payload.content || '', version: payload.version, last_editor: payload.editor };
              }
            }
          } catch (e) {
            // ignore decode errors
          }
        }
      }
    } catch (e) {
      console.error('Error parsing document event:', e);
    }
    return null;
  }, []);

  const eventCallback = useCallback(
    async (event: any) => {
      console.log('[useDocument] eventCallback received', event.type, event.data ? Object.keys(event.data) : 'no data');
      if (isProcessingEvent.current) {
        console.log('[useDocument] already processing event, skipping');
        return;
      }
      isProcessingEvent.current = true;
      try {
        if (event.type === 'StateMutation' || event.type === 'ExecutionEvent') {
          const parsed = parseDocumentEvent(event.data);
          console.log('[useDocument] parsed event ->', parsed);
          if (parsed) {
            setDoc(parsed);
            onUpdate?.(parsed);
          }
        }
      } catch (e) {
        console.error('Error handling document event', e);
        setError('Error processing document event');
      } finally {
        isProcessingEvent.current = false;
      }
    },
    [onUpdate, parseDocumentEvent],
  );

  const subscribe = useCallback(() => {
    if (!app || !contextId || hasSubscribedRef.current || isConnecting) return;
    setIsConnecting(true);
    try {
      console.log('[useDocument] subscribing to context', contextId);
      if (currentSubscriptionRef.current) {
        app.unsubscribeFromEvents([currentSubscriptionRef.current]);
      }
      app.subscribeToEvents([contextId], eventCallback);
      currentSubscriptionRef.current = contextId;
      hasSubscribedRef.current = true;
      setIsSubscribed(true);
      setIsConnecting(false);
      console.log('[useDocument] subscribed successfully to', contextId);
    } catch (e) {
      console.error('Failed to subscribe to document events:', e);
      setError('Failed to subscribe');
      setIsConnecting(false);
    }
  }, [app, contextId, eventCallback, isConnecting]);

  const unsubscribe = useCallback(() => {
    if (!app || !currentSubscriptionRef.current) return;
    try {
      console.log('[useDocument] unsubscribing from', currentSubscriptionRef.current);
      app.unsubscribeFromEvents([currentSubscriptionRef.current]);
      currentSubscriptionRef.current = null;
      hasSubscribedRef.current = false;
      setIsSubscribed(false);
      console.log('[useDocument] unsubscribed');
    } catch (e) {
      console.error('Failed to unsubscribe from document events:', e);
    }
  }, [app]);

  const refresh = useCallback(async () => {
    if (!app) return;
    try {
      console.log('[useDocument] refresh called');
      const d = await documentService.getDocument(app);
      console.log('[useDocument] refresh result', d);
      if (d) setDoc(d as DocumentView);
      return d;
    } catch (e) {
      console.warn('Failed to refresh document', e);
      return null;
    }
  }, [app]);

  const applyOps = useCallback(
    async (ops: any[], expectedVersion?: number | null) => {
      if (!app) throw new Error('No app');
      console.log('[useDocument] applyOps called', ops, 'expectedVersion=', expectedVersion);
      const r = await documentService.applyOps(app, ops, expectedVersion ?? null);
      console.log('[useDocument] applyOps result', r);
      return r;
    },
    [app],
  );

  const createDocument = useCallback(
    async (content: string) => {
      if (!app) throw new Error('No app');
      console.log('[useDocument] createDocument called');
      const r = await documentService.createDocument(app, content);
      console.log('[useDocument] createDocument result', r);
      return r;
    },
    [app],
  );

  // Auto-subscribe when contextId/app available
  useEffect(() => {
    if (contextId && app && !hasSubscribedRef.current) subscribe();
    return () => unsubscribe();
  }, [contextId, app, subscribe, unsubscribe]);

  return {
    doc,
    isSubscribed,
    isConnecting,
    error,
    subscribe,
    unsubscribe,
    refresh,
    applyOps,
    createDocument,
  };
}
