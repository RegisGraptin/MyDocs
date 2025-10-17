import { CalimeroApp } from '@calimero-network/calimero-client';
import { createKvClient } from '../features/kv/api';

type Api = any;

async function getApi(app: CalimeroApp): Promise<Api> {
  return await createKvClient(app);
}

// Try multiple method name variants to be resilient against generated client names
async function tryCall(api: Api, names: string[], args?: any) {
  for (const n of names) {
    try {
      if (typeof api[n] === 'function') {
        return await api[n](args);
      }
    } catch (e) {
      // try next
    }
  }
  // fallback: if api.call exists (generic), try that
  if (typeof api.call === 'function') {
    try {
      return await api.call(args?.method || names[0], args?.params || args);
    } catch (e) {
      // fallthrough
    }
  }
  throw new Error('No suitable API method found: ' + names.join(', '));
}

export async function getDocument(app: CalimeroApp) {
  const api = await getApi(app);
  return await tryCall(api, ['get_document', 'getDocument', 'getDocumentView', 'get_document_view']);
}

export async function createDocument(app: CalimeroApp, content: string) {
  const api = await getApi(app);
  return await tryCall(api, ['create_document', 'createDocument'], { content });
}

export async function applyOps(app: CalimeroApp, ops: any[], expected_version?: number | null) {
  const api = await getApi(app);
  return await tryCall(api, ['apply_ops', 'applyOps', 'apply_operations'], { ops, expected_version });
}

export default {
  getDocument,
  createDocument,
  applyOps,
};
