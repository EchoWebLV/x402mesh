'use client'

import { motion } from 'framer-motion'

const agents = [
  {
    name: 'Translator',
    icon: '🌍',
    description: 'Translate text between languages',
    price: '$0.01 USDC',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Summarizer',
    icon: '📝',
    description: 'AI-powered text summarization',
    price: '$0.02 USDC',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Analyzer',
    icon: '🔍',
    description: 'Sentiment and tone analysis',
    price: '$0.015 USDC',
    color: 'from-blue-500 to-cyan-500',
  },
]

export function AgentCards() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      {agents.map((agent, index) => (
        <motion.div
          key={agent.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-primary/50 transition-all"
        >
          <div className="text-4xl mb-3">{agent.icon}</div>
          <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
          <p className="text-gray-400 text-sm mb-4">{agent.description}</p>
          <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${agent.color} text-white text-sm font-semibold`}>
            {agent.price}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

