'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'

const scenarios = [
  {
    id: 1,
    title: 'Tech Discussion',
    text: 'Artificial intelligence is revolutionizing blockchain technology. Payment systems are becoming more efficient and secure.',
    language: 'spanish',
  },
  {
    id: 2,
    title: 'Customer Feedback',
    text: 'This product is absolutely amazing! The user interface is intuitive and the performance is excellent.',
    language: 'french',
  },
]

export function AgentChain() {
  const { connected, publicKey } = useWallet()
  const [isRunning, setIsRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0])

  const executeChain = async () => {
    if (!connected) {
      alert('Please connect your Phantom wallet first!')
      return
    }

    setIsRunning(true)
    setCurrentStep(0)
    setResults(null)

    try {
      // Step 1: Translation
      setCurrentStep(1)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Step 2: Summarization
      setCurrentStep(2)
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Step 3: Analysis
      setCurrentStep(3)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock results for demo
      setResults({
        translation: {
          text: selectedScenario.text,
          language: selectedScenario.language,
        },
        summary: [
          'AI is revolutionizing blockchain',
          'Payment systems are more efficient',
          'Security improvements are notable',
        ],
        sentiment: {
          score: 0.85,
          label: 'POSITIVE',
          confidence: 0.92,
        },
        payments: [
          { agent: 'Translator', amount: 0.01, signature: '5xT...9mK' },
          { agent: 'Summarizer', amount: 0.02, signature: '7pQ...3xR' },
          { agent: 'Analyzer', amount: 0.015, signature: '2wE...8nP' },
        ],
        totalCost: 0.045,
      })

      setCurrentStep(4)
    } catch (error) {
      console.error('Chain execution failed:', error)
      alert('Failed to execute chain')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Select Scenario</h3>
        <div className="grid md:grid-cols-2 gap-4">
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
              <p className="text-sm text-gray-400">{scenario.text.substring(0, 80)}...</p>
            </button>
          ))}
        </div>
      </div>

      {/* Execute Button */}
      <div className="text-center">
        <button
          onClick={executeChain}
          disabled={isRunning || !connected}
          className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
            isRunning || !connected
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-secondary text-dark hover:scale-105 shadow-lg hover:shadow-primary/50'
          }`}
        >
          {isRunning ? '⏳ Executing Chain...' : connected ? '🚀 Execute Agent Chain' : '🔒 Connect Wallet First'}
        </button>
      </div>

      {/* Chain Visualization */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-6">Agent Chain Flow</h3>
        
        <div className="space-y-4">
          {/* Step 1: Translator */}
          <ChainStep
            icon="🌍"
            title="Translator Agent"
            description="Translating to Spanish"
            price="$0.01 USDC"
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

          {/* Step 2: Summarizer */}
          <ChainStep
            icon="📝"
            title="Summarizer Agent"
            description="Creating bullet points"
            price="$0.02 USDC"
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

          {/* Step 3: Analyzer */}
          <ChainStep
            icon="🔍"
            title="Analyzer Agent"
            description="Analyzing sentiment"
            price="$0.015 USDC"
            active={currentStep >= 3}
            completed={currentStep > 3}
          />
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
              {/* Summary */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">📝 Summary:</h4>
                <ul className="list-disc list-inside text-gray-400 space-y-1">
                  {results.summary.map((point: string, i: number) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>

              {/* Sentiment */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">🔍 Sentiment:</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    results.sentiment.label === 'POSITIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {results.sentiment.label}
                  </span>
                  <span className="text-gray-400 text-sm">
                    Score: {results.sentiment.score} (Confidence: {(results.sentiment.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Payments */}
              <div>
                <h4 className="font-semibold text-gray-300 mb-2">💰 Payments:</h4>
                <div className="space-y-2">
                  {results.payments.map((payment: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <span className="text-gray-300">{payment.agent}</span>
                      <div className="text-right">
                        <div className="text-primary font-semibold">${payment.amount} USDC</div>
                        <div className="text-xs text-gray-500">Tx: {payment.signature}</div>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3 border border-primary/30">
                    <span className="font-bold">Total Cost</span>
                    <span className="text-xl font-bold text-primary">${results.totalCost} USDC</span>
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

