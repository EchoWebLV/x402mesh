export interface SignedPaymentRequest {
  // Signed transaction from wallet (base64 encoded)
  signedTransaction: string;
  
  // Payment details
  from: string;
  to: string;
  amount: number;
  currency: 'USDC' | 'SOL';
  serviceId: string;
  
  // Metadata
  metadata?: any;
}

export interface PaymentVerification {
  signature: string;
  verified: boolean;
  onChain: boolean;
  amount: number;
  from: string;
  to: string;
  timestamp: string;
}


