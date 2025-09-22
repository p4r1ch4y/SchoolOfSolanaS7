use anchor_lang::prelude::*;

declare_id!("FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv");

#[program]
pub mod daily_idea_spark {
    use super::*;

    /// Initialize a new journal for the user
    pub fn initialize_journal(ctx: Context<InitializeJournal>) -> Result<()> {
        let journal = &mut ctx.accounts.journal;
        let user = &ctx.accounts.user;
        let clock = Clock::get()?;

        journal.owner = user.key();
        journal.streak = 0;
        journal.last_logged = 0; // No ideas logged yet
        journal.created_at = clock.unix_timestamp;
        journal.last_idea = String::new();
        journal.ideas = Vec::new(); // Initialize empty ideas array

        msg!("Journal initialized for user: {}", user.key());
        Ok(())
    }

    /// Log a new idea and update streak
    pub fn log_idea(ctx: Context<LogIdea>, idea_text: String) -> Result<()> {
        let journal = &mut ctx.accounts.journal;
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        // Validate idea text length (max 280 characters like Twitter)
        require!(idea_text.len() <= 280, ErrorCode::IdeaTooLong);
        require!(!idea_text.trim().is_empty(), ErrorCode::EmptyIdea);

        // Check if more than 24 hours have passed since last log
        let time_diff = current_time - journal.last_logged;
        let twenty_four_hours = 24 * 60 * 60; // 24 hours in seconds

        if journal.last_logged == 0 {
            // First idea ever
            journal.streak = 1;
        } else if time_diff <= twenty_four_hours {
            // Within 24 hours, increment streak
            journal.streak += 1;
        } else {
            // More than 24 hours, reset streak to 1
            journal.streak = 1;
        }

        journal.last_logged = current_time;
        journal.last_idea = idea_text.clone();

        // Create a new IdeaLog entry
        let idea_log = IdeaLog {
            text: idea_text.clone(),
            timestamp: current_time,
        };

        // Simple approach: just add new ideas and let the account size limit handle trimming
        // We'll manage the size by limiting to 20 ideas instead of 30 to reduce memory pressure
        journal.ideas.push(idea_log);
        
        // Only keep the most recent ideas, but use a simple approach
        while journal.ideas.len() > 20 {
            journal.ideas.remove(0);
        }

        msg!("Idea logged: '{}' - Current streak: {}", idea_text, journal.streak);
        Ok(())
    }

    /// Get the current streak (read-only)
    pub fn get_streak(ctx: Context<GetStreak>) -> Result<()> {
        let journal = &ctx.accounts.journal;
        msg!("Current streak for user {}: {}", journal.owner, journal.streak);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeJournal<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + Journal::INIT_SPACE,
        seeds = [b"journal", user.key().as_ref()],
        bump
    )]
    pub journal: Account<'info, Journal>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct LogIdea<'info> {
    #[account(
        mut,
        seeds = [b"journal", user.key().as_ref()],
        bump,
        constraint = journal.owner == user.key() @ ErrorCode::Unauthorized
    )]
    pub journal: Account<'info, Journal>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct GetStreak<'info> {
    #[account(
        seeds = [b"journal", user.key().as_ref()],
        bump,
        constraint = journal.owner == user.key() @ ErrorCode::Unauthorized
    )]
    pub journal: Account<'info, Journal>,
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Journal {
    pub owner: Pubkey,      // 32 bytes
    pub streak: u64,        // 8 bytes
    pub last_logged: i64,   // 8 bytes - Unix timestamp of last idea log
    pub created_at: i64,    // 8 bytes - Unix timestamp when journal was created
    #[max_len(280)]
    pub last_idea: String,  // Variable length, max 280 chars (like Twitter)
    #[max_len(20)]
    pub ideas: Vec<IdeaLog>, // Vector of ideas (max 20 ideas to reduce memory pressure and avoid stack overflow)
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct IdeaLog {
    #[max_len(280)]
    pub text: String,       // Idea text, max 280 chars
    pub timestamp: i64,     // Unix timestamp when logged
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to access this journal")]
    Unauthorized,
    #[msg("Journal already exists for this user")]
    AlreadyInitialized,
    #[msg("Idea text is too long (max 280 characters)")]
    IdeaTooLong,
    #[msg("Idea text cannot be empty")]
    EmptyIdea,
}
