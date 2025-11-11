'use client'

import { useState } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { AgentChain } from '@/components/AgentChain'
import { AgentSearch } from '@/components/AgentSearch'
import { ChainBuilder } from '@/components/ChainBuilder'
import { Bot, Search, Link2, Code, Terminal } from 'lucide-react'

export default function HomeClient() {
  const [activeTab, setActiveTab] = useState<'chain' | 'builder' | 'search'>('chain')

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
                  x402mesh
                </h1>
                <p className="text-xs text-gray-500">
                  Agent Payment Infrastructure
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
            Build, Discover, and Chain Payment-Enabled AI Agents
          </h2>
          <p className="text-gray-500 leading-relaxed">
            <strong className="text-white">x402mesh</strong> is the infrastructure for the agent economy. 
            Register your agents to make them discoverable, or find and chain existing agents into workflows. 
            Featuring hybrid chain execution with auto-chaining and template variables. 
            Payments automatically route to each agent and settle on Solana.
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
            onClick={() => setActiveTab('builder')}
            className={`px-5 py-2.5 font-medium transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'builder'
                ? 'border-white text-white'
                : 'border-transparent text-gray-600 hover:text-gray-400'
            }`}
          >
            <Code className="w-4 h-4" />
            Builder
          </button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'search' && <AgentSearch />}
          {activeTab === 'chain' && <AgentChain />}
          {activeTab === 'builder' && <ChainBuilder />}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <div className="mb-2">
              <span className="text-white font-semibold">x402mesh</span> - Agent Payment Infrastructure
            </div>
            <div className="flex gap-4 justify-center">
              <a href="https://github.com/yordanlasonov/agent-2-agent-infra" className="hover:text-white transition-colors">
                GitHub
              </a>
              <span>·</span>
              <a href="https://www.npmjs.com/package/x402mesh-sdk" className="hover:text-white transition-colors">
                npm
              </a>
              <span>·</span>
              <a href="https://explorer.solana.com/?cluster=devnet" className="hover:text-white transition-colors">
                Solana Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}


