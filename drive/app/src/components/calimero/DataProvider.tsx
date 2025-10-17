"use client";

import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';
import { useEffect, useState } from 'react';

export function DataProvider({ children }: { children: React.ReactNode }) {

    const clientAppId = '98SmzgEyQv4paT1PanG7VCSUPCjXoN1WM1skNyR9pE22';
    const [applicationPath, setApplicationPath] = useState<string | null>(null);

    // Only access `window` on the client
    useEffect(() => {
        setApplicationPath(window.location?.pathname || '/');
    }, []);

    // While on the server (or before mount), don't render provider that accesses window
    if (!applicationPath) return null;

    return (
        <CalimeroProvider
            clientApplicationId={clientAppId}
            applicationPath={applicationPath}
            mode={AppMode.MultiContext}
        >
            <ToastProvider>
                {children}
            </ToastProvider>
        </CalimeroProvider>
    );
}