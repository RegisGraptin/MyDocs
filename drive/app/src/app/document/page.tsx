"use client"

import React, { useEffect, useState } from 'react';
import { useCalimero } from '@calimero-network/calimero-client';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, useToast } from '@calimero-network/mero-ui';
import documentService from '../../services/document';

export default function DocumentPage() {
  const { app, isAuthenticated } = useCalimero();
  const { show } = useToast();

  const [content, setContent] = useState('');
  const [version, setVersion] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    // auto-load
    (async () => {
      try {
        if (!app) return;
        const res = await documentService.getDocument(app);
        if (res && res.content) {
          setContent(res.content);
          setVersion(res.version ?? null);
        }
      } catch (e) {
        // ignore if not deployed
      }
    })();
  }, [app, isAuthenticated]);

  const doCreate = async () => {
    if (!app) return;
    try {
      const r = await documentService.createDocument(app, content);
      show({ title: 'Document created', variant: 'success' });
      if (r && r.version) setVersion(r.version);
    } catch (e) {
      show({ title: e instanceof Error ? e.message : 'Failed', variant: 'error' });
    }
  };

  const doRefresh = async () => {
    if (!app) return;
    try {
      const res = await documentService.getDocument(app);
      if (res && res.content) {
        setContent(res.content);
        setVersion(res.version ?? null);
        show({ title: 'Document loaded', variant: 'success' });
      }
    } catch (e) {
      show({ title: 'Failed to load document', variant: 'error' });
    }
  };

  const doApply = async () => {
    if (!app) return;
    try {
      // simple diff: send a delete of the whole doc then insert current content
      const ops = [] as any[];
      if (version === null) {
        // treat as create
        await doCreate();
        return;
      }
      ops.push({ index: 0, content: content, type: 'Insert' });
      const r = await documentService.applyOps(app, ops, version ?? undefined);
      show({ title: 'Ops applied', variant: 'success' });
      if (r && r.version) setVersion(r.version);
    } catch (e) {
      show({ title: e instanceof Error ? e.message : 'Apply failed', variant: 'error' });
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <Card>
        <CardHeader>
          <CardTitle>Shared Document</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: 8 }}>
            <Input value={version !== null && version !== undefined ? String(version) : ''} disabled placeholder="version" />
          </div>
          <div style={{ marginBottom: 8 }}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', height: 300 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={doRefresh}>Load</Button>
            <Button onClick={doCreate} variant="success">
              Create
            </Button>
            <Button onClick={doApply} variant="primary">
              Apply Ops
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
