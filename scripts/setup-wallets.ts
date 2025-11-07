import { Keypair } from '@solana/web3.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const WALLETS_DIR = '.wallets';
const WALLET_NAMES = [
  'UserWallet',
  'TranslatorWallet',
  'SummarizerWallet',
  'AnalyzerWallet',
  'ImageGeneratorWallet',
  'BackgroundRemoverWallet',
];

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║  💰 Setting Up Solana Wallets                       ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

// Create wallets directory
if (!existsSync(WALLETS_DIR)) {
  mkdirSync(WALLETS_DIR);
  console.log(`✅ Created ${WALLETS_DIR}/ directory\n`);
}

console.log('💼 Creating wallet keypairs...\n');

const walletAddresses: { name: string; address: string }[] = [];

for (const walletName of WALLET_NAMES) {
  const walletPath = join(WALLETS_DIR, `${walletName}.json`);
  
  if (existsSync(walletPath)) {
    const existingKeypair = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(readFileSync(walletPath, 'utf-8')))
    );
    console.log(`   ♻️  ${walletName}: ${existingKeypair.publicKey.toBase58()} (existing)`);
    walletAddresses.push({
      name: walletName,
      address: existingKeypair.publicKey.toBase58(),
    });
  } else {
    const keypair = Keypair.generate();
    writeFileSync(walletPath, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(`   ✨ ${walletName}: ${keypair.publicKey.toBase58()} (new)`);
    walletAddresses.push({
      name: walletName,
      address: keypair.publicKey.toBase58(),
    });
  }
}

console.log('\n╔═══════════════════════════════════════════════════════╗');
console.log('║  ✅ Wallets Created!                                 ║');
console.log('╚═══════════════════════════════════════════════════════╝\n');

console.log('💵 NEXT STEP: Fund Your Wallets\n');
console.log('Go to: https://faucet.solana.com/\n');
console.log('Fund each wallet with 1 SOL:\n');

walletAddresses.forEach(({ name, address }) => {
  console.log(`   ${name}:`);
  console.log(`   ${address}\n`);
});

console.log('⏰ This takes ~2 minutes total (30 seconds per wallet)');
console.log('\n📝 After funding, run: npm run demo:real\n');

import { readFileSync } from 'fs';
