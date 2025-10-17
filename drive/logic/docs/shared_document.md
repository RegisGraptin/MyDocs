# Shared Document Backend

This document describes the `SharedDocument` backend implemented in `src/document.rs`.
It's a minimal single-document state suitable for a decentralized collaborative editor backed by Calimero.

## API (backend methods exposed via Calimero app logic):

- create_document(content: String) -> Result<u64>
  - Creates or overwrites the document with `content` and returns the new version number.
  - Emits `Event::DocumentCreated { content: &str, version }`.
  - Fails with `GameError::Invalid("empty document content")` for empty content.

- apply_ops(ops: Vec<DocOp>, expected_version: Option<u64>) -> Result<u64>
  - Applies a list of edit operations (insert/delete). Each op is applied in a deterministic manner.
  - Ops are defined as:
    - `DocOp::Insert { index: usize, content: String }` — insert `content` at logical index `index` (0-based)
    - `DocOp::Delete { index: usize, len: usize }` — delete `len` characters starting at logical index `index`
  - An optional `expected_version` can be provided to enable optimistic concurrency: if the server's version differs, the call fails.
  - Returns the new document version on success and emits `Event::DocumentUpdated { content: &str, version, editor: &str }`.

- get_document() -> Result<DocumentView>
  - Returns `DocumentView { content, version, updated_ms, last_editor }`.

## Data shapes:

DocumentView {
  content: String,
  version: u64,
  updated_ms: u64, // ms timestamp
  last_editor: Option<String>, // executor address (hex-encoded)
}

## Events:

- Event::DocumentCreated { content: &str, version: u64 }
- Event::DocumentUpdated { content: &str, version: u64, editor: &str }

## Notes about editor identity

- The backend records the executor address (hex-encoded executor id) as `last_editor`. This is consistent with decentralized runtimes where the executor address is the canonical identifier for the actor performing updates.

## Frontend integration notes:

- Use `get_document` to fetch initial state.
- Subscribe to emitted `DocumentUpdated` and `DocumentCreated` events in the Calimero app runtime to receive live updates.

### New recommended integration flow (optimistic collaborative editing):

1. Client fetches initial document via `get_document()` and keeps `version`.
2. On local edits, client prepares a small set of operations (`DocOp`) and calls `apply_ops(ops, Some(current_version))`.
   - If the call succeeds, client updates its local version and continues.
   - If the call returns a version mismatch error, the client should re-fetch the document, rebase local edits, and retry.
3. Clients should subscribe to `DocumentUpdated` events to apply remote edits in real-time.

## Concurrency model & notes:

- The backend uses a tombstone-based sequence of character elements. Each inserted character gets a UID derived from (timestamp, nonce, editor hash) to provide deterministic ordering when concurrent inserts target the same logical position.
- Deletes mark elements as invisible (tombstones). The client sees the logical sequence of visible characters.
- This is a lightweight CRDT-like approach intended to allow near-simultaneous edits from multiple writers without central locking. It is not a full CRDT implementation (no causal delivery or merge of out-of-order operations), but it provides a practical, deterministic merging behavior for most interactive editing scenarios.
- For production-grade, globally convergent editing across partitions, consider integrating a proven CRDT library (e.g., `crdts` crate or a Yjs/Automerge integration) and storing the CRDT state rather than a custom tombstone list.

## Examples

Insert text at position 5:

```rust
use battleship::document::DocOp;

let ops = vec![DocOp::Insert { index: 5, content: "hello".to_string() }];
let new_version = state.apply_ops(ops, Some(current_version))?;
```

Delete 3 characters starting at position 10:

```rust
let ops = vec![DocOp::Delete { index: 10, len: 3 }];
let new_version = state.apply_ops(ops, Some(current_version))?;
```

## Next steps and improvements:

- Add a fully-featured CRDT implementation (e.g., RGA, Logoot, or integrate `crdts`/Automerge) for global convergence.
- Add permission checks and role-based access control.
- Add streaming/delta APIs for large documents.
- Add tests for event emission and storage persistence.
