'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Search, Copy, X, Code, Terminal, Lightbulb, ExternalLink, Check } from 'lucide-react'

const REGISTRY_BASE = process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:3001'

interface Agent {
  id: string
  name: string
  description: string
  endpoint: string
  walletAddress: string
  capabilities: Array<{
    name: string
    description: string
    pricing: {
      amount: number
      currency: string
      model: string
    }
  }>
  tags: string[]
  status: string
}

export function AgentSearch() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [allTags, setAllTags] = useState<string[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(null), 2000)
  }

  useEffect(() => {
    loadAgents()
  }, [])

  useEffect(() => {
    filterAgents()
  }, [searchTerm, selectedTag, agents])

  const loadAgents = async () => {
    try {
      const response = await axios.get(`${REGISTRY_BASE}/agents`)
      const agentData = response.data
      setAgents(agentData)
      setFilteredAgents(agentData)
      
      // Extract unique tags
      const tags = new Set<string>()
      agentData.forEach((agent: Agent) => {
        agent.tags?.forEach((tag: string) => tags.add(tag))
      })
      setAllTags(Array.from(tags).sort())
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to load agents:', err)
      setLoading(false)
    }
  }

  const filterAgents = () => {
    let filtered = agents

    // Filter by search term (name, description, capabilities)
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(term) ||
        agent.description.toLowerCase().includes(term) ||
        agent.capabilities.some(cap => 
          cap.name.toLowerCase().includes(term) ||
          cap.description.toLowerCase().includes(term)
        )
      )
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(agent =>
        agent.tags?.includes(selectedTag)
      )
    }

    setFilteredAgents(filtered)
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-lg p-6 border border-gray-900">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-medium text-white">
            Discover Agents
          </h2>
        </div>
        
        {/* Search Input */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-md border border-gray-900 bg-black text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-colors text-sm"
          />
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 mb-2">Filter by tag</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 rounded-md text-xs transition-all border ${
                  selectedTag === null
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-md text-xs transition-all border ${
                    selectedTag === tag
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-700 hover:text-gray-400'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-400">
          {loading ? (
            <span>Loading agents...</span>
          ) : (
            <span>
              Showing {filteredAgents.length} of {agents.length} agents
              {selectedTag && ` with tag "${selectedTag}"`}
            </span>
          )}
        </div>
      </div>

      {/* Agent Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-gray-400">Loading agents from registry...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-400">No agents found</p>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || selectedTag 
              ? 'Try different search terms or clear filters'
              : 'No agents registered yet. Be the first to register!'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSelectedAgent(agent)
                setShowModal(true)
              }}
              className="border border-gray-900 rounded-lg p-5 hover:border-gray-700 transition-all cursor-pointer"
            >
              {/* Agent Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-medium mb-1 text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-600">{agent.description}</p>
                </div>
                <div className={`px-2 py-0.5 rounded text-xs ${
                  agent.status === 'active'
                    ? 'bg-gray-900 text-gray-500'
                    : 'bg-gray-900 text-gray-600'
                }`}>
                  {agent.status}
                </div>
              </div>

              {/* Capabilities */}
              <div className="mb-3">
                <p className="text-xs text-gray-600 mb-2">Capabilities</p>
                <div className="space-y-1">
                  {agent.capabilities.slice(0, 2).map((cap, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{cap.name}</span>
                      <span className="text-gray-500 text-xs">
                        {cap.pricing.amount} {cap.pricing.currency}
                      </span>
                    </div>
                  ))}
                  {agent.capabilities.length > 2 && (
                    <p className="text-xs text-gray-600">
                      +{agent.capabilities.length - 2} more
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {agent.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-900 text-gray-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-gray-900">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">
                    {agent.walletAddress.slice(0, 6)}...{agent.walletAddress.slice(-4)}
                  </span>
                  <span className="text-gray-500 flex items-center gap-1">
                    View docs
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/30">
        <h3 className="text-lg font-bold mb-4">🚀 Build Your Own x402 Agent</h3>
        <p className="text-gray-300 mb-4">
          Create payment-enabled AI agents in minutes using our SDK. Your agent will automatically appear here once running.
        </p>
        
        <div className="space-y-4">
          {/* Step 1 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
              <span className="font-semibold text-white">Install the SDK</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm ml-8">
              <div className="flex items-center justify-between">
                <span className="text-primary">npm install x402mesh-sdk</span>
                <button
                  onClick={() => handleCopy('npm install x402mesh-sdk', 'install')}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  {copiedText === 'install' ? <Check className="w-4 h-4 text-green-500" /> : '📋'}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
              <span className="font-semibold text-white">Create your agent</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs ml-8 overflow-x-auto">
              <div className="flex items-end justify-between mb-2">
                <span className="text-gray-500 text-xs">my-agent.js</span>
                <button
                  onClick={() => handleCopy(
`import { Agent } from 'x402mesh-sdk';

class MyAgent extends Agent {
  constructor() {
    super({
      name: 'My Agent',
      description: 'Does awesome things',
      version: '1.0.0',
      capabilities: [{
        name: 'my_capability',
        description: 'What it does',
        pricing: { amount: 0.01, currency: 'USDC' }
      }],
      walletAddress: process.env.WALLET_ADDRESS,
      registryUrl: '${REGISTRY_BASE}'
    });
  }

  async executeCapability(name, input) {
    // Your logic here
    return { result: 'success', data: input };
  }
}

const agent = new MyAgent();
agent.start(3000);`,
                    'code'
                  )}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  {copiedText === 'code' ? <Check className="w-4 h-4 text-green-500" /> : '📋 Copy'}
                </button>
              </div>
              <pre className="text-blue-400">
{`import { Agent } from 'x402mesh-sdk';

class MyAgent extends Agent {
  constructor() {
    super({
      name: 'My Agent',
      description: 'Does awesome things',
      version: '1.0.0',
      capabilities: [{
        name: 'my_capability',
        description: 'What it does',
        pricing: { amount: 0.01, currency: 'USDC' }
      }],
      walletAddress: process.env.WALLET_ADDRESS,
      registryUrl: '${REGISTRY_BASE}'
    });
  }

  async executeCapability(name, input) {
    // Your logic here
    return { result: 'success', data: input };
  }
}

const agent = new MyAgent();
agent.start(3000);`}
              </pre>
            </div>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
              <span className="font-semibold text-white">Test locally</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm ml-8 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">REGISTRY_URL={REGISTRY_BASE} node my-agent.js</span>
                <button
                  onClick={() => handleCopy(`REGISTRY_URL=${REGISTRY_BASE} node my-agent.js`, 'run')}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  {copiedText === 'run' ? <Check className="w-4 h-4 text-green-500" /> : '📋'}
                </button>
              </div>
              <div className="text-gray-500 text-xs">
                💡 Or set in .env: <span className="text-gray-400">REGISTRY_URL={REGISTRY_BASE}</span>
              </div>
            </div>
          </div>

          {/* Step 4 - Deploy & Register */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</span>
              <span className="font-semibold text-white">Deploy & register with CLI</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 ml-8 space-y-3">
              
              {/* Deploy first */}
              <div className="text-xs">
                <div className="text-white font-medium mb-2">A. Deploy your agent (choose one):</div>
                <div className="text-gray-500 space-y-1">
                  <div>• Railway, Render, Fly.io, Heroku, VPS, etc.</div>
                  <div>• Make sure it has a public URL (e.g., https://my-agent.railway.app)</div>
                  <div>• Keep it running 24/7</div>
                </div>
              </div>

              {/* Register with CLI */}
              <div className="border-t border-gray-800 pt-3">
                <div className="text-white font-medium mb-2 text-xs">B. Register with the CLI to appear here:</div>
                
                <div className="bg-gray-950 rounded p-3 font-mono text-xs space-y-2">
                  <div>
                    <div className="text-gray-500"># Install CLI</div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary">npm install -g x402mesh-cli</span>
                      <button
                        onClick={() => handleCopy('npm install -g x402mesh-cli', 'cli-install')}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        {copiedText === 'cli-install' ? <Check className="w-4 h-4 text-green-500" /> : '📋'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-gray-500"># Register your agent</div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-primary">x402mesh register \\</div>
                        <div className="text-primary ml-2">--name "My Agent" \\</div>
                        <div className="text-primary ml-2">--endpoint https://my-agent.com \\</div>
                        <div className="text-primary ml-2">--wallet YOUR_WALLET_ADDRESS \\</div>
                        <div className="text-primary ml-2">--description "Does awesome things"</div>
                      </div>
                      <button
                        onClick={() => handleCopy(
                          'x402mesh register \\\n  --name "My Agent" \\\n  --endpoint https://my-agent.com \\\n  --wallet YOUR_WALLET_ADDRESS \\\n  --description "Does awesome things"',
                          'register'
                        )}
                        className="text-gray-400 hover:text-white text-xs flex-shrink-0"
                      >
                        {copiedText === 'register' ? <Check className="w-4 h-4 text-green-500" /> : '📋'}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-2">
                    <div className="text-gray-500"># Or use interactive mode</div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary">x402mesh register --interactive</span>
                      <button
                        onClick={() => handleCopy('x402mesh register --interactive', 'interactive')}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        {copiedText === 'interactive' ? <Check className="w-4 h-4 text-green-500" /> : '📋'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success message */}
              <div className="bg-green-500/10 border border-green-500/30 rounded p-2">
                <div className="text-xs text-green-400">
                  ✨ Once registered, your agent will appear on this page immediately!
                </div>
              </div>
            </div>
          </div>

          {/* CLI Discovery Tip */}
          <div className="pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Terminal className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">💡 CLI Tip: Discover other agents</span>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm ml-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">x402mesh discover</span>
                <button
                  onClick={() => handleCopy('x402mesh discover', 'discover')}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  {copiedText === 'discover' ? <Check className="w-4 h-4 text-green-500" /> : '📋'}
                </button>
              </div>
              <div className="text-gray-600 text-xs mt-1">Find and query agents from the command line</div>
            </div>
          </div>
        </div>
      </div>

      {/* npm Package Cards */}
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {/* SDK Card */}
        <div className="border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all bg-gradient-to-br from-blue-500/5 to-purple-500/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">x402mesh-sdk</h3>
                <p className="text-xs text-gray-500">Build payment-enabled agents</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
              v0.2.0
            </span>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            TypeScript SDK for creating AI agents with built-in x402 payment capabilities on Solana.
          </p>

          <div className="space-y-3">
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-400">npm install x402mesh-sdk</span>
                <button
                  onClick={() => handleCopy('npm install x402mesh-sdk', 'sdk-install')}
                  className="text-gray-400 hover:text-white"
                >
                  {copiedText === 'sdk-install' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <a 
                href="https://www.npmjs.com/package/x402mesh-sdk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                npm package
              </a>
              <a 
                href="https://github.com/yordanlasonov/agent-2-agent-infra/tree/main/packages/sdk" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                GitHub
              </a>
              <span className="text-gray-600">•</span>
              <span className="text-gray-500">19.3 kB</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">TypeScript</span>
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">Solana</span>
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">x402</span>
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">AI Agents</span>
            </div>
          </div>
        </div>

        {/* CLI Card */}
        <div className="border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all bg-gradient-to-br from-green-500/5 to-teal-500/5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">x402mesh-cli</h3>
                <p className="text-xs text-gray-500">Command-line interface</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-mono">
              v0.2.0
            </span>
          </div>

          <p className="text-sm text-gray-400 mb-4">
            CLI tool for discovering, managing, and registering x402 AI agents on the network.
          </p>

          <div className="space-y-3">
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-green-400">npm install -g x402mesh-cli</span>
                <button
                  onClick={() => handleCopy('npm install -g x402mesh-cli', 'cli-card-install')}
                  className="text-gray-400 hover:text-white"
                >
                  {copiedText === 'cli-card-install' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <a 
                href="https://www.npmjs.com/package/x402mesh-cli" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                npm package
              </a>
              <a 
                href="https://github.com/yordanlasonov/agent-2-agent-infra/tree/main/packages/cli" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                GitHub
              </a>
              <span className="text-gray-600">•</span>
              <span className="text-gray-500">6.9 kB</span>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">CLI</span>
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">Discovery</span>
              <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">Registry</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Documentation Modal */}
      {showModal && selectedAgent && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{selectedAgent.name}</h3>
                  <p className="text-gray-400">{selectedAgent.description}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Endpoint */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Endpoint</h4>
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span className="text-primary">{selectedAgent.endpoint}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedAgent.endpoint)}
                    className="text-gray-400 hover:text-white"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Wallet */}
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Payment Address</h4>
                <div className="bg-gray-800 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span className="text-green-400">{selectedAgent.walletAddress}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedAgent.walletAddress)}
                    className="text-gray-400 hover:text-white"
                  >
                    📋
                  </button>
                </div>
              </div>

              {/* Capabilities */}
              {selectedAgent.capabilities.map((cap, i) => (
                <div key={i} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-bold">{cap.name}</h4>
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                      {cap.pricing.amount} {cap.pricing.currency}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{cap.description}</p>

                  {/* Curl Example */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-400">1. Check if payment required (will return 402)</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(
                            `curl -X POST ${selectedAgent.endpoint}/execute \\\n  -H "Content-Type: application/json" \\\n  -d '{"capability":"${cap.name}","input":{}}'`
                          )}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <pre className="bg-gray-950 rounded p-3 text-xs overflow-x-auto">
                        <code className="text-green-400">
{`curl -X POST ${selectedAgent.endpoint}/execute \\
  -H "Content-Type: application/json" \\
  -d '{"capability":"${cap.name}","input":{}}'`}
                        </code>
                      </pre>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-gray-400 block mb-2">Expected Response (402 Payment Required):</span>
                      <pre className="bg-gray-950 rounded p-3 text-xs overflow-x-auto">
                        <code className="text-yellow-400">
{`{
  "error": "Payment Required",
  "paymentRequired": true,
  "payment": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "solana-devnet",
    "recipient": "${selectedAgent.walletAddress}",
    "amount": ${cap.pricing.currency === 'SOL' ? Math.floor(cap.pricing.amount * 1e9) : Math.floor(cap.pricing.amount * 1e6)},
    "memo": "Payment for ${cap.name}"
  }
}`}
                        </code>
                      </pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-400">2. Using the SDK</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(
                            `import { PaymentClient } from 'x402mesh-sdk';\n\nconst client = new PaymentClient();\nconst result = await client.callAgent(\n  '${selectedAgent.id}',\n  '${cap.name}',\n  { /* your input */ }\n);`
                          )}
                          className="text-xs text-gray-400 hover:text-white"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <pre className="bg-gray-950 rounded p-3 text-xs overflow-x-auto">
                        <code className="text-blue-400">
{`import { PaymentClient } from 'x402mesh-sdk';

const client = new PaymentClient();
const result = await client.callAgent(
  '${selectedAgent.id}',
  '${cap.name}',
  { /* your input */ }
);`}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

