export interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
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

