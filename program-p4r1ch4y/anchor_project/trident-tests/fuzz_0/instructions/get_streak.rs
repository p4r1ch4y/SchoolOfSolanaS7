use crate::fuzz_accounts::FuzzAccounts;
use crate::types::*;
use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

#[derive(TridentInstruction, Default)]
#[program_id("FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv")]
#[discriminator([83u8, 143u8, 240u8, 10u8, 140u8, 65u8, 58u8, 40u8])]
pub struct GetStreakInstruction {
    pub accounts: GetStreakInstructionAccounts,
    pub data: GetStreakInstructionData,
}

/// Instruction Accounts
#[derive(Debug, Clone, TridentAccounts, Default)]
#[instruction_data(GetStreakInstructionData)]
#[storage(FuzzAccounts)]
pub struct GetStreakInstructionAccounts {
    pub journal: TridentAccount,

    #[account(signer)]
    pub user: TridentAccount,
}

/// Instruction Data
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct GetStreakInstructionData {}

/// Implementation of instruction setters for fuzzing
///
/// Provides methods to:
/// - Set instruction data during fuzzing
/// - Configure instruction accounts during fuzzing
/// - (Optional) Set remaining accounts during fuzzing
///
/// Docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/writting-fuzz-test/
impl InstructionHooks for GetStreakInstruction {
    type IxAccounts = FuzzAccounts;
}
