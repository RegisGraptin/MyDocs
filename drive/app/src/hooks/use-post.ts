"use client";

import React, { useEffect, useState } from "react";

import { useCalimero } from "@calimero-network/calimero-client";

import { AbiClient, createKvClient } from "@/features/kv/api";
import { useDocument } from "@/hooks/useDocument";
import postService, { Post } from "@/services/post";

type SaveStatus = "idle" | "saving" | "saved";

export function usePost() {
  const { app, appUrl } = useCalimero();

  const [api, setApi] = useState<AbiClient | null>(null);

  const [currentContext, setCurrentContext] = useState<{
    applicationId: string;
    contextId: string;
    nodeUrl: string;
  } | null>(null);

  const [isLoading, setIsLoading] = React.useState(true);
  const [saveStatus, setSaveStatus] = React.useState<SaveStatus>("idle");
  const [post, setPost] = React.useState<Post | null>(null);
  const [contextId, setContextId] = React.useState<string>("");

  useEffect(() => {
    if (!app) return;
    const initializeApi = async () => {
      try {
        const client = await createKvClient(app);
        setApi(client);
        const contexts = await app.fetchContexts();
        
        console.log("appUrl:", appUrl)
        if (contexts.length > 0) {
          const context = contexts[0];
          setCurrentContext({
            applicationId: context.applicationId,
            contextId: context.contextId,
            nodeUrl: appUrl!,
          });
        }
        // fetch active match id if any
        try {
          const documentData = await client.getDocument();
          if (documentData) {
            console.log(
              "[usePost] fetched document data during init",
              documentData
            );
          }
        } catch (e) {
          // ignore if method not available yet or no active match
        }
      } catch (error) {
        console.error("Failed to create API client:", error);
        window.alert("Failed to initialize API client");
      }
    };
    initializeApi();
  }, [app, appUrl]);

  // Subscribe to on-chain document events for live sync
  const { doc, isSubscribed, error, subscribe, unsubscribe, refresh } =
    useDocument({
      contextId,
      onUpdate: (d) => {
        console.log("[usePost] document event received", d);
        if (d && typeof d.content === "string") {
          try {
            const parsed: Post = JSON.parse(d.content);
            setPost(parsed);
            console.log("[usePost] post updated from chain", parsed);
          } catch (e) {
            console.warn(
              "[usePost] failed to parse on-chain document content",
              e
            );
          }
        }
      },
    });

  const savePost = React.useCallback(
    async (values: Partial<Post>) => {
      try {
        setSaveStatus("saving");
        console.log("[usePost] saving post", { values, hasApp: !!app });
        // Pass app when available to persist on-chain
        if (app) {
          await postService.save(values, app);
        } else {
          await postService.save(values);
        }

        setSaveStatus("saved");
        console.log("[usePost] save completed");

        // after saving, refresh on-chain state if possible
        if (app) {
          try {
            const d = await refresh();
            console.log("[usePost] refresh after save", d);
          } catch (e) {
            console.warn("[usePost] refresh after save failed", e);
          }
        }

        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Save failed:", error);
        setSaveStatus("idle");
      }
    },
    [app, refresh]
  );

  const debouncedSave = React.useMemo(
    () => debounce(savePost, 2000),
    [savePost]
  );

  React.useEffect(() => {
    (async () => {
      // prefer on-chain get only if we know there is at least one context available
      if (app) {
        try {
          const saved =
            typeof window !== "undefined"
              ? window.localStorage.getItem("calimero_contextId")
              : null;
          const contexts = await app.fetchContexts();
          let hasContext = false;
          if (saved)
            hasContext = contexts.some((c: any) => c.contextId === saved);
          if (!hasContext && contexts && contexts.length > 0) hasContext = true;

          if (hasContext) {
            // ensure contextId is set so other hooks can subscribe
            let selected = null as any;
            if (saved)
              selected =
                contexts.find((c: any) => c.contextId === saved) || null;
            if (!selected && contexts && contexts.length > 0)
              selected = contexts[0];
            if (selected) {
              setContextId(selected.contextId);
              try {
                if (typeof window !== "undefined")
                  window.localStorage.setItem(
                    "calimero_contextId",
                    selected.contextId
                  );
              } catch {}
            }

            try {
              const p = await postService.get(app);
              setPost(p);
              setIsLoading(false);
              console.log("[usePost] loaded post from chain", p);
              return;
            } catch (e) {
              console.warn(
                "[usePost] failed to load post from chain, falling back",
                e
              );
            }
          } else {
            console.log(
              "[usePost] no Calimero contexts found, skipping on-chain load"
            );
          }
        } catch (e) {
          console.warn(
            "[usePost] error checking contexts, falling back to local",
            e
          );
        }
      }

      const local = await postService.get();
      setPost(local);
      setIsLoading(false);
      console.log("[usePost] loaded post from local", local);
    })();
  }, [app]);

  return {
    savePost,
    debouncedSave,
    saveStatus,
    isLoading,
    post,
    isSubscribed,
    error,
    contextId,
  };
}

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}
