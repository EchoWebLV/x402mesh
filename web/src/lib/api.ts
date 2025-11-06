import axios from 'axios'

const API_BASE = {
  registry: process.env.NEXT_PUBLIC_REGISTRY_URL || 'http://localhost:3001',
  router: process.env.NEXT_PUBLIC_ROUTER_URL || 'http://localhost:3002',
}

export interface Agent {
  id: string
  name: string
  description: string
  capabilities: any[]
  endpoint: string
  walletAddress: string
  tags?: string[]
}

export interface Payment {
  transactionId: string
  status: 'pending' | 'completed' | 'failed'
  amount: number
  currency: string
  timestamp: string
  from?: string
  to?: string
  signature?: string
  explorerUrl?: string
}

export async function getAgents(): Promise<Agent[]> {
  try {
    const response = await axios.get(`${API_BASE.registry}/agents`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch agents:', error)
    return []
  }
}

export async function executeAgentChain(params: {
  paymentSource: string
  chain: Array<{
    agentId: string
    capability: string
    input: any
  }>
}): Promise<any> {
  try {
    const response = await axios.post(`${API_BASE.router}/payments/chain`, params)
    return response.data
  } catch (error) {
    console.error('Failed to execute chain:', error)
    throw error
  }
}

export async function getPaymentHistory(): Promise<Payment[]> {
  try {
    const response = await axios.get(`${API_BASE.router}/payments/history`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch payment history:', error)
    return []
  }
}

export async function processPayment(params: {
  from: string
  to: string
  amount: number
  currency: 'USDC' | 'SOL'
  serviceId: string
}): Promise<Payment> {
  try {
    const response = await axios.post(`${API_BASE.router}/payments/process`, params)
    return response.data
  } catch (error) {
    console.error('Failed to process payment:', error)
    throw error
  }
}

