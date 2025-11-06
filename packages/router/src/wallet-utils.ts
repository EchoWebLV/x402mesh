import { Keypair } from '@solana/web3.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const WALLET_DIR = path.join(os.homedir(), '.agent-2-agent', 'wallets');

// Ensure wallet directory exists
if (!fs.existsSync(WALLET_DIR)) {
  fs.mkdirSync(WALLET_DIR, { recursive: true });
}

/**
 * Get or create a keypair for a given wallet name
 */
export async function getOrCreateKeypair(walletName: string): Promise<Keypair> {
  const walletPath = path.join(WALLET_DIR, `${walletName}.json`);
  
  if (fs.existsSync(walletPath)) {
    // Load existing wallet
    const secretKey = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
  } else {
    // Create new wallet
    const keypair = Keypair.generate();
    fs.writeFileSync(walletPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(`🔑 Created new wallet: ${walletName}`);
    console.log(`   Public Key: ${keypair.publicKey.toBase58()}`);
    console.log(`   Saved to: ${walletPath}`);
    return keypair;
  }
}

/**
 * Get the public key for a wallet name (creates if doesn't exist)
 */
export async function getWalletAddress(walletName: string): Promise<string> {
  const keypair = await getOrCreateKeypair(walletName);
  return keypair.publicKey.toBase58();
}

/**
 * Delete a wallet
 */
export function deleteWallet(walletName: string): void {
  const walletPath = path.join(WALLET_DIR, `${walletName}.json`);
  if (fs.existsSync(walletPath)) {
    fs.unlinkSync(walletPath);
    console.log(`🗑️  Deleted wallet: ${walletName}`);
  }
}

/**
 * List all wallets
 */
export function listWallets(): string[] {
  if (!fs.existsSync(WALLET_DIR)) {
    return [];
  }
  return fs.readdirSync(WALLET_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}


