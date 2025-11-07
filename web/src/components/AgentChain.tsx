'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { sendSOLPayment, sendUSDCPayment } from '@/lib/solana'

const scenarios = [
  {
    id: 1,
    title: 'Tech Discussion',
    text: 'Artificial intelligence is revolutionizing blockchain technology. Payment systems are becoming more efficient and secure.',
    language: 'spanish',
    type: 'text'
  },
  {
    id: 2,
    title: 'Customer Feedback',
    text: 'This product is absolutely amazing! The user interface is intuitive and the performance is excellent.',
    language: 'french',
    type: 'text'
  },
  {
    id: 3,
    title: 'Market Analysis',
    text: 'The cryptocurrency market shows volatile behavior. Decentralized finance platforms are gaining significant traction.',
    language: 'german',
    type: 'text'
  },
  {
    id: 4,
    title: 'AI Image Generation',
    text: 'a futuristic robot character in cyberpunk style',
    prompt: 'a futuristic robot character in cyberpunk style',
    type: 'image'
  },
]

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'
const REGISTRY_BASE = process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:3001'
const USE_REAL_PAYMENTS = process.env.NEXT_PUBLIC_REAL_PAYMENTS === 'true'

export function AgentChain() {
  const wallet = useWallet()
  const { connected, publicKey } = wallet
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0])
  const [agents, setAgents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [balance, setBalance] = useState<number>(0)

  // Check backend status on mount
  useEffect(() => {
    checkBackendStatus()
  }, [])

  // Check wallet balance
  useEffect(() => {
    if (connected && publicKey) {
      checkBalance()
    }
  }, [connected, publicKey])

  const checkBalance = async () => {
    if (!publicKey) return
    try {
      const { getBalance } = await import('@/lib/solana')
      const bal = await getBalance(publicKey)
      setBalance(bal)
    } catch (err) {
      console.error('Failed to get balance:', err)
    }
  }

  const checkBackendStatus = async () => {
    try {
      await axios.get(`${API_BASE}/health`, { timeout: 3000 })
      await axios.get(`${REGISTRY_BASE}/health`, { timeout: 3000 })
      setBackendStatus('online')
      loadAgents()
    } catch (err) {
      setBackendStatus('offline')
      console.error('Backend services not running:', err)
    }
  }

  const loadAgents = async () => {
    try {
      const response = await axios.get(`${REGISTRY_BASE}/agents`)
      setAgents(response.data)
    } catch (err) {
      console.error('Failed to load agents:', err)
    }
  }

  const executeChain = async () => {
    if (!connected) {
      alert('Please connect your Phantom wallet first!')
      return
    }

    if (backendStatus === 'offline') {
      alert('Backend services are not running. Please start them with: npm run dev')
      return
    }

    setIsRunning(true)
    setCurrentStep(0)
    setResults(null)
    setError(null)

    try {
      // Determine chain based on scenario type
      let chainPayload: any[] = []
      
      if (selectedScenario.type === 'image') {
        // Image generation scenario
        const imageGenerator = agents.find(a => a.name === 'Image Generator')
        const backgroundRemover = agents.find(a => a.name === 'Background Remover')

        if (!imageGenerator || !backgroundRemover) {
          throw new Error('Image agents not found. Please ensure Image Generator and Background Remover are running.')
        }

        chainPayload = [
          {
            agentId: imageGenerator.id,
            capability: 'generate_image',
            input: {
              prompt: selectedScenario.prompt || selectedScenario.text,
              style: 'cyberpunk',
            },
          },
          {
            agentId: backgroundRemover.id,
            capability: 'remove_background',
            input: {},
          },
        ]
      } else {
        // Text processing scenario
        const translator = agents.find(a => a.name === 'Translator Agent')
        const summarizer = agents.find(a => a.name === 'Summarizer Agent')
        const analyzer = agents.find(a => a.name === 'Analyzer Agent')

        if (!translator || !summarizer || !analyzer) {
          throw new Error('Required agents not found. Please ensure all agents are running.')
        }

        chainPayload = [
          {
            agentId: translator.id,
            capability: 'translate',
            input: {
              text: selectedScenario.text,
              targetLanguage: selectedScenario.language,
            },
          },
          {
            agentId: summarizer.id,
            capability: 'summarize',
            input: {},
          },
          {
            agentId: analyzer.id,
            capability: 'analyze_sentiment',
            input: {},
          },
        ]
      }

      // Execute real chain via backend
      setCurrentStep(1)

      let signatures: string[] | undefined

      if (USE_REAL_PAYMENTS) {
        if (!publicKey) {
          throw new Error('Wallet not connected')
        }

        signatures = []

        for (let i = 0; i < chainPayload.length; i++) {
          const step = chainPayload[i]
          const agentMeta = [translator, summarizer, analyzer][i]
          const capability = agentMeta?.capabilities.find((c: any) => c.name === step.capability)

          if (!capability) {
            throw new Error(`Pricing not found for capability ${step.capability}`)
          }

          const amount = capability.pricing.amount
          const currency = capability.pricing.currency

          try {
            if (currency === 'SOL') {
              const signature = await sendSOLPayment(wallet, agentMeta.walletAddress, amount)
              signatures.push(signature)
            } else if (currency === 'USDC') {
              const signature = await sendUSDCPayment(wallet, agentMeta.walletAddress, amount)
              signatures.push(signature)
            } else {
              throw new Error(`Unsupported currency ${currency}`)
            }
          } catch (paymentError: any) {
            throw new Error(`Payment for ${agentMeta.name} failed: ${paymentError.message || paymentError}`)
          }
        }
      }

      const chainResponse = await axios.post(`${API_BASE}/payments/chain`, {
        paymentSource: publicKey?.toBase58() || 'UserWallet000',
        chain: chainPayload,
        signatures,
      })

      setCurrentStep(2)
      await new Promise(resolve => setTimeout(resolve, 500))
      setCurrentStep(3)
      await new Promise(resolve => setTimeout(resolve, 500))
      setCurrentStep(4)

      // Process results based on scenario type
      if (selectedScenario.type === 'image') {
        const [imageResult, bgRemovalResult] = chainResponse.data.results

        setResults({
          imageGeneration: imageResult,
          backgroundRemoval: bgRemovalResult,
          type: 'image',
          payments: chainResponse.data.payments.map((p: any, idx: number) => ({
            agent: ['Image Generator', 'Background Remover'][idx],
            amount: p.amount,
            signature: p.signature || p.transactionId.substring(0, 8) + '...' + p.transactionId.substring(p.transactionId.length - 4),
            transactionId: p.transactionId,
            explorerUrl: p.explorerUrl,
          })),
          totalCost: chainResponse.data.totalCost,
          executionTime: chainResponse.data.executionTime,
        })
      } else {
        const [translationResult, summaryResult, analysisResult] = chainResponse.data.results

        setResults({
          translation: translationResult,
          summary: summaryResult.summary,
          summaryDetails: {
            wordCount: summaryResult.wordCount,
            compressionRatio: summaryResult.compressionRatio,
          },
          sentiment: {
            score: analysisResult.score,
            label: analysisResult.sentiment,
            insights: analysisResult.insights,
          },
          type: 'text',
          payments: chainResponse.data.payments.map((p: any, idx: number) => ({
            agent: ['Translator', 'Summarizer', 'Analyzer'][idx],
            amount: p.amount,
            signature: p.signature || p.transactionId.substring(0, 8) + '...' + p.transactionId.substring(p.transactionId.length - 4),
            transactionId: p.transactionId,
            explorerUrl: p.explorerUrl,
          })),
          totalCost: chainResponse.data.totalCost,
          executionTime: chainResponse.data.executionTime,
        })
      }

      if (USE_REAL_PAYMENTS) {
        await checkBalance()
      }

    } catch (error: any) {
      console.error('Chain execution failed:', error)
      setError(error.response?.data?.error || error.message || 'Failed to execute chain')
      alert(`Error: ${error.response?.data?.error || error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Backend Status */}
      {backendStatus === 'offline' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-bold text-red-400">Backend Services Offline</h4>
            <p className="text-sm text-gray-400">
              Run <code className="bg-gray-800 px-2 py-1 rounded">npm run dev</code> in a separate terminal to start the backend services.
            </p>
          </div>
        </div>
      )}
      
      {backendStatus === 'online' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
          <span className="text-green-400 text-xl">✓</span>
          <div className="text-sm flex-1">
            <span className="text-green-400 font-semibold">Backend Online</span>
            <span className="text-gray-400 ml-2">• {agents.length} agents registered</span>
          </div>
          {connected && (
            <div className="text-sm text-gray-400">
              Balance: <span className="text-primary font-semibold">{balance.toFixed(4)} SOL</span>
            </div>
          )}
        </div>
      )}

      {/* Scenario Selection */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Select Scenario</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              disabled={isRunning}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedScenario.id === scenario.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-700 hover:border-gray-600'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <h4 className="font-bold mb-2">{scenario.title}</h4>
              <p className="text-sm text-gray-400">{scenario.text.substring(0, 60)}...</p>
              <p className="text-xs text-primary mt-2">→ {scenario.language}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Execute Button */}
      <div className="text-center">
        <button
          onClick={executeChain}
          disabled={isRunning || !connected || backendStatus !== 'online'}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
            isRunning || !connected || backendStatus !== 'online'
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-secondary text-dark hover:scale-105 shadow-lg hover:shadow-primary/50'
          }`}
        >
          {isRunning ? '⏳ Executing Chain...' : 
           !connected ? '🔒 Connect Wallet First' :
           backendStatus !== 'online' ? '⚠️ Backend Offline' :
           '🚀 Execute Agent Chain'}
        </button>
      </div>

      {/* Chain Visualization */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-6">Agent Chain Flow</h3>
        
        <div className="space-y-4">
          {selectedScenario.type === 'image' ? (
            <>
              {/* Image Scenario */}
              <ChainStep
                icon="🎨"
                title="Image Generator"
                description={`Generate: ${selectedScenario.prompt?.slice(0, 30)}...`}
                price="0.010 SOL"
                active={currentStep >= 1}
                completed={currentStep > 1}
              />

              <div className="h-8 flex items-center justify-center">
                <motion.div
                  className="w-1 h-8 bg-gradient-to-b from-primary to-transparent"
                  initial={{ height: 0 }}
                  animate={{ height: currentStep >= 2 ? 32 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <ChainStep
                icon="🖼️"
                title="Background Remover"
                description="Remove background from image"
                price="0.008 SOL"
                active={currentStep >= 2}
                completed={currentStep > 2}
              />
            </>
          ) : (
            <>
              {/* Text Scenario */}
              <ChainStep
                icon="🌍"
                title="Translator Agent"
                description={`Translating to ${selectedScenario.language}`}
                price="0.010 SOL"
                active={currentStep >= 1}
                completed={currentStep > 1}
              />

              <div className="h-8 flex items-center justify-center">
                <motion.div
                  className="w-1 h-8 bg-gradient-to-b from-primary to-transparent"
                  initial={{ height: 0 }}
                  animate={{ height: currentStep >= 2 ? 32 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <ChainStep
                icon="📝"
                title="Summarizer Agent"
                description="Creating bullet points"
                price="0.015 SOL"
                active={currentStep >= 2}
                completed={currentStep > 2}
              />

              <div className="h-8 flex items-center justify-center">
                <motion.div
                  className="w-1 h-8 bg-gradient-to-b from-primary to-transparent"
                  initial={{ height: 0 }}
                  animate={{ height: currentStep >= 3 ? 32 : 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <ChainStep
                icon="🔍"
                title="Analyzer Agent"
                description="Analyzing sentiment"
                price="0.012 SOL"
                active={currentStep >= 3}
                completed={currentStep > 3}
              />
            </>
          )}
        </div>
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-primary/30"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>✨</span>
              <span>Chain Results</span>
            </h3>

            <div className="space-y-4">
              {/* Image Results */}
              {results.type === 'image' && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Image Generated:</h4>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm mb-2">Prompt: {results.imageGeneration.prompt}</p>
                      <p className="text-gray-500 text-xs">
                        {results.imageGeneration.dimensions.width}x{results.imageGeneration.dimensions.height} • {results.imageGeneration.model}
                      </p>
                      <p className="text-gray-600 text-xs mt-2">{results.imageGeneration.note}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Background Removed:</h4>
                    <div className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">Transparency: {results.backgroundRemoval.transparency ? 'Yes' : 'No'}</p>
                      <p className="text-gray-400 text-sm">Format: {results.backgroundRemoval.format.toUpperCase()}</p>
                      <p className="text-gray-600 text-xs mt-2">{results.backgroundRemoval.note}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Text Results */}
              {results.type === 'text' && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Translation ({results.translation.language}):</h4>
                    <p className="text-gray-400 bg-gray-800/50 rounded-lg p-3">
                      {results.translation.translatedText}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Summary:</h4>
                    <ul className="list-disc list-inside text-gray-400 space-y-1">
                      {results.summary.map((point: string, i: number) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                    {results.summaryDetails && (
                      <p className="text-xs text-gray-500 mt-2">
                        {results.summaryDetails.wordCount} words • {results.summaryDetails.compressionRatio} compression
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-300 mb-2">Sentiment Analysis:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          results.sentiment.label === 'POSITIVE' ? 'bg-green-500/20 text-green-400' : 
                          results.sentiment.label === 'NEGATIVE' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {results.sentiment.label}
                        </span>
                        <span className="text-gray-400 text-sm">
                          Score: {results.sentiment.score.toFixed(2)}
                        </span>
                      </div>
                      {results.sentiment.insights && results.sentiment.insights.length > 0 && (
                        <ul className="text-sm text-gray-400 space-y-1">
                          {results.sentiment.insights.map((insight: string, i: number) => (
                            <li key={i}>• {insight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Payments */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">💰 Payments:</h4>
                <div className="space-y-2">
                  {results.payments.map((payment: any, i: number) => (
                    <div key={i} className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800/70 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 font-semibold">{payment.agent}</span>
                        <div className="text-primary font-bold text-lg">{payment.amount.toFixed(3)} SOL</div>
                      </div>
                      <a 
                        href={payment.explorerUrl || `https://explorer.solana.com/tx/${payment.transactionId}?cluster=devnet`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors group cursor-pointer"
                      >
                        <span>🔍</span>
                        <span className="flex-1">
                          {payment.explorerUrl ? 'View on Solana Explorer (Devnet)' : 'View Transaction Details'}
                        </span>
                        <span className="text-gray-500 group-hover:text-gray-400">↗</span>
                      </a>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        Tx ID: {payment.signature || payment.transactionId}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3 border border-primary/30">
                    <div>
                      <span className="font-bold">Total Cost</span>
                      {results.executionTime && (
                        <span className="text-xs text-gray-400 ml-2">• {results.executionTime}ms</span>
                      )}
                    </div>
                    <span className="text-xl font-bold text-primary">{results.totalCost.toFixed(3)} SOL</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChainStep({ icon, title, description, price, active, completed }: {
  icon: string
  title: string
  description: string
  price: string
  active: boolean
  completed: boolean
}) {
  return (
    <motion.div
      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
        active ? 'border-primary bg-primary/5' : 'border-gray-700'
      }`}
      animate={{
        scale: active && !completed ? [1, 1.02, 1] : 1,
      }}
      transition={{
        repeat: active && !completed ? Infinity : 0,
        duration: 1.5,
      }}
    >
      <div className="text-3xl">{icon}</div>
      <div className="flex-1">
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      <div className="text-right">
        <div className="text-sm text-primary font-semibold">{price}</div>
        {completed && <div className="text-xs text-green-400">✓ Complete</div>}
        {active && !completed && <div className="text-xs text-yellow-400 animate-pulse">⏳ Processing</div>}
      </div>
    </motion.div>
  )
}

