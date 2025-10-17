//! Shared Document Module
//!
//! This module implements a single shared document backend suitable for a
//! collaborative, decentralized "Google Docs"-style dapp using the Calimero
//! SDK. It provides a minimal, safe API to create, update and read a single
//! document and emits events on changes so frontends can react in real-time.
//!
//! Design contract (small):
//! - Inputs: text updates (full content replacement), caller executor id
//! - Outputs: document content, version number, timestamp, last editor
//! - Error modes: forbidden (none for single doc), invalid input (empty), not-found
//! - Success: returns current version after update

use calimero_sdk::app;
use calimero_sdk::borsh::{BorshDeserialize, BorshSerialize};
use calimero_storage::env;

use calimero_sdk::serde::{Deserialize, Serialize};

use crate::events::Event;
use bs58;

/// View returned to clients for the shared document
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub struct DocumentView {
    /// Full document content as UTF-8 text
    pub content: String,
    /// Monotonic version number
    pub version: u64,
    /// Last update timestamp (ms)
    pub updated_ms: u64,
    /// Last editor (base58 public key) if available
    pub last_editor: Option<String>,
}

/// Internal application state for the shared document
#[app::state(emits = for<'a> Event<'a>)]
#[derive(Debug, BorshSerialize, BorshDeserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
pub struct SharedDocument {
    /// Current content
    // Content is derived from `elems` (ordered by uid) where `visible == true`.
    // We keep `content` as a cached convenience string to make reads fast.
    content: String,
    /// Monotonic version
    version: u64,
    /// Last update timestamp
    updated_ms: u64,
    /// Last editor public key (base58)
    /// Last editor address (executor address as base58 if possible, else hex)
    last_editor: Option<String>,
    /// Elements for collaborative editing (tombstone-based sequence)
    elems: Vec<Element>,
    /// Counter for generating unique u128 ids when multiple inserts occur in same ms
    id_nonce: u64,
}

