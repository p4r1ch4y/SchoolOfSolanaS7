use crate::fuzz_accounts::FuzzAccounts;
use crate::types::*;
use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

#[derive(TridentInstruction, Default)]
#[program_id("FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv")]
#[discriminator([244u8, 168u8, 68u8, 26u8, 128u8, 220u8, 118u8, 153u8])]
pub struct InitializeJournalInstruction {
    pub accounts: InitializeJournalInstructionAccounts,
    pub data: InitializeJournalInstructionData,
}

/// Instruction Accounts
#[derive(Debug, Clone, TridentAccounts, Default)]
#[instruction_data(InitializeJournalInstructionData)]
#[storage(FuzzAccounts)]
pub struct InitializeJournalInstructionAccounts {
    #[account(mut)]
    pub journal: TridentAccount,

    #[account(mut, signer)]
    pub user: TridentAccount,

    #[account(address = "11111111111111111111111111111111")]
    pub system_program: TridentAccount,
}

/// Instruction Data
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct InitializeJournalInstructionData {}

/// Implementation of instruction setters for fuzzing
///
/// Provides methods to:
/// - Set instruction data during fuzzing
/// - Configure instruction accounts during fuzzing
/// - (Optional) Set remaining accounts during fuzzing
///
/// Docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/writting-fuzz-test/
impl InstructionHooks for InitializeJournalInstruction {
    type IxAccounts = FuzzAccounts;
}
