import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';

const DEVNET_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com';
const connection = new Connection(DEVNET_RPC, 'confirmed');

// USDC Devnet mint (we'll use a custom one for demo)
// In production, use real USDC: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
export const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT 
  ? new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT)
  : null;

export async function sendSOLPayment(
  walletAdapter: any,
  toAddress: string,
  amountSOL: number
): Promise<string> {
  if (!walletAdapter.publicKey) {
    throw new Error('Wallet not connected');
  }

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: walletAdapter.publicKey,
      toPubkey: new PublicKey(toAddress),
      lamports: amountSOL * LAMPORTS_PER_SOL,
    })
  );

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletAdapter.publicKey;

  // Sign and send using Phantom
  const signed = await walletAdapter.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  
  // Confirm
  await connection.confirmTransaction(signature, 'confirmed');
  
  return signature;
}

export async function sendUSDCPayment(
  walletAdapter: any,
  toAddress: string,
  amountUSDC: number
): Promise<string> {
  if (!walletAdapter.publicKey || !USDC_MINT) {
    throw new Error('Wallet not connected or USDC not configured');
  }

  const fromTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    walletAdapter.publicKey
  );

  const toTokenAccount = await getAssociatedTokenAddress(
    USDC_MINT,
    new PublicKey(toAddress)
  );

  // USDC has 6 decimals
  const amountInSmallestUnit = Math.floor(amountUSDC * 1_000_000);

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      walletAdapter.publicKey,
      amountInSmallestUnit,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = walletAdapter.publicKey;

  const signed = await walletAdapter.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  
  await connection.confirmTransaction(signature, 'confirmed');
  
  return signature;
}

export async function getBalance(publicKey: PublicKey): Promise<number> {
  const balance = await connection.getBalance(publicKey);
  return balance / LAMPORTS_PER_SOL;
}

export async function getUSDCBalance(publicKey: PublicKey): Promise<number> {
  if (!USDC_MINT) return 0;
  
  try {
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, publicKey);
    const balance = await connection.getTokenAccountBalance(tokenAccount);
    return parseFloat(balance.value.uiAmount?.toString() || '0');
  } catch {
    return 0;
  }
}

export { connection };


