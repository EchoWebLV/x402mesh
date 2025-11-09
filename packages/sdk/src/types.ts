// x402 Protocol Standard Types
export interface X402PaymentRequirements {
  x402Version: 1;
  scheme: 'exact' | 'upto';
  network: 'solana-devnet' | 'solana-mainnet';
  recipient: string;  // Wallet address
  amount: number;     // In smallest units (lamports for SOL, microUSDC for USDC)
  token?: string;     // SPL token mint address (optional, SOL if omitted)
  memo?: string;
  deadline?: number;  // Unix timestamp
}

export interface X402PaymentProof {
  x402Version: 1;
  scheme: 'exact';
  network: string;
  payload: {
    serializedTransaction: string;  // base64-encoded signed transaction
  };
}

export interface X402PaymentResponse {
  x402Version: 1;
  verified: true;
  signature: string;
  timestamp: string;
  amount?: number;
  explorerUrl?: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  schema?: string;  // Standard schema ID for auto-chaining (e.g., 'text_processing_v1')
  pricing: {
    amount: number;
    currency: 'USDC' | 'SOL';
    model: 'per_request' | 'per_token' | 'per_minute';
  };
}

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  endpoint: string;
  walletAddress: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentRequest {
  from: string;
  to: string;
  amount: number;
  currency: 'USDC' | 'SOL';
  serviceId: string;
  metadata?: any;
  transactionSignature?: string;
  // x402 standard fields
  x402Proof?: X402PaymentProof;  // Standard x402 payment proof
}

export interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  timestamp: string;
  from?: string;
  to?: string;
  serviceId?: string;
  signature?: string;
  explorerUrl?: string;
}

export interface AgentRequest {
  agentId: string;
  capability: string;
  input: any;
  payment?: PaymentRequest;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  payment?: PaymentResponse;
}

export interface ChainedRequest {
  chain: {
    agentId: string;
    capability: string;
    input: any;
  }[];
  paymentSource: string;
  signatures?: string[];
}

export interface ChainedResponse {
  results: any[];
  totalCost: number;
  payments: PaymentResponse[];
  executionTime: number;
}

