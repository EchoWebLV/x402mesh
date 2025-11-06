import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getOrCreateKeypair } from './wallet-utils.js';

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

/**
 * Airdrop SOL to a wallet (devnet only)
 */
export async function airdropSol(walletName: string, amount: number = 1): Promise<string> {
  try {
    const keypair = await getOrCreateKeypair(walletName);
    const publicKey = keypair.publicKey;
    
    console.log(`🪂 Requesting ${amount} SOL airdrop for ${walletName}...`);
    console.log(`   Address: ${publicKey.toBase58()}`);
    
    const signature = await connection.requestAirdrop(
      publicKey,
      amount * LAMPORTS_PER_SOL
    );
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    console.log(`✅ Airdrop successful!`);
    console.log(`   Signature: ${signature}`);
    console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
    
    return signature;
  } catch (error: any) {
    console.error('Airdrop failed:', error.message);
    throw error;
  }
}

/**
 * Get SOL balance for a wallet
 */
export async function getBalance(walletName: string): Promise<number> {
  const keypair = await getOrCreateKeypair(walletName);
  const balance = await connection.getBalance(keypair.publicKey);
  return balance / LAMPORTS_PER_SOL;
}

/**
 * Check and fund wallet if needed
 */
export async function ensureFunded(walletName: string, minBalance: number = 0.5): Promise<void> {
  const balance = await getBalance(walletName);
  console.log(`💰 ${walletName} balance: ${balance.toFixed(4)} SOL`);
  
  if (balance < minBalance) {
    console.log(`   Balance too low, requesting airdrop...`);
    await airdropSol(walletName, 2);
    const newBalance = await getBalance(walletName);
    console.log(`   New balance: ${newBalance.toFixed(4)} SOL`);
  }
}


