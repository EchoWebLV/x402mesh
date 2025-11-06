#!/usr/bin/env node
/**
 * Setup script to create and fund wallets for demo
 */

import { getOrCreateKeypair, getWalletAddress, listWallets } from '../packages/router/src/wallet-utils.js';
import { airdropSol, getBalance, ensureFunded } from '../packages/router/src/airdrop-utils.js';

async function main() {
  console.log('🔧 Agent-to-Agent Wallet Setup\n');
  
  const wallets = [
    'UserWallet000',
    'TranslatorAgent',
    'SummarizerAgent',
    'AnalyzerAgent',
  ];
  
  console.log('Creating wallets...\n');
  
  for (const walletName of wallets) {
    const address = await getWalletAddress(walletName);
    console.log(`✅ ${walletName}: ${address}`);
  }
  
  console.log('\n💰 Checking balances and funding on devnet...\n');
  
  // Fund the user wallet with more SOL for testing
  await ensureFunded('UserWallet000', 1.0);
  
  // Fund agent wallets with smaller amounts
  for (const wallet of wallets.slice(1)) {
    await ensureFunded(wallet, 0.5);
  }
  
  console.log('\n✅ Setup complete! All wallets are ready.\n');
  console.log('💡 To enable real Solana transactions, run:');
  console.log('   export REAL_TRANSACTIONS=true');
  console.log('   npm run demo:chain\n');
}

main().catch(console.error);

