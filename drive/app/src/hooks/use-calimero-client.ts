"use client";

import { useEffect, useState } from "react";

import { useCalimero } from "@calimero-network/calimero-client";

import { AbiClient, createKvClient } from "@/features/kv/api";

interface CalimeroClientState {
  client: AbiClient | null;
  context: {
    applicationId: string;
    contextId: string;
    nodeUrl: string;
  } | null;
  isReady: boolean;
  error?: string;
}

/**
 * Initializes the Calimero KV client (AbiClient) and selects an active context.
 * Returns a ready-to-use client + context info.
 */
export function useCalimeroClient(): CalimeroClientState {
  const { app, appUrl } = useCalimero();
  const [client, setClient] = useState<AbiClient | null>(null);
  const [context, setContext] = useState<CalimeroClientState["context"]>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!app) {
      setIsReady(false);
      return;
    }

    const init = async () => {
      try {
        console.log("[useCalimeroClient] Initializing KV client…");
        const kvClient = await createKvClient(app);
        setClient(kvClient);

        const contexts = await app.fetchContexts();
        if (!contexts.length) {
          console.warn("[useCalimeroClient] No contexts found");
          setIsReady(true);
          return;
        }

        const selected = contexts[0];
        setContext({
          applicationId: selected.applicationId,
          contextId: selected.contextId,
          nodeUrl: appUrl!,
        });

        setIsReady(true);
      } catch (err: any) {
        console.error("[useCalimeroClient] Initialization failed", err);
        setError(err?.message || "Failed to initialize Calimero client");
        setIsReady(true);
      }
    };

    init();
  }, [app, appUrl]);

  return { client, context, isReady, error };
}
