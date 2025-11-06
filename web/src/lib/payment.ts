import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

/**
 * Create and sign a payment transaction with Phantom wallet
 * This is REAL - Phantom signs it, transaction goes on-chain
 */
export async function createAndSignPayment(
  wallet: any,
  toAddress: string,
  amountSOL: number,
  serviceId: string
): Promise<{
  signature: string;
  payment: any;
}> {
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected or does not support signing');
  }
  
  const connection = new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com',
    'confirmed'
  );
  
  // Create transaction
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: wallet.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: Math.floor(amountSOL * LAMPORTS_PER_SOL),
    })
  );
  
  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = wallet.publicKey;
  
  // Sign with Phantom (REAL SIGNING!)
  const signedTransaction = await wallet.signTransaction(transaction);
  
  // Serialize to send to backend
  const serialized = signedTransaction.serialize();
  const base64Transaction = Buffer.from(serialized).toString('base64');
  
  // Submit to backend for verification and relay
  const response = await axios.post(`${API_BASE}/payments/submit`, {
    signedTransaction: base64Transaction,
    from: wallet.publicKey.toBase58(),
    to: toAddress,
    amount: amountSOL,
    currency: 'SOL',
    serviceId,
  });
  
  return {
    signature: response.data.signature,
    payment: response.data,
  };
}

/**
 * Execute agent chain with REAL payments
 * Each payment is signed by Phantom and verified on-chain
 */
export async function executeChainWithRealPayments(
  wallet: any,
  agents: any[],
  scenario: any
): Promise<any> {
  const payments = [];
  const results = [];
  
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    
    // 1. Create and sign payment with Phantom
    console.log(`💰 Creating payment for ${agent.name}...`);
    const { signature, payment } = await createAndSignPayment(
      wallet,
      agent.walletAddress,
      agent.price,
      agent.capability
    );
    
    payments.push(payment);
    console.log(`✅ Payment confirmed on-chain: ${signature}`);
    
    // 2. Call agent with verified payment
    const input: any = i === 0 ? scenario.input : results[i - 1];
    const response = await axios.post(`${agent.endpoint}/execute`, {
      capability: agent.capability,
      input,
      payment,
    });
    
    results.push(response.data.data);
  }
  
  return {
    results,
    payments,
    totalCost: payments.reduce((sum, p) => sum + p.amount, 0),
  };
}

/**
 * Verify a payment signature on-chain
 */
export async function verifyPayment(signature: string): Promise<boolean> {
  try {
    const response = await axios.post(`${API_BASE}/payments/verify`, {
      signature,
    });
    return response.data.verified;
  } catch {
    return false;
  }
}

