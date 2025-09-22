// Here we export some useful types and functions for interacting with the Daily Idea Spark Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import DailyIdeaSparkIDL from '../target/idl/daily_idea_spark.json'
import type { DailyIdeaSpark } from '../target/types/daily_idea_spark'

// Re-export the generated IDL and type
export { DailyIdeaSpark, DailyIdeaSparkIDL }

// The programId is imported from the program IDL.
export const DAILY_IDEA_SPARK_PROGRAM_ID = new PublicKey(DailyIdeaSparkIDL.address)

// This is a helper function to get the Daily Idea Spark Anchor program.
export function getDailyIdeaSparkProgram(provider: AnchorProvider, address?: PublicKey): Program<DailyIdeaSpark> {
  return new Program({ ...DailyIdeaSparkIDL, address: address ? address.toBase58() : DailyIdeaSparkIDL.address } as DailyIdeaSpark, provider)
}

// This is a helper function to get the program ID for the Daily Idea Spark program depending on the cluster.
export function getDailyIdeaSparkProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Daily Idea Spark program on devnet and testnet.
      return new PublicKey('FsL6UpQExpY4ZqLosQFMU9RFiictPhss63nnxvf61djv')
    case 'mainnet-beta':
    default:
      return DAILY_IDEA_SPARK_PROGRAM_ID
  }
}

// Helper function to derive journal PDA
export function getJournalPDA(userPublicKey: PublicKey, programId: PublicKey = DAILY_IDEA_SPARK_PROGRAM_ID) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('journal'), userPublicKey.toBuffer()],
    programId
  )
}
