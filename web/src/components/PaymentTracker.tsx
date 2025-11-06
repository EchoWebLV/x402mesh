'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Payment {
  id: string
  from: string
  to: string
  amount: number
  status: string
  timestamp: string
  signature?: string
}

export function PaymentTracker() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    volume: 0,
  })

  useEffect(() => {
    // Mock payment data
    const mockPayments: Payment[] = [
      {
        id: 'tx-1',
        from: '7xK9q...2Bn3',
        to: 'Trans...r123',
        amount: 0.01,
        status: 'completed',
        timestamp: new Date().toISOString(),
        signature: '5xT...9mK',
      },
      {
        id: 'tx-2',
        from: '7xK9q...2Bn3',
        to: 'Summ...r456',
        amount: 0.02,
        status: 'completed',
        timestamp: new Date().toISOString(),
        signature: '7pQ...3xR',
      },
      {
        id: 'tx-3',
        from: '7xK9q...2Bn3',
        to: 'Analy...r789',
        amount: 0.015,
        status: 'completed',
        timestamp: new Date().toISOString(),
        signature: '2wE...8nP',
      },
    ]

    setPayments(mockPayments)
    setStats({
      total: mockPayments.length,
      successful: mockPayments.filter(p => p.status === 'completed').length,
      volume: mockPayments.reduce((sum, p) => sum + p.amount, 0),
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="Total Payments"
          value={stats.total.toString()}
          icon="📊"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Successful"
          value={stats.successful.toString()}
          icon="✓"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Total Volume"
          value={`$${stats.volume.toFixed(3)}`}
          icon="💰"
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Payment List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-bold mb-4">Recent Payments</h3>
        
        <div className="space-y-3">
          {payments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No payments yet. Execute an agent chain to see payments here!
            </div>
          ) : (
            payments.map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-primary/50 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💸</span>
                    <div>
                      <div className="font-semibold text-sm">
                        {payment.from} → {payment.to}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(payment.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">
                      ${payment.amount} USDC
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      payment.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {payment.status}
                    </div>
                  </div>
                </div>
                
                {payment.signature && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    <a
                      href={`https://explorer.solana.com/tx/${payment.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <span>🔍</span>
                      <span>View on Solana Explorer: {payment.signature}</span>
                    </a>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: {
  title: string
  value: string
  icon: string
  color: string
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-gray-400 text-sm">{title}</h4>
        <div className={`text-2xl bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </motion.div>
  )
}

