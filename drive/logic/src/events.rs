// ============================================================================
// EVENTS MODULE - Domain events for decoupling
// ============================================================================

#[calimero_sdk::app::event]
pub enum Event<'a> {
    /// Emitted when the shared document is created
    DocumentCreated { content: &'a str, version: u64 },
    /// Emitted when the shared document is updated
    DocumentUpdated { content: &'a str, version: u64, editor: &'a str },
}
