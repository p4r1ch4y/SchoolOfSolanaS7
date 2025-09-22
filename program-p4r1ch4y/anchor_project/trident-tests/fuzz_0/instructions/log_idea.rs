use crate::fuzz_accounts::FuzzAccounts;
use crate::types::*;
use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

#[derive(TridentInstruction, Default)]
#[program_id("FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv")]
#[discriminator([28u8, 108u8, 71u8, 148u8, 96u8, 237u8, 19u8, 199u8])]
pub struct LogIdeaInstruction {
    pub accounts: LogIdeaInstructionAccounts,
    pub data: LogIdeaInstructionData,
}

/// Instruction Accounts
#[derive(Debug, Clone, TridentAccounts, Default)]
#[instruction_data(LogIdeaInstructionData)]
#[storage(FuzzAccounts)]
pub struct LogIdeaInstructionAccounts {
    #[account(mut)]
    pub journal: TridentAccount,

    #[account(mut, signer)]
    pub user: TridentAccount,
}

/// Instruction Data
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct LogIdeaInstructionData {
    pub idea_text: String,
}

/// Implementation of instruction setters for fuzzing
///
/// Provides methods to:
/// - Set instruction data during fuzzing
/// - Configure instruction accounts during fuzzing
/// - (Optional) Set remaining accounts during fuzzing
///
/// Docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/writting-fuzz-test/
impl InstructionHooks for LogIdeaInstruction {
    type IxAccounts = FuzzAccounts;
}
