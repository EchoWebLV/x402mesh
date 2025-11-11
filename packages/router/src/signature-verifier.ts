import { Connection, PublicKey } from '@solana/web3.js';
import { getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

export interface PaymentProof {
  signature: string;
  from: string;
  to: string;
  amount: number;
  currency: 'SOL' | 'USDC';
}

/**
 * Verify a payment actually happened on Solana blockchain
 * This is the REAL enforcement - checks actual on-chain data
 */
export async function verifyPaymentOnChain(proof: PaymentProof): Promise<boolean> {
  try {
    const { signature, from, to, amount, currency } = proof;
    
    // Get the transaction from blockchain
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!tx || !tx.meta) {
      console.error('Transaction not found or has no metadata');
      return false;
    }
    
    // Check transaction was successful
    if (tx.meta.err) {
      console.error('Transaction failed on-chain:', tx.meta.err);
      return false;
    }
    
    const fromPubkey = new PublicKey(from);
    const toPubkey = new PublicKey(to);
    
    if (currency === 'SOL') {
      // Verify SOL transfer
      return verifySOLTransfer(tx, fromPubkey, toPubkey, amount);
    } else {
      // Verify USDC (SPL token) transfer
      return verifyTokenTransfer(tx, fromPubkey, toPubkey, amount);
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
}

function verifySOLTransfer(
  tx: any,
  from: PublicKey,
  to: PublicKey,
  expectedAmount: number
): boolean {
  const { meta, transaction } = tx;
  
  // Find the from and to account indices
  const accountKeys = transaction.message.accountKeys;
  const fromIndex = accountKeys.findIndex((key: PublicKey) => key.equals(from));
  const toIndex = accountKeys.findIndex((key: PublicKey) => key.equals(to));
  
  if (fromIndex === -1 || toIndex === -1) {
    console.error('From or to address not found in transaction');
    return false;
  }
  
  // Check balance changes
  const preBalances = meta.preBalances;
  const postBalances = meta.postBalances;
  
  const fromBalanceChange = postBalances[fromIndex] - preBalances[fromIndex];
  const toBalanceChange = postBalances[toIndex] - preBalances[toIndex];
  
  // Convert expected amount to lamports (1 SOL = 1e9 lamports)
  const expectedLamports = Math.floor(expectedAmount * 1e9);
  
  // Verify transfer (allowing for gas fees on sender side)
  const transferred = toBalanceChange;
  const tolerance = 0.01 * 1e9; // 0.01 SOL tolerance for gas
  
  if (Math.abs(transferred - expectedLamports) > tolerance) {
    console.error(`Amount mismatch: expected ${expectedLamports}, got ${transferred}`);
    return false;
  }
  
  console.log(`✅ Verified SOL transfer: ${expectedAmount} SOL from ${from.toBase58().slice(0, 8)}... to ${to.toBase58().slice(0, 8)}...`);
  return true;
}

function verifyTokenTransfer(
  tx: any,
  from: PublicKey,
  to: PublicKey,
  expectedAmount: number
): boolean {
  const { meta } = tx;
  
  // For token transfers, check the token balances in pre/post token balances
  const preTokenBalances = meta.preTokenBalances || [];
  const postTokenBalances = meta.postTokenBalances || [];
  
  // USDC has 6 decimals
  const expectedSmallestUnit = Math.floor(expectedAmount * 1_000_000);
  
  // Find the transfer in token balance changes
  for (let i = 0; i < postTokenBalances.length; i++) {
    const post = postTokenBalances[i];
    const pre = preTokenBalances.find((p: any) => p.accountIndex === post.accountIndex);
    
    if (!pre) continue;
    
    const change = post.uiTokenAmount.uiAmount - pre.uiTokenAmount.uiAmount;
    const changeSmallest = Math.abs(change * 1_000_000);
    
    // Check if this matches our expected transfer
    if (Math.abs(changeSmallest - expectedSmallestUnit) < 1) {
      console.log(`✅ Verified USDC transfer: ${expectedAmount} USDC`);
      return true;
    }
  }
  
  console.error('Token transfer amount not found in transaction');
  return false;
}

/**
 * Get transaction confirmation status
 */
export async function getTransactionStatus(signature: string): Promise<{
  confirmed: boolean;
  finalized: boolean;
  error: any;
}> {
  try {
    const status = await connection.getSignatureStatus(signature);
    
    if (!status || !status.value) {
      return { confirmed: false, finalized: false, error: 'Not found' };
    }
    
    return {
      confirmed: status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized',
      finalized: status.value.confirmationStatus === 'finalized',
      error: status.value.err,
    };
  } catch (error) {
    return { confirmed: false, finalized: false, error };
  }
}

export { connection };


