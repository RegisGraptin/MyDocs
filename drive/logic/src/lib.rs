//! Single-file ABI-visible crate root for the shared document application.
//!
//! This file intentionally contains the state, events and logic inline so the
//! build script (which reads `src/lib.rs`) can emit a complete ABI without
//! needing to parse module files.

#![allow(clippy::len_without_is_empty)]

use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_storage::env;

use calimero_sdk::serde::{Deserialize, Serialize};
use thiserror::Error;

use bs58;

// ============================================================================
// EVENTS
// ============================================================================

#[calimero_sdk::app::event]
pub enum Event {
    /// Emitted when the shared document is created
    DocumentCreated { content: String, version: u64 },
    /// Emitted when the shared document is updated
    DocumentUpdated { content: String, version: u64, editor: String },

    UserPing {addr: String, last_seen_ms: u64},
}

// ============================================================================
// TYPES
// ============================================================================

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct DocumentView {
    pub content: String,
    pub version: u64,
    pub updated_ms: u64,
    pub last_editor: Option<String>,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
struct Element {
    uid: u128,
    ch: u32,
    visible: bool,
    created_ms: u64,
    editor: String,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct PresenceEntry {
    pub address: String,
    pub last_seen_ms: u64,
    /// Optional payload provided by the client (can contain a short status or nonce)
    pub payload: String,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub enum DocOp {
    Insert { index: usize, content: String },
    Delete { index: usize, len: usize },
}

// Generic AppError for compatibility
#[derive(Debug, Error, Serialize)]
#[serde(crate = "calimero_sdk::serde")]
#[serde(tag = "kind", content = "data")]
pub enum AppError {
    #[error("not found: {0}")]
    NotFound(String),
    #[error("invalid input: {0}")]
    Invalid(&'static str),
    #[error("forbidden: {0}")]
    Forbidden(&'static str),
}

pub use AppError as GameError;

// ============================================================================
// STATE
// ============================================================================

#[app::state(emits = Event)]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct SharedDocument {
    content: String,
    version: u64,
    updated_ms: u64,
    last_editor: Option<String>,
    elems: Vec<Element>,
    // presence entries for active users
    presence_entries: Vec<PresenceEntry>,
    id_nonce: u64,
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

fn encode_executor_address() -> app::Result<String> {
    let id = calimero_sdk::env::executor_id();
    Ok(bs58::encode(&id).into_string())
}

fn make_uid(now: u64, nonce: u64, editor: &str) -> u128 {
    let mut hash_part: u128 = 0;
    if let Ok(decoded) = bs58::decode(editor).into_vec() {
        for (i, b) in decoded.iter().take(16).enumerate() {
            hash_part |= (*b as u128) << ((15 - i) * 8);
        }
    }
    let high = (now as u128) << 64;
    let mid = (nonce as u128) << 48;
    high | mid | (hash_part & 0xffffffffffff)
}

#[app::logic]
impl SharedDocument {
    #[app::init]
    pub fn init() -> SharedDocument {
        SharedDocument {
            content: String::new(),
            version: 0,
            updated_ms: env::time_now(),
            last_editor: None,
            elems: Vec::new(),
            presence_entries: Vec::new(),
            id_nonce: 0,
        }
    }

    pub fn create_document(&mut self, content: String) -> app::Result<u64> {
        if content.is_empty() {
            app::bail!(GameError::Invalid("empty document content"));
        }
        self.version = self.version.wrapping_add(1);
        self.content = content.clone();
        self.updated_ms = env::time_now();
        let editor_addr = encode_executor_address()?;
        self.last_editor = Some(editor_addr.clone());

        self.elems.clear();
        self.id_nonce = 0;
        let now = self.updated_ms;
        for ch in content.chars() {
            let uid = make_uid(now, self.id_nonce, &editor_addr);
            self.id_nonce = self.id_nonce.wrapping_add(1);
            self.elems.push(Element { uid, ch: ch as u32, visible: true, created_ms: now, editor: editor_addr.clone() });
        }

    app::emit!(Event::DocumentCreated { content: self.content.clone(), version: self.version });
        Ok(self.version)
    }

    pub fn apply_ops(&mut self, ops: Vec<DocOp>, expected_version: Option<u64>) -> app::Result<u64> {
        if let Some(ev) = expected_version { if ev != self.version { app::bail!(GameError::Invalid("version mismatch")); } }
        let editor_addr = encode_executor_address()?;
        let now = env::time_now();

        for op in ops.into_iter() {
            match op {
                DocOp::Insert { index, content } => {
                    let mut insert_elems = Vec::new();
                    for ch in content.chars() {
                        let uid = make_uid(now, self.id_nonce, &editor_addr);
                        self.id_nonce = self.id_nonce.wrapping_add(1);
                        insert_elems.push(Element { uid, ch: ch as u32, visible: true, created_ms: now, editor: editor_addr.clone() });
                    }
                    let vis_positions: Vec<usize> = self.elems.iter().enumerate().filter(|(_, e)| e.visible).map(|(i, _)| i).collect();
                    let insert_pos = if index == 0 { 0 } else { vis_positions.get(index.wrapping_sub(1)).map(|p| p+1).unwrap_or(self.elems.len()) };
                    self.elems.splice(insert_pos..insert_pos, insert_elems);
                }
                DocOp::Delete { index, len } => {
                    let mut remaining = len;
                    let mut cur_vis = 0usize;
                    for e in self.elems.iter_mut() {
                        if !e.visible { continue; }
                        if cur_vis >= index && remaining > 0 { e.visible = false; remaining = remaining.saturating_sub(1); }
                        cur_vis = cur_vis.saturating_add(1);
                        if remaining == 0 { break; }
                    }
                }
            }
        }

        let mut visible: Vec<&Element> = self.elems.iter().filter(|e| e.visible).collect();
        visible.sort_by(|a, b| a.uid.cmp(&b.uid));

        self.content = visible.iter().map(|e| char::from_u32(e.ch).unwrap_or('\u{FFFD}')).collect();
        self.version = self.version.wrapping_add(1);
        self.updated_ms = now;
        self.last_editor = Some(editor_addr.clone());

    app::emit!(Event::DocumentUpdated { content: self.content.clone(), version: self.version, editor: editor_addr.clone() });
        Ok(self.version)
    }

    pub fn get_document(&self) -> app::Result<DocumentView> {
        Ok(DocumentView { content: self.content.clone(), version: self.version, updated_ms: self.updated_ms, last_editor: self.last_editor.clone() })
    }

    // Presence methods embedded in SharedDocument
    /// Ping from the current executor. Records the executor address, payload and timestamp.
    pub fn ping(&mut self, addr: String, payload: String) -> app::Result<()> {
        let now = env::time_now();

        for e in self.presence_entries.iter_mut() {
            if e.address == addr {
                e.last_seen_ms = now;
                e.payload = payload.clone();
                return Ok(());
            }
        }
        self.presence_entries.push(PresenceEntry { address: addr.clone(), last_seen_ms: now, payload });
        
        app::emit!(Event::UserPing { addr: addr.clone(), last_seen_ms: now });
        Ok(())
    }

    /// Return active entries within the provided TTL (milliseconds). If ttl_ms is None, returns all entries.
    pub fn get_active_users(&self, ttl_ms: Option<u64>) -> app::Result<Vec<PresenceEntry>> {
        let now = env::time_now();
        let mut out: Vec<PresenceEntry> = Vec::new();
        for e in self.presence_entries.iter() {
            if let Some(ttl) = ttl_ms {
                if e.last_seen_ms + ttl >= now {
                    out.push(e.clone());
                }
            } else {
                out.push(e.clone());
            }
        }
        Ok(out)
    }

    /// Cleaning helper to remove stale entries older than ttl_ms
    pub fn purge_stale(&mut self, ttl_ms: u64) -> app::Result<()> {
        let now = env::time_now();
        self.presence_entries.retain(|e| e.last_seen_ms + ttl_ms >= now);
        Ok(())
    }
}

