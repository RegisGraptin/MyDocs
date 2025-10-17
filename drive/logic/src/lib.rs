//! Minimal crate root; document logic is implemented in `src/document.rs`.

#![allow(clippy::len_without_is_empty)]

use calimero_sdk::serde::{Serialize};
use thiserror::Error;

pub mod events;
pub mod document;

pub use document::{DocumentView, DocOp};
pub use events::Event;

// Backwards-compatible export: some modules still refer to `GameError`.
pub use AppError as GameError;

/// Generic application error type retained for compatibility
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
