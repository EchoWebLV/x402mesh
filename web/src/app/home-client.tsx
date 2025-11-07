'use client'

import { useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { AgentChain } from '@/components/AgentChain'
import { PaymentTracker } from '@/components/PaymentTracker'
import { AgentCards } from '@/components/AgentCards'

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<'chain' | 'payments'>('chain')

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark via-gray-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-dark/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                🤖 Agent-to-Agent Router
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Solana x402 Hackathon - AI Agents with Micropayments
              </p>
            </div>
            <div className="flex items-center gap-4">
              <WalletMultiButton className="!bg-primary hover:!bg-primary/80 transition-all" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h2 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
              The Future of AI Agent Payments
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Watch AI agents discover, collaborate, and transact autonomously using USDC on Solana
          </p>
          <div className="flex gap-4 justify-center text-sm">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2">
              <span className="text-green-400">✓</span> Real USDC Payments
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-2">
              <span className="text-blue-400">✓</span> x402 Protocol
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg px-4 py-2">
              <span className="text-purple-400">✓</span> Agent Chaining
            </div>
          </div>
        </div>

        {/* Agent Cards */}
        <AgentCards />

        {/* Tabs */}
        <div className="flex gap-2 mb-6 justify-center">
          <button
            onClick={() => setActiveTab('chain')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'chain'
                ? 'bg-gradient-to-r from-primary to-secondary text-dark'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🔗 Agent Chain Demo
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'payments'
                ? 'bg-gradient-to-r from-primary to-secondary text-dark'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            💰 Payment Tracker
          </button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'chain' && <AgentChain />}
          {activeTab === 'payments' && <PaymentTracker />}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-dark/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p className="mb-2">Built for Solana x402 Hackathon</p>
            <div className="flex gap-4 justify-center text-sm">
              <a href="https://github.com" className="hover:text-primary transition-colors">
                GitHub
              </a>
              <span>•</span>
              <a href="https://docs.solana.com" className="hover:text-primary transition-colors">
                Docs
              </a>
              <span>•</span>
              <a href="https://explorer.solana.com/?cluster=devnet" className="hover:text-primary transition-colors">
                Solana Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}


