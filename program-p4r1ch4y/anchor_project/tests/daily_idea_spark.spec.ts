import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { DailyIdeaSpark } from "../target/types/daily_idea_spark";
import { expect } from "chai";

/**
 * Daily Idea Spark Program Tests
 * 
 * Comprehensive test suite covering all functionality:
 * - Program loa    it('Ideas array properly maintains limit of 20 entries', async () => {ing and method availability
 * - Journal initialization 
 * - Idea logging with streak tracking
 * - Ideas array functionality and limits
 * - Error handling and validation
 * - Account isolation between users
 */
describe("Daily Idea Spark", () => {
  // Configure the client to use the devnet cluster
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.DailyIdeaSpark as Program<DailyIdeaSpark>;
  const provider = anchor.getProvider();

  // Create fresh keypairs for each test run to avoid account conflicts
  const user1 = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();

  // Use the default wallet to fund test users
  const funder = (provider.wallet as anchor.Wallet).payer;

  // Helper function to get journal PDA
  const getJournalPDA = (userPubkey: anchor.web3.PublicKey) => {
    return anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("journal"), userPubkey.toBuffer()],
      program.programId
    );
  };

  // Helper function to get SOL for testing (with fallback options)
  const ensureFunding = async (keypair: anchor.web3.Keypair, amount: number = 0.15) => {
    const targetLamports = amount * anchor.web3.LAMPORTS_PER_SOL;
    const currentBalance = await provider.connection.getBalance(keypair.publicKey);

    if (currentBalance >= targetLamports) {
      console.log(`${keypair.publicKey.toString().slice(0, 8)}... already has sufficient balance`);
      return;
    }

    console.log(`Funding ${keypair.publicKey.toString().slice(0, 8)}... (needs ${amount} SOL)`);

    // Try airdrop first (most reliable for AI testing)
    try {
      const signature = await provider.connection.requestAirdrop(
        keypair.publicKey,
        targetLamports
      );
      await provider.connection.confirmTransaction(signature);
      console.log(` Airdrop successful for ${keypair.publicKey.toString().slice(0, 8)}...`);
      return;
    } catch (airdropError) {
      console.log(` Airdrop failed: ${airdropError.message}`);
    }

    // Fallback: Try to transfer from provider wallet (if it has funds)
    try {
      const providerBalance = await provider.connection.getBalance(funder.publicKey);
      if (providerBalance >= targetLamports + 5000) { // Keep some for fees
        const transaction = new anchor.web3.Transaction().add(
          anchor.web3.SystemProgram.transfer({
            fromPubkey: funder.publicKey,
            toPubkey: keypair.publicKey,
            lamports: targetLamports,
          })
        );

        await provider.sendAndConfirm(transaction, [funder]);
        console.log(` Transfer successful from provider wallet`);
        return;
      }
    } catch (transferError) {
      console.log(` Transfer failed: ${transferError.message}`);
    }

    // If both fail, throw error with helpful message
    throw new Error(`
  Unable to fund test account. Please ensure one of the following:
1. Devnet faucet is working (try: solana airdrop 1 ${keypair.publicKey.toString()})
2. Provider wallet has SOL (current: ${funder.publicKey.toString()})
3. Get SOL from https://faucet.solana.com/

Test account that needs funding: ${keypair.publicKey.toString()}
    `);
  };

  before(async () => {
    // Fund both test users (try airdrop first, fallback to provider transfer)
    await ensureFunding(user1);
    await ensureFunding(user2);
    console.log("Test users funded successfully");
    console.log("User1:", user1.publicKey.toString());
    console.log("User2:", user2.publicKey.toString());
  });

  describe("Program Setup", () => {
    it("Program loads successfully", async () => {
      // Simple test to verify program loads
      expect(program.programId).to.not.be.undefined;
      console.log("Program ID:", program.programId.toString());
    });

    it("Program has correct methods", async () => {
      // Verify all expected methods exist
      expect(program.methods.initializeJournal).to.not.be.undefined;
      expect(program.methods.logIdea).to.not.be.undefined;
      expect(program.methods.getStreak).to.not.be.undefined;
      console.log("All program methods are available");
    });

    it("Program has correct account types", async () => {
      // Verify account types exist
      expect(program.account.journal).to.not.be.undefined;
      console.log("Journal account type is available");
    });
  });

  describe("Journal Initialization", () => {
    it("Successfully initializes a new journal", async () => {
      const [journalPDA] = getJournalPDA(user1.publicKey);

      const tx = await program.methods
        .initializeJournal()
        .accounts({
          user: user1.publicKey,
        })
        .signers([user1])
        .rpc();

      // Verify the journal was created with correct initial values
      const journalAccount = await program.account.journal.fetch(journalPDA);
      expect(journalAccount.owner.toString()).to.equal(user1.publicKey.toString());
      expect(journalAccount.streak.toString()).to.equal("0");
      expect(journalAccount.lastLogged.toString()).to.equal("0");
      expect(journalAccount.createdAt.toNumber()).to.be.greaterThan(0);
      expect(journalAccount.lastIdea).to.equal("");
      expect(journalAccount.ideas).to.be.an('array').that.is.empty;

      console.log("Journal initialized successfully:", tx);
    });

    it("Fails when trying to initialize journal that already exists", async () => {
      const [journalPDA] = getJournalPDA(user1.publicKey);

      try {
        await program.methods
          .initializeJournal()
          .accounts({
            user: user1.publicKey,
          })
          .signers([user1])
          .rpc();

        expect.fail("Expected transaction to fail");
      } catch (error) {
        // Account already exists error from Solana
        expect(error.message).to.include("already in use");
      }
    });
  });

  describe("Idea Logging", () => {
    it("Successfully logs first idea and sets streak to 1", async () => {
      const [journalPDA] = getJournalPDA(user2.publicKey);

      // Initialize journal for user2
      await program.methods
        .initializeJournal()
        .accounts({
          user: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      // Log first idea
      const ideaText = "My first creative idea about AI-powered traffic optimization";
      const tx = await program.methods
        .logIdea(ideaText)
        .accounts({
          user: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      // Verify streak is 1, last_logged is updated, and idea text is stored
      const journalAccount = await program.account.journal.fetch(journalPDA);
      expect(journalAccount.streak.toString()).to.equal("1");
      expect(journalAccount.lastLogged.toNumber()).to.be.greaterThan(0);
      expect(journalAccount.lastIdea).to.equal(ideaText);
      
      // Verify ideas array functionality
      expect(journalAccount.ideas).to.be.an('array').with.lengthOf(1);
      expect(journalAccount.ideas[0].text).to.equal(ideaText);
      expect(journalAccount.ideas[0].timestamp.toNumber()).to.be.greaterThan(0);

      console.log("First idea logged successfully:", tx);
    });

    it("Increments streak when logging within 24 hours", async () => {
      const [journalPDA] = getJournalPDA(user2.publicKey);

      const ideaText = "Smart home device that saves energy automatically";
      const tx = await program.methods
        .logIdea(ideaText)
        .accounts({
          user: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      const journalAccount = await program.account.journal.fetch(journalPDA);
      expect(journalAccount.streak.toString()).to.equal("2");
      expect(journalAccount.lastIdea).to.equal(ideaText);
      
      // Verify ideas array now has 2 items
      expect(journalAccount.ideas).to.be.an('array').with.lengthOf(2);
      expect(journalAccount.ideas[1].text).to.equal(ideaText); // Latest idea is last in array
      expect(journalAccount.ideas[1].timestamp.toNumber()).to.be.greaterThanOrEqual(journalAccount.ideas[0].timestamp.toNumber());

      console.log("Second idea logged, streak incremented:", tx);
    });

    it("Fails when idea text is empty", async () => {
      const [journalPDA] = getJournalPDA(user2.publicKey);

      try {
        await program.methods
          .logIdea("")
          .accounts({
            user: user2.publicKey,
          })
          .signers([user2])
          .rpc();

        expect.fail("Expected transaction to fail");
      } catch (error) {
        expect(error.message).to.include("EmptyIdea");
      }
    });

    it("Fails when idea text is too long", async () => {
      const [journalPDA] = getJournalPDA(user2.publicKey);
      const longIdea = "a".repeat(281);

      try {
        await program.methods
          .logIdea(longIdea)
          .accounts({
            user: user2.publicKey,
          })
          .signers([user2])
          .rpc();

        expect.fail("Expected transaction to fail");
      } catch (error) {
        expect(error.message).to.include("IdeaTooLong");
      }
    });
  });

  describe("Streak Management", () => {
    it("Successfully retrieves current streak", async () => {
      const [journalPDA] = getJournalPDA(user2.publicKey);

      const tx = await program.methods
        .getStreak()
        .accounts({
          user: user2.publicKey,
        })
        .signers([user2])
        .rpc();

      console.log("Streak retrieved successfully:", tx);
    });

    it("Demonstrates account isolation between users", async () => {
      // This test demonstrates that each user has their own isolated journal
      // user1 and user2 have completely separate accounts and data

      const [user1JournalPDA] = getJournalPDA(user1.publicKey);
      const [user2JournalPDA] = getJournalPDA(user2.publicKey);

      // Verify that the PDAs are different (account isolation)
      expect(user1JournalPDA.toString()).to.not.equal(user2JournalPDA.toString());

      // Verify user2 has a journal with streak 2
      const user2Journal = await program.account.journal.fetch(user2JournalPDA);
      expect(user2Journal.streak.toString()).to.equal("2");
      expect(user2Journal.owner.toString()).to.equal(user2.publicKey.toString());

      console.log("Account isolation verified - each user has separate journal");
    });
  });

  describe("Ideas Array Management", () => {
    it("Ideas array properly maintains limit of 20 entries", async () => {
      // This test verifies that the ideas array correctly maintains the 20-item limit
      // by logging 22 ideas and verifying only the latest 20 are kept
      
      const testUser = anchor.web3.Keypair.generate();
      await ensureFunding(testUser);
      
      const [journalPDA] = getJournalPDA(testUser.publicKey);

      // Initialize journal
      await program.methods
        .initializeJournal()
        .accounts({
          user: testUser.publicKey,
        })
        .signers([testUser])
        .rpc();

      // Log 22 ideas to test the 20-item limit
      for (let i = 0; i < 22; i++) {
        await program.methods
          .logIdea(`Test idea number ${i + 1}`)
          .accounts({
            user: testUser.publicKey,
          })
          .signers([testUser])
          .rpc();
      }

      // Verify only latest 20 ideas are kept
      const journalAccount = await program.account.journal.fetch(journalPDA);
      expect(journalAccount.ideas).to.be.an('array').with.lengthOf(20);
      
      // Verify the first idea in the array is "Test idea number 3" (oldest kept)
      expect(journalAccount.ideas[0].text).to.equal("Test idea number 3");
      
      // Verify the last idea in the array is "Test idea number 22" (newest)
      expect(journalAccount.ideas[19].text).to.equal("Test idea number 22");
      
      // Verify timestamps are in ascending order (or equal due to same-second execution)
      for (let i = 1; i < journalAccount.ideas.length; i++) {
        expect(journalAccount.ideas[i].timestamp.toNumber()).to.be.greaterThanOrEqual(
          journalAccount.ideas[i - 1].timestamp.toNumber()
        );
      }

      console.log("Array limit test completed - 20 items maintained correctly");
    });
  });
});
