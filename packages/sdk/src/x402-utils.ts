import { X402PaymentRequirements, X402PaymentProof, X402PaymentResponse } from './types.js';

/**
 * x402 Protocol Utilities
 * Based on official Solana x402 specification:
 * https://solana.com/developers/guides/getstarted/intro-to-x402
 */

/**
 * Create standard x402 PaymentRequirements object
 */
export function createPaymentRequirements(
  recipient: string,
  amount: number,
  currency: 'SOL' | 'USDC',
  network: 'devnet' | 'mainnet' = 'devnet',
  tokenMint?: string
): X402PaymentRequirements {
  // Convert to smallest units
  const smallestUnits = currency === 'SOL' 
    ? Math.floor(amount * 1_000_000_000)  // lamports
    : Math.floor(amount * 1_000_000);      // microUSDC

  return {
    x402Version: 1,
    scheme: 'exact',
    network: network === 'devnet' ? 'solana-devnet' : 'solana-mainnet',
    recipient,
    amount: smallestUnits,
    token: currency === 'USDC' ? tokenMint : undefined,
    memo: `Payment for service`
  };
}

/**
 * Encode PaymentRequirements as base64 (for responses)
 */
export function encodePaymentRequirements(requirements: X402PaymentRequirements): string {
  return Buffer.from(JSON.stringify(requirements)).toString('base64');
}

/**
 * Parse X-PAYMENT header (base64 encoded payment proof)
 */
export function parseXPaymentHeader(headerValue: string): X402PaymentProof {
  try {
    const decoded = Buffer.from(headerValue, 'base64').toString('utf-8');
    return JSON.parse(decoded) as X402PaymentProof;
  } catch (error) {
    throw new Error('Invalid X-PAYMENT header format');
  }
}

/**
 * Create X-PAYMENT-RESPONSE header value (base64 encoded)
 */
export function createXPaymentResponse(
  signature: string,
  verified: boolean = true,
  explorerUrl?: string
): string {
  const response: X402PaymentResponse = {
    x402Version: 1,
    verified: true,
    signature,
    timestamp: new Date().toISOString(),
    explorerUrl
  };
  
  return Buffer.from(JSON.stringify(response)).toString('base64');
}

/**
 * Create x402-compliant 402 error response
 */
export function create402Response(
  recipient: string,
  amount: number,
  currency: 'SOL' | 'USDC',
  tokenMint?: string
) {
  const requirements = createPaymentRequirements(recipient, amount, currency, 'devnet', tokenMint);
  
  return {
    statusCode: 402,
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Required': 'true'
    },
    body: {
      error: 'Payment Required',
      payment: requirements
    }
  };
}

/**
 * Check if request has x402 payment proof
 */
export function hasXPaymentHeader(headers: any): boolean {
  return !!(headers['x-payment'] || headers['X-Payment']);
}

/**
 * Get X-PAYMENT header value (case-insensitive)
 */
export function getXPaymentHeader(headers: any): string | undefined {
  return headers['x-payment'] || headers['X-Payment'];
}

