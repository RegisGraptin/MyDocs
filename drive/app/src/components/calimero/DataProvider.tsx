"use client";

import { useEffect, useState } from 'react';

import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

export function DataProvider({ children }: { children: React.ReactNode }) {

    const clientAppId = '9k5X9NoikqbWQM1YoN9gj3HYN7cAWXyBzRQRuyZDDFtN';
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