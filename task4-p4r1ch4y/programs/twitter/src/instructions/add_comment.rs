//-------------------------------------------------------------------------------
///
/// TASK: Implement the add comment functionality for the Twitter program
/// 
/// Requirements:
/// - Validate that comment content doesn't exceed maximum length
/// - Initialize a new comment account with proper PDA seeds
/// - Set comment fields: content, author, parent tweet, and bump
/// - Use content hash in PDA seeds for unique comment identification
/// 
///-------------------------------------------------------------------------------

use anchor_lang::prelude::*;

use crate::errors::TwitterError;
use crate::states::*;

pub fn add_comment(ctx: Context<AddCommentContext>, comment_content: String) -> Result<()> {
    // TODO: Implement add comment functionality
    if comment_content.len() > COMMENT_LENGTH {
        return err!(TwitterError::CommentTooLong);
    }

    let comment_account = &ctx.accounts.comment;
    let comment_author = &ctx.accounts.comment_author;
    let tweet = &ctx.accounts.tweet;
    let system_program = &ctx.accounts.system_program;

    // try to use hash from anchor_lang::solana_program::hash
    let content_hash = anchor_lang::solana_program::hash::hash(comment_content.as_bytes());
    let content_hash_bytes = content_hash.to_bytes();
    
    let comment_author_key = comment_author.key();
    let tweet_key = tweet.key();
    let expected_seeds = &[
        COMMENT_SEED.as_bytes(),
        comment_author_key.as_ref(),
        content_hash_bytes.as_ref(),
        tweet_key.as_ref(),
    ];
    let (expected_pda, bump) = Pubkey::find_program_address(expected_seeds, ctx.program_id);

    require!(
        comment_account.key() == expected_pda,
        ErrorCode::ConstraintSeeds
    );

    // create the account
    let rent = Rent::get()?;
    let space = 8 + Comment::INIT_SPACE;
    let lamports = rent.minimum_balance(space);

    let seeds_with_bump = &[
        COMMENT_SEED.as_bytes(),
        comment_author_key.as_ref(),
        content_hash_bytes.as_ref(),
        tweet_key.as_ref(),
        &[bump],
    ];

    anchor_lang::solana_program::program::invoke_signed(
        &anchor_lang::solana_program::system_instruction::create_account(
            comment_author.key,
            comment_account.key,
            lamports,
            space as u64,
            ctx.program_id,
        ),
        &[
            comment_author.to_account_info(),
            comment_account.to_account_info(),
            system_program.to_account_info(),
        ],
        &[seeds_with_bump],
    )?;

    // initialize the account data
    let mut data = comment_account.try_borrow_mut_data()?;
    
    let comment_data = Comment {
        comment_author: comment_author_key,
        parent_tweet: tweet_key,
        content: comment_content,
        bump,
    };

    comment_data.try_serialize(&mut &mut data[..])?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(comment_content: String)]
pub struct AddCommentContext<'info> {
    // TODO: Add required account constraints
    #[account(mut)]
    pub comment_author: Signer<'info>,
    /// CHECK: This account is validated and initialized manually in the instruction
    #[account(mut)]
    pub comment: UncheckedAccount<'info>,
    pub tweet: Account<'info, Tweet>,
    pub system_program: Program<'info, System>,
}
