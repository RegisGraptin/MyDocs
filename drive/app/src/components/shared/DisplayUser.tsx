"use client";

import { useEffect, useRef, useState } from "react";

import { useCalimero } from "@calimero-network/calimero-client";
import { useAccount } from "wagmi";

import { useCalimeroClient } from "@/hooks/use-calimero-client";

type PresenceEntry = {
  address: string;
  last_seen_ms: number;
  payload: string;
};

const shortAddr = (a: string) => {
  if (!a) return "";
  return a.length > 12 ? `${a.slice(0, 6)}...${a.slice(-4)}` : a;
};

export const DisplayUser = () => {
  const { app, appUrl } = useCalimero();
  const { client, isReady, context } = useCalimeroClient();
  const { address: userAddress } = useAccount();
  const userAddressRef = useRef<string | null>(null);

  const [activeUsers, setActiveUsers] = useState<PresenceEntry[]>([]);

  const currentSubscriptionRef = useRef<string | null>(null);

  const pingInterval = useRef<number | null>(null);
  const fetchInterval = useRef<number | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasSubscribedRef = useRef(false);
  const isProcessingEvent = useRef(false);

  useEffect(() => {
    userAddressRef.current = userAddress ?? null;
  }, [userAddress]);

  // const parsePingEvent = useCallback((eventData: any): PingEvent | null => {
  //   try {
  //     if (!eventData) return null;

  //     // Handle direct event structure
  //     if (eventData.event_type) {
  //       switch (eventData.event_type) {
  //         case 'UserPing':
  //           return {
  //             address: eventData.addr || '',
  //             last_seen_ms: eventData.last_seen_ms || '',
  //             payload: eventData.payload || '',
  //           };
  //       }
  //     }

  //     // Handle execution events array
  //     if (eventData.events && Array.isArray(eventData.events)) {
  //       for (const executionEvent of eventData.events) {
  //         const kind = executionEvent.kind;
  //         let raw = executionEvent.data;

  //         if (!kind || raw === undefined || raw === null) continue;

  //         // Try decode byte-array payload
  //         try {
  //           if (Array.isArray(raw) && raw.every((n: any) => typeof n === 'number')) {
  //             const decoder = new TextDecoder();
  //             const jsonStr = decoder.decode(new Uint8Array(raw));
  //             const payload = JSON.parse(jsonStr);
  //             if (kind === 'UserPing') {
  //               return {
  //                 address: eventData.addr || '',
  //                 last_seen_ms: eventData.last_seen_ms || '',
  //                 payload: eventData.payload || '',
  //               };
  //             }
  //           }
  //         } catch (e) {
  //           // ignore decode errors
  //           console.log("error decoding event", e);
  //         }
  //       }
  //     }
  //   } catch (e) {
  //     console.error('Error parsing document event:', e);
  //   }
  //   return null;
  // }, []);

  // const eventCallback = useCallback(
  //   async (event: any) => {
  //     console.log('[useUser] eventCallback received', event.type, event.data ? Object.keys(event.data) : 'no data');
  //     if (isProcessingEvent.current) {
  //       return;
  //     }
  //     isProcessingEvent.current = true;
  //     try {
  //       if (event.type === 'StateMutation' || event.type === 'ExecutionEvent') {
  //         const parsed = parsePingEvent(event.data);
  //         console.log('[useUser] parsed event ->', parsed);
  //         if (parsed) {
  //           setActiveUsers((prev) => {
  //             const index = prev.findIndex(u => u.address === parsed.address);

  //             if (index !== -1) {
  //               // update existing user
  //               const updated = [...prev];
  //               updated[index] = { ...updated[index], ...parsed };
  //               return updated;
  //             } else {
  //               // add new user
  //               return [...prev, parsed];
  //             }
  //           });
  //         }
  //       }
  //     } catch (e) {
  //       console.error('Error handling user event', e);
  //       setError('Error processing user event');
  //     } finally {
  //       isProcessingEvent.current = false;
  //     }
  //   },
  //   [parsePingEvent],
  // );

  // const subscribe = useCallback(() => {
  //   if (!app  || hasSubscribedRef.current || isConnecting) return;
  //   setIsConnecting(true);
  //   try {
  //     if (currentSubscriptionRef.current) {
  //       app.unsubscribeFromEvents([currentSubscriptionRef.current]);
  //     }
  //     app.subscribeToEvents([context?.contextId], eventCallback);
  //     currentSubscriptionRef.current = context?.contextId;
  //     hasSubscribedRef.current = true;
  //     setIsConnecting(false);
  //     console.log('[useDocument] subscribed successfully to', context?.contextId);
  //   } catch (e) {
  //     console.error('Failed to subscribe to document events:', e);
  //     setError('Failed to subscribe');
  //     setIsConnecting(false);
  //   }
  // }, [app, context, eventCallback, isConnecting]);

  // useEffect(() => {
  //   if (context && app && !hasSubscribedRef.current) subscribe();
  //   // return () => unsubscribe();
  // }, [context, app, subscribe]);

  // useEffect(() => {

  //   if (!isReady) {
  //     console.log("Loading client");
  //   }

  //   let mounted = true;

  //   async function fetchActive() {
  //     if (!client) return;
  //     try {
  //       // try to call get_active_users — if not available, backend will return an error and we ignore it
  //       const res = await client.getActiveUsers({ ttl_ms: 15000 });
  //       setActiveUsers(res);

  //       console.log("fetch data")
  //     } catch (e) {
  //       // ignore — presence not available or not yet generated in ABI
  //       console.log("e:", e)
  //     }
  //   }

  //   async function sendPing() {
  //     if (!client) return;
  //     const addr = userAddressRef.current;
  //     if (addr) {
  //       console.log("ref address:", addr);
  //       await client.ping({ addr: addr, payload: 'web' });
  //       console.log("ping sent")
  //     } else {
  //       console.log("No ping")
  //     }
  //   }

  //   // obtain and cache context once when `app` is available
  //   (async () => {
  //     if (!client) return;
  //     try {
  //       // initial fetch + ping
  //       await sendPing();
  //       await fetchActive();

  //       // set intervals: fetch every 5s, ping every 3s
  //       fetchInterval.current = window.setInterval(fetchActive, 10000);
  //       pingInterval.current = window.setInterval(sendPing, 10000);
  //     } catch (e) {
  //       // ignore
  //       console.log("error catch", e)
  //     }
  //   })();

  //   return () => {
  //     mounted = false;
  //     if (fetchInterval.current) window.clearInterval(fetchInterval.current);
  //     if (pingInterval.current) window.clearInterval(pingInterval.current);
  //   };
  // }, [client, isReady, userAddress]);

  interface PingEvent {
    address: string;
    last_seen_ms: number;
    payload: string;
  }

  return (
    <div className="flex items-center gap-3">
      {activeUsers.length > 0 ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-600 dark:text-neutral-300">
            Online:
          </span>
          <div className="flex gap-2">
            {activeUsers.slice(0, 5).map((a) => (
              <div
                key={a.address}
                title={`${a.address} • ${new Date(a.last_seen_ms).toLocaleTimeString()}`}
                className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded text-xs"
              >
                {shortAddr(a.address)}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-sm text-neutral-500">No users</div>
      )}
    </div>
  );
};
