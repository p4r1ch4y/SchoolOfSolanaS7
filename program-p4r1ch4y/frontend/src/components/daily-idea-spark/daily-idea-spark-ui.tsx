'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../app-hero'
import { ellipsify } from '@/lib/utils'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useDailyIdeaSparkProgram, useDailyIdeaSparkProgramAccount } from './daily-idea-spark-data-access'
import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'
import { toast } from 'sonner'
import { type DailyIdeaSpark } from '@project/anchor'
import { IdlAccounts } from '@coral-xyz/anchor'

type JournalAccount = IdlAccounts<DailyIdeaSpark>['journal']

export function DailyIdeaSparkFeature() {
  const { publicKey } = useWallet()
  const { programId, getUserJournal, userJournalPDA } = useDailyIdeaSparkProgram()

  return publicKey ? (
    <div>
      <AppHero
        title="Daily Idea Spark"
        subtitle={
          'Build your daily idea streak! Log creative ideas every day to maintain your innovation momentum.'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
      </AppHero>

      {/* Show user's journal or initialization */}
      {getUserJournal.isLoading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : getUserJournal.data === 'OLD_ACCOUNT' ? (
        <OldAccountWarning />
      ) : getUserJournal.data ? (
        <UserJournalCard journal={getUserJournal.data} journalPDA={userJournalPDA!} />
      ) : (
        <DailyIdeaSparkCreate />
      )}

      <DailyIdeaSparkList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  )
}

export function DailyIdeaSparkCreate() {
  const { initializeJournal, userJournalPDA } = useDailyIdeaSparkProgram()
  const { publicKey } = useWallet()

  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-gradient-to-br from-primary/10 via-base-200 to-base-300 shadow-xl border border-primary/20">
        <div className="card-body text-center space-y-6">
          <div className="space-y-3">
            <div className="text-6xl">💡</div>
            <h2 className="card-title text-3xl justify-center text-primary">Initialize Your Idea Journal</h2>
            <p className="text-base-content/70 text-lg">
              Create your personal journal to start tracking your daily idea streak!
            </p>
          </div>
          
          <div className="card bg-base-100/50 shadow-sm">
            <div className="card-body py-4">
              <div className="text-sm space-y-2 text-base-content/60">
                <div className="flex items-center justify-center gap-2">
                  <span>✨</span>
                  <span>Track your creative ideas daily</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>📈</span>
                  <span>Build and maintain your streak</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span>💾</span>
                  <span>Store up to 20 ideas with timestamps</span>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={() => initializeJournal.mutateAsync()}
            disabled={initializeJournal.isPending}
          >
            {initializeJournal.isPending ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating Journal...
              </>
            ) : (
              <>
                <span>🚀</span>
                Initialize Journal
              </>
            )}
          </button>

          {userJournalPDA && (
            <div className="card bg-base-100/30 shadow-sm">
              <div className="card-body py-3">
                <div className="text-xs opacity-60 text-center">
                  Your journal PDA: <ExplorerLink path={`account/${userJournalPDA}`} label={ellipsify(userJournalPDA.toString())} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Component to handle old account structure
function OldAccountWarning() {
  const { initializeJournal, userJournalPDA } = useDailyIdeaSparkProgram()
  const { publicKey } = useWallet()

  if (!publicKey) {
    return <p>Connect your wallet</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card bg-gradient-to-br from-warning/10 via-base-200 to-base-300 shadow-xl border border-warning/30">
        <div className="card-body space-y-6">
          <div className="alert alert-warning shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-semibold">Your journal was created with an older version</span>
          </div>

          <div className="text-center space-y-3">
            <div className="text-5xl">🔄</div>
            <h2 className="card-title text-2xl justify-center text-warning">Upgrade Required</h2>
            <p className="text-base-content/80">
              Your existing journal needs to be upgraded to support the new features. 
              This will replace your old journal with an enhanced version.
            </p>
          </div>

          <div className="card bg-base-100/50 shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-lg text-success mb-3">✨ New Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-primary">📝</span>
                  <span>Store actual idea text (280 chars)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">👁️</span>
                  <span>View your last logged idea</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">📈</span>
                  <span>Enhanced streak tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">⚙️</span>
                  <span>Better account management</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-error/10 border border-error/20 shadow-sm">
            <div className="card-body py-3">
              <div className="text-xs text-error/80 text-center">
                <p className="font-semibold">⚠️ Important:</p>
                <p>This will replace your old journal. Previous streak data will not be transferred.</p>
              </div>
            </div>
          </div>

          <div className="card-actions justify-center">
            <button
              className="btn btn-warning btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => initializeJournal.mutateAsync()}
              disabled={initializeJournal.isPending}
            >
              {initializeJournal.isPending ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Upgrading Journal...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Upgrade Journal
                </>
              )}
            </button>
          </div>

          {userJournalPDA && (
            <div className="card bg-base-100/30 shadow-sm">
              <div className="card-body py-3">
                <div className="text-xs opacity-60 text-center">
                  Journal PDA: <ExplorerLink path={`account/${userJournalPDA}`} label={ellipsify(userJournalPDA.toString())} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Component to show user's journal and allow interactions
function UserJournalCard({ journal, journalPDA }: {
  journal: JournalAccount & { ideas?: { text: string; timestamp: { toNumber(): number } }[] },
  journalPDA: PublicKey
}) {
  const { logIdea } = useDailyIdeaSparkProgramAccount({ account: journalPDA })
  const { getUserJournal } = useDailyIdeaSparkProgram()
  const [ideaPrompt, setIdeaPrompt] = useState('')
  const [customIdea, setCustomIdea] = useState('')

  // Idea prompts for inspiration
  const ideaPrompts = [
    "AI-powered solution for traffic optimization in your city",
    "Smart home device that saves energy",
    "Mobile app to connect local communities",
    "Blockchain solution for supply chain transparency",
    "IoT device for environmental monitoring",
    "Educational platform for skill sharing",
    "Health tech innovation for elderly care",
    "Sustainable packaging alternative",
    "AR/VR application for remote collaboration",
    "Fintech solution for financial inclusion"
  ]

  const generatePrompt = () => {
    const randomPrompt = ideaPrompts[Math.floor(Math.random() * ideaPrompts.length)]
    setIdeaPrompt(randomPrompt)
  }

  const handleLogIdea = async (ideaText: string) => {
    try {
      await logIdea.mutateAsync(ideaText)
      // Clear the custom idea input after successful submission
      setCustomIdea('')
      // Refresh the journal data
      getUserJournal.refetch()
    } catch (error) {
      console.error('Error logging idea:', error)
    }
  }

  const handleLogCustomIdea = () => {
    if (customIdea.trim()) {
      handleLogIdea(customIdea.trim())
    } else {
      toast.error('Please enter an idea before logging')
    }
  }

  const handleLogPromptIdea = () => {
    if (ideaPrompt) {
      handleLogIdea(ideaPrompt)
    } else {
      toast.error('Please generate a prompt first')
    }
  }

  const streak = journal.streak?.toNumber() ?? 0
  const lastLogged = journal.lastLogged?.toNumber() ?? 0
  const createdAt = journal.createdAt?.toNumber() ?? 0
  const lastIdea = journal.lastIdea || ''
  const owner = journal.owner?.toString() || ''

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Journal Header Card */}
      <div className="card bg-gradient-to-br from-primary/20 via-base-200 to-base-300 shadow-xl border border-primary/20">
        <div className="card-body">
          <div className="text-center space-y-4">
            <h2 className="card-title text-4xl justify-center text-primary">💡 Daily Idea Spark</h2>
            
            <div className="card bg-base-100/80 shadow-sm border border-base-content/10">
              <div className="card-body py-3">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span>📝</span>
                  <span className="font-medium text-base-content">Journal Owner:</span>
                  <span className="text-primary font-mono">{ellipsify(owner)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Display Card */}
          <div className="card bg-gradient-to-r from-primary to-secondary shadow-lg border border-primary/20">
            <div className="card-body text-center">
              <div className="space-y-2">
                <h3 className="text-white text-lg font-semibold">🔥 Current Streak</h3>
                <div className="text-6xl font-bold text-white">{streak}</div>
                <p className="text-white/90">
                  {lastLogged > 0 ? `Last logged: ${new Date(lastLogged * 1000).toLocaleDateString()}` : 'No ideas logged yet'}
                </p>
              </div>
            </div>
          </div>

          {/* Last Idea Display Card */}
          {lastIdea && (
            <div className="card bg-gradient-to-r from-base-100 to-base-200 shadow-lg border border-accent/20">
              <div className="card-body">
                <h3 className="card-title text-accent flex items-center gap-2">
                  <span>💡</span>
                  <span>Last Logged Idea</span>
                </h3>
                <blockquote className="text-lg italic text-base-content border-l-4 border-accent pl-4 py-2">
                  &ldquo;{lastIdea}&rdquo;
                </blockquote>
                <div className="text-xs opacity-60 text-right">
                  <span className="badge badge-outline">
                    📅 {new Date(lastLogged * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Idea Input Card */}
      <div className="card bg-gradient-to-br from-success/10 via-base-200 to-base-300 shadow-xl border border-success/20">
        <div className="card-body space-y-4">
          <div className="card-title text-success flex items-center gap-2">
            <span>✨</span>
            <span>Log Your Creative Idea</span>
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Share your brilliant idea:</span>
              <span className="label-text-alt text-xs opacity-60">{customIdea.length}/280 characters</span>
            </label>
            <div className="flex gap-3">
              <textarea
                className="textarea textarea-bordered flex-1 h-24 resize-none"
                placeholder="Type your creative idea here... 💭"
                value={customIdea}
                onChange={(e) => setCustomIdea(e.target.value)}
                maxLength={280}
              />
              <button
                className="btn btn-success btn-lg self-end shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleLogCustomIdea}
                disabled={logIdea.isPending || !customIdea.trim()}
              >
                {logIdea.isPending ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Logging...
                  </>
                ) : (
                  <>
                    <span>📝</span>
                    Log Idea
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Idea Prompt Generator Card */}
      <div className="card bg-gradient-to-br from-secondary/10 via-base-200 to-base-300 shadow-xl border border-secondary/20">
        <div className="card-body space-y-4">
          <div className="card-title text-secondary flex items-center gap-2">
            <span>🎲</span>
            <span>Need Inspiration?</span>
          </div>
          
          <div className="space-y-3">
            <button
              className="btn btn-secondary shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={generatePrompt}
            >
              <span>🎯</span>
              Generate Idea Prompt
            </button>
            
            {ideaPrompt && (
              <div className="card bg-base-100/50 shadow-sm">
                <div className="card-body py-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💭</span>
                    <div className="flex-1">
                      <p className="text-base-content italic text-lg">&ldquo;{ideaPrompt}&rdquo;</p>
                      <div className="card-actions justify-end mt-3">
                        <button
                          className="btn btn-outline btn-secondary shadow-lg hover:shadow-xl transition-all duration-200"
                          onClick={handleLogPromptIdea}
                          disabled={logIdea.isPending}
                        >
                          {logIdea.isPending ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Logging...
                            </>
                          ) : (
                            <>
                              <span>💾</span>
                              Log This Prompt
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Previous Ideas Card */}
      <div className="card bg-gradient-to-br from-info/10 via-base-200 to-base-300 shadow-xl border border-info/20">
        <div className="card-body space-y-4">
          <div className="card-title text-info flex items-center gap-2">
            <span>📚</span>
            <span>Previous Ideas</span>
            {journal.ideas && journal.ideas.length > 0 && (
              <div className="badge badge-info badge-sm">{journal.ideas.length}</div>
            )}
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {journal.ideas && journal.ideas.length > 0 ? (
              journal.ideas.slice().reverse().map((idea, idx: number) => (
                <div key={idx} className="card bg-gradient-to-r from-base-100 to-base-200 shadow-sm border border-base-content/10 hover:shadow-md transition-shadow duration-200">
                  <div className="card-body p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <blockquote className="text-base-content italic text-sm border-l-2 border-info/50 pl-3">
                          &ldquo;{idea.text}&rdquo;
                        </blockquote>
                        <div className="flex items-center gap-3 text-xs opacity-60">
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>{new Date((idea.timestamp?.toNumber() || Date.now() / 1000) * 1000).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>⏰</span>
                            <span>{new Date((idea.timestamp?.toNumber() || Date.now() / 1000) * 1000).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="badge badge-ghost badge-sm opacity-40">
                        #{journal.ideas.length - idx}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card bg-base-100/30 shadow-sm">
                <div className="card-body text-center py-12">
                  <div className="space-y-3 opacity-60">
                    <div className="text-4xl">💭</div>
                    <p className="text-sm font-medium">No previous ideas found</p>
                    <p className="text-xs">Start logging ideas to build your creative history!</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Actions & Info Card */}
      <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-lg border border-base-content/10">
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-1">
              <div className="text-sm opacity-60">
                <span className="font-medium">Journal Address:</span>
                <ExplorerLink path={`account/${journalPDA}`} label={ellipsify(journalPDA.toString())} />
              </div>
              <div className="text-xs opacity-50">
                Created: {new Date(createdAt * 1000).toLocaleDateString()}
              </div>
            </div>
            
            <button
              className="btn btn-ghost shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => getUserJournal.refetch()}
              disabled={getUserJournal.isFetching}
            >
              {getUserJournal.isFetching ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Refreshing...
                </>
              ) : (
                <>
                  <span>🔄</span>
                  Refresh Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DailyIdeaSparkList() {
  const { accounts, getProgramAccount } = useDailyIdeaSparkProgram()

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }
  
  if (!getProgramAccount.data?.value) {
    return (
      <div className="card bg-gradient-to-br from-error/10 via-base-200 to-base-300 shadow-xl border border-error/20">
        <div className="card-body text-center">
          <div className="space-y-4">
            <div className="text-5xl">⚠️</div>
            <h3 className="card-title justify-center text-error">Program Not Found</h3>
            <p className="text-base-content/70">
              Program account not found. Make sure you have deployed the program and are on the correct cluster.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-br from-neutral/10 via-base-200 to-base-300 shadow-xl border border-neutral/20">
        <div className="card-body">
          <div className="card-title text-neutral flex items-center gap-2 justify-center">
            <span>🌍</span>
            <span>Community Journals</span>
          </div>
          
          {accounts.isLoading ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : accounts.data?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.data?.map((account) => (
                <DailyIdeaSparkCard key={account.publicKey.toString()} account={account.publicKey} />
              ))}
            </div>
          ) : (
            <div className="card bg-base-100/30 shadow-sm">
              <div className="card-body text-center py-12">
                <div className="space-y-3 opacity-60">
                  <div className="text-4xl">📝</div>
                  <h3 className="text-xl font-semibold">No journals found</h3>
                  <p className="text-sm">Create the first journal above to get started!</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DailyIdeaSparkCard({ account }: { account: PublicKey }) {
  const { accountQuery } = useDailyIdeaSparkProgramAccount({ account })

  const count = accountQuery.data?.streak?.toNumber() ?? 0
  const lastLogged = accountQuery.data?.lastLogged?.toNumber() ?? 0
  const createdAt = accountQuery.data?.createdAt?.toNumber() ?? 0
  const lastIdea = accountQuery.data?.lastIdea || ''

  return accountQuery.isLoading ? (
    <div className="card bg-base-300 shadow-xl border border-base-content/10">
      <div className="card-body">
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    </div>
  ) : (
    <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl border border-base-content/10 hover:shadow-2xl transition-all duration-300">
      <div className="card-body space-y-4">
        <div className="card-title text-primary flex items-center gap-2">
          <span>💡</span>
          <span>Journal</span>
        </div>
        
        <div className="card bg-gradient-to-r from-primary/20 to-secondary/20 shadow-sm border border-primary/30">
          <div className="card-body text-center py-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-base-content/70">Current Streak</h3>
              <div className="text-3xl font-bold text-primary">{count}</div>
              <p className="text-xs text-base-content/60">
                {lastLogged > 0 ? `Last: ${new Date(lastLogged * 1000).toLocaleDateString()}` : 'No ideas yet'}
              </p>
            </div>
          </div>
        </div>

        {lastIdea && (
          <div className="card bg-base-100/50 shadow-sm">
            <div className="card-body py-3">
              <div className="text-xs font-medium opacity-70 mb-1">Latest Idea:</div>
              <p className="text-sm italic text-base-content/80 line-clamp-2">
                &ldquo;{lastIdea}&rdquo;
              </p>
            </div>
          </div>
        )}
        
        <div className="space-y-2 text-xs opacity-50">
          <div className="flex items-center justify-between">
            <span>Address:</span>
            <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
          </div>
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{new Date(createdAt * 1000).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
