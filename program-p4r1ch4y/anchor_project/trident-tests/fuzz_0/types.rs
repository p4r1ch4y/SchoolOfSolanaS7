use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

/// File containing all custom types which can be used
/// in transactions and instructions or invariant checks.
///
/// You can define your own custom types here.

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct Journal {
    pub owner: TridentPubkey,

    pub streak: u64,

    pub last_logged: i64,

    pub created_at: i64,

    pub last_idea: String,
}
