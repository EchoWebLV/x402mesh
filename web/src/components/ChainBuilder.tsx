'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Send, Copy, Check, Sparkles } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
const REGISTRY_BASE = process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:3001'
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY

interface Agent {
  id: string
  name: string
  capabilities: Array<{
    name: string
    description: string
    pricing: { amount: number; currency: string }
  }>
}

export function ChainBuilder() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const response = await axios.get(`${REGISTRY_BASE}/agents`)
      setAgents(response.data)
    } catch (err) {
      console.error('Failed to load agents:', err)
    }
  }

  const generateChain = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    setResult(null)

    try {
      // Build agent context for AI
      const agentContext = agents.map(a => ({
        id: a.id,
        name: a.name,
        capabilities: a.capabilities.map(c => ({
          name: c.name,
          description: c.description,
          price: `${c.pricing.amount} ${c.pricing.currency}`
        }))
      }))

      // Use AI to build chain (or fallback to simple matching)
      const chain = await buildChainFromPrompt(prompt, agentContext)
      
      setResult(chain)
    } catch (error: any) {
      console.error('Failed to generate chain:', error)
      setResult({
        error: true,
        message: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  const buildChainFromPrompt = async (userPrompt: string, agentContext: any[]) => {
    // Call backend API to generate chain (secure - API key on server)
    try {
      const response = await axios.post(`${API_BASE}/api/generate-chain`, {
        prompt: userPrompt,
        agents: agentContext
      })

      const aiResponse = response.data
      
      // Map AI response to our format
      const selectedAgents = aiResponse.chain.map((step: any) => {
        const agent = agents.find(a => a.id === step.agentId)
        return {
          agent,
          capability: step.capability,
          input: step.input,
          reasoning: step.reasoning
        }
      }).filter((s: any) => s.agent) // Remove if agent not found

      const totalCost = selectedAgents.reduce((sum, s) => {
        const cap = s.agent.capabilities.find((c: any) => c.name === s.capability)
        return sum + (cap?.pricing.amount || 0)
      }, 0)

      return {
        agents: selectedAgents,
        totalCost,
        code: generateCodeSnippet(selectedAgents, userPrompt),
        curl: generateCurlCommand(selectedAgents),
        reasoning: selectedAgents.map((s: any) => s.reasoning)
      }
    } catch (error) {
      console.error('AI generation failed, using fallback', error)
      // Fallback to keyword matching if OpenAI fails
      return buildChainKeywordFallback(userPrompt, agentContext)
    }
  }

  const buildChainKeywordFallback = (userPrompt: string, agentContext: any[]) => {
    // Simple keyword matching fallback
    const lowerPrompt = userPrompt.toLowerCase()
    const selectedAgents: any[] = []

    if (lowerPrompt.includes('image') || lowerPrompt.includes('generate')) {
      const imgAgent = agents.find(a => a.name.includes('Image Generator'))
      if (imgAgent) {
        selectedAgents.push({
          agent: imgAgent,
          capability: 'generate_image',
          input: { prompt: extractImagePrompt(userPrompt), style: 'realistic' }
        })
      }
    }

    if (lowerPrompt.includes('background') || lowerPrompt.includes('remove')) {
      const bgAgent = agents.find(a => a.name.includes('Background Remover'))
      if (bgAgent && selectedAgents.length > 0) {
        selectedAgents.push({
          agent: bgAgent,
          capability: 'remove_background',
          input: {}
        })
      }
    }

    const totalCost = selectedAgents.reduce((sum, s) => {
      const cap = s.agent.capabilities.find((c: any) => c.name === s.capability)
      return sum + (cap?.pricing.amount || 0)
    }, 0)

    return {
      agents: selectedAgents,
      totalCost,
      code: generateCodeSnippet(selectedAgents, userPrompt),
      curl: generateCurlCommand(selectedAgents)
    }
  }

  const extractImagePrompt = (userPrompt: string) => {
    // Extract what to generate
    const match = userPrompt.match(/(?:image|picture|generate)(?:\s+of)?\s+(?:a|an)?\s*(.+?)(?:\s+without|\s+with|$)/i)
    return match ? match[1].trim() : userPrompt
  }

  const generateCodeSnippet = (chain: any[], userPrompt: string) => {
    const chainArray = chain.map(s => `  {
    agentId: '${s.agent.id}',
    capability: '${s.capability}',
    input: ${JSON.stringify(s.input, null, 4).split('\n').join('\n    ')}
  }`).join(',\n')

    return `import { PaymentClient } from '@x402mesh/sdk';

const client = new PaymentClient();

const result = await client.executeChain({
  paymentSource: 'your-wallet-address',
  chain: [
${chainArray}
  ]
});

console.log('Result:', result);
// Total cost: ${chain.reduce((sum, s) => sum + (s.agent.capabilities.find((c: any) => c.name === s.capability)?.pricing.amount || 0), 0).toFixed(3)} SOL`
  }

  const generateCurlCommand = (chain: any[]) => {
    return `curl -X POST http://localhost:3002/payments/chain \\
  -H "Content-Type: application/json" \\
  -d '{
    "paymentSource": "your-wallet",
    "chain": ${JSON.stringify(chain.map(s => ({
      agentId: s.agent.id,
      capability: s.capability,
      input: s.input
    })), null, 2).split('\n').join('\n    ')}
  }'`
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Chat Input */}
      <div className="border border-gray-900 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-gray-500" />
          <h2 className="text-xl font-medium text-white">
            AI Chain Builder
          </h2>
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Describe what you want to build. AI analyzes available agents and generates the optimal chain with proper SDK code.
        </p>

        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                generateChain()
              }
            }}
            placeholder="Example: I want to generate an orc character image without background"
            className="w-full px-4 py-3 bg-black border border-gray-900 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-gray-700 resize-none text-sm"
            rows={3}
          />

          <button
            onClick={generateChain}
            disabled={loading || !prompt.trim()}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              loading || !prompt.trim()
                ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-black rounded-full" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Generate Chain
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && !result.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Summary */}
          <div className="border border-gray-900 rounded-lg p-5">
            <h3 className="text-white font-medium mb-3">Generated Chain</h3>
            <div className="space-y-2">
              {result.agents.map((a: any, i: number) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {i + 1}. {a.agent.name} ({a.capability})
                    </span>
                    <span className="text-gray-600">
                      {a.agent.capabilities.find((c: any) => c.name === a.capability)?.pricing.amount} SOL
                    </span>
                  </div>
                  {a.reasoning && (
                    <p className="text-xs text-gray-600 pl-4">→ {a.reasoning}</p>
                  )}
                </div>
              ))}
              <div className="pt-2 border-t border-gray-900 flex items-center justify-between font-medium">
                <span className="text-white">Total Cost</span>
                <span className="text-white">{result.totalCost.toFixed(3)} SOL</span>
              </div>
            </div>
          </div>

          {/* Code Snippet */}
          <div className="border border-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-900">
              <span className="text-white font-medium text-sm">TypeScript Code</span>
              <button
                onClick={() => handleCopy(result.code)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-black overflow-x-auto">
              <code className="text-sm text-gray-400 font-mono">
                {result.code}
              </code>
            </pre>
          </div>

          {/* Curl Command */}
          <div className="border border-gray-900 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-900">
              <span className="text-white font-medium text-sm">cURL Command</span>
              <button
                onClick={() => handleCopy(result.curl)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
            <pre className="p-4 bg-black overflow-x-auto">
              <code className="text-sm text-gray-400 font-mono">
                {result.curl}
              </code>
            </pre>
          </div>
        </motion.div>
      )}

      {result?.error && (
        <div className="border border-red-900/50 rounded-lg p-5 bg-red-900/10">
          <p className="text-red-400 text-sm">{result.message}</p>
        </div>
      )}

      {/* Examples */}
      {!result && (
        <div className="border border-gray-900 rounded-lg p-5">
          <h3 className="text-white font-medium mb-3 text-sm">Example Prompts</h3>
          <div className="space-y-2">
            {[
              'Generate an orc character image without background',
              'Translate text to Spanish and analyze sentiment',
              'Create an image and summarize its content',
              'Generate a character portrait and analyze the mood'
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="w-full text-left px-3 py-2 bg-gray-900 hover:bg-gray-800 rounded text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