#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
struct Element {
    uid: u128,
    // store as u32 for Borsh compatibility (char is not directly Borsh-serializable)
    ch: u32,
    visible: bool,
    created_ms: u64,
    editor: String,
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
            id_nonce: 0,
        }
    }

    /// Create or overwrite the shared document with initial content.
    /// Returns the new version number.
    /// Create or overwrite the shared document with initial content.
    /// This resets the internal element sequence and rebuilds it from the
    /// provided text. Emits DocumentCreated.
    pub fn create_document(&mut self, content: String) -> app::Result<u64> {
        if content.is_empty() {
            app::bail!(crate::GameError::Invalid("empty document content"));
        }

        self.version = self.version.wrapping_add(1);
        self.content = content.clone();
        self.updated_ms = env::time_now();
        let editor_addr = encode_executor_address()?;
        self.last_editor = Some(editor_addr.clone());

        // Rebuild elements from content
        self.elems.clear();
        self.id_nonce = 0;
        let now = self.updated_ms;
        for ch in content.chars() {
            let uid = make_uid(now, self.id_nonce, &editor_addr);
            self.id_nonce = self.id_nonce.wrapping_add(1);
            self.elems.push(Element {
                uid,
                ch: ch as u32,
                visible: true,
                created_ms: now,
                editor: editor_addr.clone(),
            });
        }

        app::emit!(Event::DocumentCreated { content: &self.content, version: self.version });
        Ok(self.version)
    }

    /// Update the shared document (full replacement). Returns the new version.
    /// Apply a list of edit operations (insertion/deletion). This API is
    /// designed for collaborative use: operations contain an index and are
    /// applied with deterministic ordering when concurrent inserts happen at
    /// the same position (ordered by uid = timestamp/nonce/editor).
    pub fn apply_ops(&mut self, ops: Vec<DocOp>, expected_version: Option<u64>) -> app::Result<u64> {
        if let Some(ev) = expected_version {
            if ev != self.version {
                app::bail!(crate::GameError::Invalid("version mismatch"));
            }
        }

        let editor_addr = encode_executor_address()?;
        let now = env::time_now();

        // Convert operations into element modifications
        for op in ops.into_iter() {
            match op {
                DocOp::Insert { index, content } => {
                    // Break into chars and generate uids; insert new elems into the logical position
                    let mut insert_elems = Vec::new();
                    for ch in content.chars() {
                        let uid = make_uid(now, self.id_nonce, &editor_addr);
                        self.id_nonce = self.id_nonce.wrapping_add(1);
                        insert_elems.push(Element {
                            uid,
                            ch: ch as u32,
                            visible: true,
                            created_ms: now,
                            editor: editor_addr.clone(),
                        });
                    }

                    // Determine physical index by reconstructing visible sequence
                    let vis_positions: Vec<usize> = self.elems.iter().enumerate()
                        .filter(|(_, e)| e.visible)
                        .map(|(i, _)| i)
                        .collect();

                    let insert_pos = if index == 0 { 0 } else { vis_positions.get(index.wrapping_sub(1)).map(|p| p+1).unwrap_or(self.elems.len()) };

                    // Insert the new elements at insert_pos in the elems vector
                    self.elems.splice(insert_pos..insert_pos, insert_elems);
                }
                DocOp::Delete { index, len } => {
                    // Mark visible elements as tombstoned starting from index
                    let mut remaining = len;
                    let mut cur_vis = 0usize;
                    for e in self.elems.iter_mut() {
                        if !e.visible { continue; }
                        if cur_vis >= index && remaining > 0 {
                            e.visible = false;
                            remaining = remaining.saturating_sub(1);
                        }
                        cur_vis = cur_vis.saturating_add(1);
                        if remaining == 0 { break; }
                    }
                }
            }
        }

        // After applying ops, rebuild content deterministically: sort by (created_ms, uid, editor) but maintain existing order of elems vector
        // Here elems vector already contains insertion order; for concurrent inserts at same logical index they were inserted by arrival order. We ensure deterministic tie-breakers using uid when reconstructing.
    let mut visible: Vec<&Element> = self.elems.iter().filter(|e| e.visible).collect();
        // Sort visible by uid to ensure deterministic ordering across nodes
        visible.sort_by(|a, b| a.uid.cmp(&b.uid));

        self.content = visible
            .iter()
            .map(|e| char::from_u32(e.ch).unwrap_or('\u{FFFD}'))
            .collect();

        self.version = self.version.wrapping_add(1);
        self.updated_ms = now;
        self.last_editor = Some(editor_addr.clone());

        app::emit!(Event::DocumentUpdated { content: &self.content, version: self.version, editor: &editor_addr });
        Ok(self.version)
    }

    /// Read the current document view
    pub fn get_document(&self) -> app::Result<DocumentView> {
        Ok(DocumentView {
            content: self.content.clone(),
            version: self.version,
            updated_ms: self.updated_ms,
            last_editor: self.last_editor.clone(),
        })
    }
}

/// Edit operation types accepted by the backend
#[derive(Debug, Clone, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[borsh(crate = "calimero_sdk::borsh")]
#[serde(crate = "calimero_sdk::serde")]
pub enum DocOp {
    Insert { index: usize, content: String },
    Delete { index: usize, len: usize },
}

fn encode_executor_address() -> app::Result<String> {
    // Use the raw executor id bytes and base58-encode them for a compact human-friendly address
    let id = calimero_sdk::env::executor_id();
    Ok(bs58::encode(&id).into_string())
}

fn make_uid(now: u64, nonce: u64, editor: &str) -> u128 {
    // Compose a uid from timestamp, nonce and a small hash of editor for tie-breaking.
    // We'll base the hash on the first 16 bytes of the base58-decoded editor id when available.
    let mut hash_part: u128 = 0;
    if let Ok(decoded) = bs58::decode(editor).into_vec() {
        for (i, b) in decoded.iter().take(16).enumerate() {
            hash_part |= (*b as u128) << ((15 - i) * 8);
        }
    }
    let high = (now as u128) << 64;
    let mid = (nonce as u128) << 48; // some space
    high | mid | (hash_part & 0xffffffffffff)
}
