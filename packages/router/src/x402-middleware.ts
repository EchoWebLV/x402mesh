/**
 * x402 Protocol Middleware
 * Standard implementation based on Solana x402 specification
 */

import { Request, Response, NextFunction } from 'express';

interface X402PaymentRequirements {
  x402Version: 1;
  scheme: 'exact' | 'upto';
  network: string;
  recipient: string;
  amount: number;
  token?: string;
  memo?: string;
}

interface X402PaymentProof {
  x402Version: 1;
  scheme: string;
  network: string;
  payload: {
    serializedTransaction: string;
  };
}

/**
 * Parse X-PAYMENT header (base64 encoded)
 */
export function parseXPaymentHeader(headerValue: string): X402PaymentProof | null {
  try {
    const decoded = Buffer.from(headerValue, 'base64').toString('utf-8');
    return JSON.parse(decoded) as X402PaymentProof;
  } catch (error) {
    return null;
  }
}

/**
 * Create X-PAYMENT-RESPONSE header value
 */
export function createXPaymentResponseHeader(
  signature: string,
  verified: boolean,
  explorerUrl?: string
): string {
  const response = {
    x402Version: 1,
    verified,
    signature,
    timestamp: new Date().toISOString(),
    explorerUrl
  };
  
  return Buffer.from(JSON.stringify(response)).toString('base64');
}

/**
 * Create standard 402 Payment Required response
 */
export function create402Response(
  res: Response,
  recipient: string,
  amount: number,
  currency: 'SOL' | 'USDC',
  tokenMint?: string
): void {
  // Convert to smallest units
  const smallestUnits = currency === 'SOL' 
    ? Math.floor(amount * 1_000_000_000)  // lamports
    : Math.floor(amount * 1_000_000);      // microUSDC

  const requirements: X402PaymentRequirements = {
    x402Version: 1,
    scheme: 'exact',
    network: 'solana-devnet',
    recipient,
    amount: smallestUnits,
    token: currency === 'USDC' ? tokenMint : undefined,
    memo: 'Payment for agent service'
  };

  res.status(402).json({
    error: 'Payment Required',
    payment: requirements
  });
}

/**
 * Middleware to check for x402 payment
 */
export function requirePayment(
  recipient: string,
  amount: number,
  currency: 'SOL' | 'USDC',
  tokenMint?: string
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const xPaymentHeader = req.headers['x-payment'] as string | undefined;
    
    if (!xPaymentHeader) {
      // No payment provided - return 402 with requirements
      return create402Response(res, recipient, amount, currency, tokenMint);
    }
    
    // Parse payment proof
    const paymentProof = parseXPaymentHeader(xPaymentHeader);
    
    if (!paymentProof) {
      return res.status(400).json({
        error: 'Invalid X-PAYMENT header format'
      });
    }
    
    // Attach payment proof to request for verification
    (req as any).x402Payment = paymentProof;
    next();
  };
}

/**
 * Send success response with X-PAYMENT-RESPONSE header
 */
export function sendWithPaymentResponse(
  res: Response,
  data: any,
  signature: string,
  explorerUrl?: string
): void {
  const responseHeader = createXPaymentResponseHeader(signature, true, explorerUrl);
  
  res.setHeader('X-PAYMENT-RESPONSE', responseHeader);
  res.json(data);
}

