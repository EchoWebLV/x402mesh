'use client'

import { motion } from 'framer-motion'
import { Globe, FileText, BarChart3 } from 'lucide-react'

const agents = [
  {
    name: 'Translator',
    Icon: Globe,
    description: 'Translate text between languages',
    price: '0.010 SOL',
  },
  {
    name: 'Summarizer',
    Icon: FileText,
    description: 'AI-powered text summarization',
    price: '0.015 SOL',
  },
  {
    name: 'Analyzer',
    Icon: BarChart3,
    description: 'Sentiment and tone analysis',
    price: '0.012 SOL',
  },
]

export function AgentCards() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
      {agents.map((agent, index) => {
        const Icon = agent.Icon
        return (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-900 rounded-lg p-5 hover:border-gray-700 transition-all"
          >
            <Icon className="w-5 h-5 text-gray-400 mb-3" />
            <h3 className="text-base font-medium mb-1 text-white">{agent.name}</h3>
            <p className="text-gray-600 text-sm mb-3">{agent.description}</p>
            <div className="text-xs text-gray-500">
              {agent.price}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

