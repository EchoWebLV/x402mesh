'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

interface Payment {
  id: string
  from: string
  to: string
  amount: number
  status: string
  timestamp: string
  signature?: string
  explorerUrl?: string
  transactionId: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

export function PaymentTracker() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    volume: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPayments()
    // Refresh every 5 seconds
    const interval = setInterval(loadPayments, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadPayments = async () => {
    try {
      const [historyResponse, statsResponse] = await Promise.all([
        axios.get(`${API_BASE}/payments/history`),
        axios.get(`${API_BASE}/stats`),
      ])

      const paymentHistory = historyResponse.data.map((p: any) => ({
        id: p.transactionId,
        transactionId: p.transactionId,
        from: p.from ? truncateAddress(p.from) : 'Unknown',
        to: p.to ? truncateAddress(p.to) : 'Unknown',
        amount: p.amount,
        status: p.status,
        timestamp: p.timestamp,
        signature: p.signature,
        explorerUrl: p.explorerUrl,
      }))

      setPayments(paymentHistory)
      setStats({
        total: statsResponse.data.totalProcessed,
        successful: statsResponse.data.successful,
        volume: statsResponse.data.totalVolume,
      })
      setError(null)
    } catch (err: any) {
      console.error('Failed to load payments:', err)
      setError('Backend offline')
    } finally {
      setLoading(false)
    }
  }

  const truncateAddress = (address: string): string => {
    if (address.length <= 12) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Error/Loading State */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold text-yellow-400">Backend Offline</h4>
            <p className="text-sm text-gray-400">
              Unable to fetch payment data. Start backend with: <code className="bg-gray-800 px-2 py-1 rounded">npm run dev</code>
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard
          title="Total Payments"
          value={loading ? '...' : stats.total.toString()}
          icon="📊"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Successful"
          value={loading ? '...' : stats.successful.toString()}
          icon="✓"
          color="from-green-500 to-emerald-500"
        />
        <StatCard
          title="Total Volume"
          value={loading ? '...' : `$${stats.volume.toFixed(4)}`}
          icon="💰"
          color="from-purple-500 to-pink-500"
        />
      </div>

      {/* Payment List */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Recent Payments</h3>
          {!loading && !error && (
            <button 
              onClick={loadPayments}
              className="text-sm text-gray-400 hover:text-primary transition-colors"
            >
              🔄 Refresh
            </button>
          )}
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="animate-spin text-4xl mb-2">⏳</div>
              Loading payments...
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <div className="text-4xl mb-2">💸</div>
              No payments yet. Execute an agent chain to see payments here!
            </div>
          ) : (
            payments.slice().reverse().map((payment, index) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
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
                      ${payment.amount.toFixed(4)} USDC
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      payment.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400'
                        : payment.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {payment.status}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <a
                    href={payment.explorerUrl || `https://explorer.solana.com/tx/${payment.transactionId}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 hover:underline transition-colors group cursor-pointer"
                  >
                    <span className="text-lg">🔍</span>
                    <div className="flex-1">
                      <div className="font-medium">View Transaction on Solana Explorer (Devnet)</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-400 font-mono">
                        Tx ID: {payment.signature || payment.transactionId}
                      </div>
                    </div>
                    <span className="text-gray-500 group-hover:text-gray-400">↗</span>
                  </a>
                </div>
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

