'use client'

import { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { AgentChain } from '@/components/AgentChain'
import { PaymentTracker } from '@/components/PaymentTracker'
import { AgentSearch } from '@/components/AgentSearch'
import { Bot, Search, Link2, DollarSign, Terminal } from 'lucide-react'

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<'chain' | 'payments' | 'search'>('chain')

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-900 bg-black sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="w-7 h-7 text-white" />
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Agent Network
                </h1>
                <p className="text-xs text-gray-500">
                  x402 Protocol
                </p>
              </div>
            </div>
            <div>
              <WalletMultiButton className="!bg-white !text-black hover:!bg-gray-100 !rounded-md !font-medium !text-sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h2 className="text-3xl font-semibold text-white mb-4">
            Discovery and Payment Infrastructure for x402 APIs
          </h2>
          <p className="text-gray-500 leading-relaxed">
            A registry and router for x402-enabled APIs on Solana. Register your API to make it discoverable, or find and chain existing APIs into workflows. When APIs are chained, payments automatically route to each service and settle on-chain.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 justify-center border-b border-gray-900">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-5 py-2.5 font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'search'
                ? 'border-white text-white'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}
          >
            <Search className="w-4 h-4" />
            Discover
          </button>
          <button
            onClick={() => setActiveTab('chain')}
            className={`px-5 py-2.5 font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'chain'
                ? 'border-white text-white'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Chain
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-5 py-2.5 font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'payments'
                ? 'border-white text-white'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Payments
          </button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'search' && <AgentSearch />}
          {activeTab === 'chain' && <AgentChain />}
          {activeTab === 'payments' && <PaymentTracker />}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <div className="flex gap-4 justify-center">
              <a href="https://github.com" className="hover:text-white transition-colors">
                GitHub
              </a>
              <span>·</span>
              <a href="https://docs.solana.com" className="hover:text-white transition-colors">
                Docs
              </a>
              <span>·</span>
              <a href="https://explorer.solana.com/?cluster=devnet" className="hover:text-white transition-colors">
                Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}


