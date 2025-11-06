import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { getOrCreateKeypair } from './wallet-utils.js';

// Devnet USDC mint (we'll create our own for demo)
let USDC_MINT: PublicKey | null = null;
let MINT_AUTHORITY: Keypair | null = null;

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

/**
 * Initialize USDC mint for testing (devnet only)
 * In production, use real USDC mint address
 */
export async function initializeUSDCMint(): Promise<PublicKey> {
  if (USDC_MINT) {
    return USDC_MINT;
  }

  try {
    // Create mint authority
    MINT_AUTHORITY = await getOrCreateKeypair('USDCMintAuthority');
    
    console.log('💵 Initializing USDC mint for testing...');
    
    // Create USDC-like token with 6 decimals (same as real USDC)
    USDC_MINT = await createMint(
      connection,
      MINT_AUTHORITY,
      MINT_AUTHORITY.publicKey,
      null,
      6, // USDC has 6 decimals
      undefined,
      undefined,
      TOKEN_PROGRAM_ID
    );
    
    console.log(`✅ USDC Mint created: ${USDC_MINT.toBase58()}`);
    console.log(`   Explorer: https://explorer.solana.com/address/${USDC_MINT.toBase58()}?cluster=devnet`);
    
    return USDC_MINT;
  } catch (error: any) {
    console.error('Failed to initialize USDC mint:', error.message);
    throw error;
  }
}

/**
 * Get or create USDC token account for a wallet
 */
export async function getOrCreateUSDCAccount(walletName: string): Promise<PublicKey> {
  if (!USDC_MINT) {
    await initializeUSDCMint();
  }
  
  const walletKeypair = await getOrCreateKeypair(walletName);
  
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    walletKeypair,
    USDC_MINT!,
    walletKeypair.publicKey
  );
  
  return tokenAccount.address;
}

/**
 * Mint USDC to a wallet (for testing only)
 */
export async function mintUSDC(walletName: string, amount: number): Promise<string> {
  if (!USDC_MINT || !MINT_AUTHORITY) {
    await initializeUSDCMint();
  }
  
  const tokenAccount = await getOrCreateUSDCAccount(walletName);
  
  // Convert to smallest unit (6 decimals)
  const amountInSmallestUnit = Math.floor(amount * 1_000_000);
  
  console.log(`💵 Minting ${amount} USDC to ${walletName}...`);
  
  const signature = await mintTo(
    connection,
    MINT_AUTHORITY!,
    USDC_MINT!,
    tokenAccount,
    MINT_AUTHORITY!,
    amountInSmallestUnit
  );
  
  console.log(`✅ Minted ${amount} USDC`);
  console.log(`   Signature: ${signature}`);
  
  return signature;
}

/**
 * Transfer USDC between wallets
 */
export async function transferUSDC(
  fromWalletName: string,
  toWalletName: string,
  amount: number
): Promise<string> {
  if (!USDC_MINT) {
    await initializeUSDCMint();
  }
  
  const fromKeypair = await getOrCreateKeypair(fromWalletName);
  const fromTokenAccount = await getOrCreateUSDCAccount(fromWalletName);
  const toTokenAccount = await getOrCreateUSDCAccount(toWalletName);
  
  // Convert to smallest unit (6 decimals)
  const amountInSmallestUnit = Math.floor(amount * 1_000_000);
  
  console.log(`💸 Transferring ${amount} USDC from ${fromWalletName} to ${toWalletName}...`);
  
  const signature = await transfer(
    connection,
    fromKeypair,
    fromTokenAccount,
    toTokenAccount,
    fromKeypair.publicKey,
    amountInSmallestUnit
  );
  
  console.log(`✅ USDC Transfer successful`);
  console.log(`   Amount: ${amount} USDC`);
  console.log(`   Signature: ${signature}`);
  console.log(`   Explorer: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  
  return signature;
}

/**
 * Get USDC balance for a wallet
 */
export async function getUSDCBalance(walletName: string): Promise<number> {
  if (!USDC_MINT) {
    return 0;
  }
  
  try {
    const tokenAccount = await getOrCreateUSDCAccount(walletName);
    const accountInfo = await getAccount(connection, tokenAccount);
    
    // Convert from smallest unit (6 decimals) to USDC
    return Number(accountInfo.amount) / 1_000_000;
  } catch (error) {
    // Account doesn't exist yet
    return 0;
  }
}

/**
 * Fund wallet with USDC for testing
 */
export async function ensureUSDCFunded(walletName: string, minBalance: number = 10): Promise<void> {
  const balance = await getUSDCBalance(walletName);
  console.log(`💰 ${walletName} USDC balance: ${balance.toFixed(2)} USDC`);
  
  if (balance < minBalance) {
    console.log(`   Balance too low, minting USDC...`);
    await mintUSDC(walletName, 100); // Mint 100 USDC for testing
    const newBalance = await getUSDCBalance(walletName);
    console.log(`   New balance: ${newBalance.toFixed(2)} USDC`);
  }
}

/**
 * Get USDC mint address
 */
export function getUSDCMint(): PublicKey | null {
  return USDC_MINT;
}

