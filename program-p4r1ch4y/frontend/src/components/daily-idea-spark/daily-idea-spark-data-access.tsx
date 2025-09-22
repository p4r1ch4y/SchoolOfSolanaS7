'use client'

import { getDailyIdeaSparkProgram, getDailyIdeaSparkProgramId, getJournalPDA } from '@project/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Cluster, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'

export function useDailyIdeaSparkProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const { publicKey } = useWallet()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getDailyIdeaSparkProgramId(cluster.network as Cluster), [cluster])
  const program = getDailyIdeaSparkProgram(provider, programId)

  const accounts = useQuery({
    queryKey: ['daily-idea-spark', 'all', { cluster }],
    queryFn: () => program.account.journal.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initializeJournal = useMutation({
    mutationKey: ['daily-idea-spark', 'initialize', { cluster }],
    mutationFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected')

      console.log('Initializing journal for user:', publicKey.toString())
      console.log('Program ID:', programId.toString())

      const [journalPDA] = getJournalPDA(publicKey, programId)
      console.log('Journal PDA:', journalPDA.toString())

      // Check if journal already exists (with proper error handling for old accounts)
      try {
        const accountInfo = await connection.getAccountInfo(journalPDA)
        if (accountInfo) {
          // Account exists, try to fetch it to see if it's a valid new journal
          try {
            const existingJournal = await program.account.journal.fetch(journalPDA)
            console.log('Valid journal already exists:', existingJournal)
            throw new Error('Journal already exists for this user')
          } catch (fetchError) {
            // If fetch fails due to buffer issues, it's an old account - we can proceed to reinitialize
            const errorMessage = (fetchError as Error).message || ''
            if (errorMessage.includes('buffer length') || errorMessage.includes('beyond buffer')) {
              console.log('Old journal detected, will reinitialize with new structure')
              // Continue with initialization to replace old account
            } else {
              // Some other error occurred
              throw fetchError
            }
          }
        } else {
          console.log('No existing account found, proceeding with initialization')
        }
      } catch (error) {
        // If it's not a buffer error, re-throw
        const errorMessage = (error as Error).message || ''
        if (!errorMessage.includes('buffer length') && !errorMessage.includes('beyond buffer') && !errorMessage.includes('Journal already exists')) {
          console.error('Unexpected error checking journal:', error)
          throw error
        }
      }

      console.log('Calling initializeJournal method...')
      const signature = await program.methods
        .initializeJournal()
        .rpc({
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        })

      console.log('Journal initialized successfully:', signature)
      return signature
    },
    onSuccess: (signature) => {
      console.log('Initialize journal success:', signature)
      transactionToast(signature)
      getUserJournal.refetch()
      accounts.refetch()
    },
    onError: (error) => {
      console.error('Initialize journal error:', error)
      toast.error(`Failed to initialize journal: ${error.message}`)
    },
  })

  // Hook to get user's journal directly
  const getUserJournal = useQuery({
    queryKey: ['daily-idea-spark', 'user-journal', { cluster, user: publicKey?.toString() }],
    queryFn: async () => {
      if (!publicKey) {
        console.log('No public key, returning null')
        return null
      }

      const [journalPDA] = getJournalPDA(publicKey, programId)
      console.log('Fetching journal for PDA:', journalPDA.toString())

      try {
        const journal = await program.account.journal.fetch(journalPDA)
        console.log('Journal found:', journal)
        return journal
      } catch (error) {
        console.log('Error fetching journal:', error)

        // Handle different types of errors
        const errorMessage = (error as Error).message || ''

        if (errorMessage.includes('Account does not exist')) {
          console.log('Journal does not exist - user needs to initialize')
          return null
        }

        if (errorMessage.includes('buffer length') || errorMessage.includes('beyond buffer')) {
          console.log('Journal has old structure - user needs to reinitialize')
          // Return a special marker to indicate old account
          return 'OLD_ACCOUNT'
        }

        // Re-throw other errors
        console.error('Unexpected error fetching journal:', error)
        return null // Return null instead of throwing to prevent UI crashes
      }
    },
    enabled: !!publicKey,
    retry: false, // Don't retry on account not found
    refetchOnWindowFocus: false,
    refetchInterval: false, // Disable automatic refetching
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initializeJournal,
    getUserJournal,
    userJournalPDA: publicKey ? getJournalPDA(publicKey, programId)[0] : null,
  }
}

export function useDailyIdeaSparkProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const { publicKey } = useWallet()
  const transactionToast = useTransactionToast()
  const { program } = useDailyIdeaSparkProgram()

  const accountQuery = useQuery({
    queryKey: ['daily-idea-spark', 'fetch', { cluster, account }],
    queryFn: () => program.account.journal.fetch(account),
  })

  const logIdea = useMutation({
    mutationKey: ['daily-idea-spark', 'log-idea', { cluster, account }],
    mutationFn: async (ideaText: string) => {
      if (!publicKey) throw new Error('Wallet not connected')
      if (!ideaText || ideaText.trim().length === 0) throw new Error('Idea text cannot be empty')
      if (ideaText.length > 280) throw new Error('Idea text too long (max 280 characters)')

      console.log('Logging idea:', ideaText)

      // Verify journal exists
      try {
        await program.account.journal.fetch(account)
      } catch {
        throw new Error('Journal not found. Please initialize your journal first.')
      }

      return await program.methods
        .logIdea(ideaText.trim())
        .rpc({
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        })
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      accountQuery.refetch()
    },
    onError: (error) => {
      console.error('Log idea error:', error)
      toast.error(`Failed to log idea: ${error.message}`)
    },
  })

  const getStreak = useMutation({
    mutationKey: ['daily-idea-spark', 'get-streak', { cluster, account }],
    mutationFn: async () => {
      if (!publicKey) throw new Error('Wallet not connected')

      return await program.methods
        .getStreak()
        .rpc({
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
          skipPreflight: false,
        })
    },
    onSuccess: (signature) => {
      transactionToast(signature)
      return accountQuery.refetch()
    },
    onError: (error) => {
      console.error('Get streak error:', error)
      toast.error('Failed to get streak')
    },
  })

  return {
    accountQuery,
    logIdea,
    getStreak,
  }
}
