#!/usr/bin/env node

import 'dotenv/config';
import { spawn } from 'child_process';
import axios from 'axios';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

const processes = [];
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
const WALLET_DIR = path.join(os.homedir(), '.agent-2-agent', 'wallets');
const USER_WALLET_NAME = process.env.USER_WALLET || 'UserWallet';

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function startProcess(name, command, args, color) {
  const proc = spawn(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  proc.stdout.on('data', data => {
    console.log(`${color}[${name}]${colors.reset} ${data.toString().trim()}`);
  });

  proc.stderr.on('data', data => {
    const msg = data.toString().trim();
    if (!msg.includes('ExperimentalWarning')) {
      console.error(`${color}[${name}]${colors.reset} ${msg}`);
    }
  });

  processes.push({ name, proc });
  return proc;
}

async function waitForService(url, name, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url);
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`${name} failed to start`);
}

function getWalletPath(walletName) {
  if (!fs.existsSync(WALLET_DIR)) {
    fs.mkdirSync(WALLET_DIR, { recursive: true });
  }
  return path.join(WALLET_DIR, `${walletName}.json`);
}

function loadKeypair(walletName) {
  const walletPath = getWalletPath(walletName);
  if (!fs.existsSync(walletPath)) {
    throw new Error(`Wallet ${walletName} not found. Run scripts/setup-wallets.ts first.`);
  }
  const secret = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

async function ensureSolBalance(keypair, minBalance = 0.5) {
  const balanceLamports = await connection.getBalance(keypair.publicKey);
  if (balanceLamports >= minBalance * LAMPORTS_PER_SOL) {
    return;
  }
  log(`🪂 Airdropping SOL to ${keypair.publicKey.toBase58()}`, colors.yellow);
  const signature = await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
  await connection.confirmTransaction(signature, 'confirmed');
}

async function signAndSubmitSolPayment({
  fromKeypair,
  toAddress,
  amount,
  serviceId,
}) {
  const toPubkey = new PublicKey(toAddress);
  await ensureSolBalance(fromKeypair);

  const lamports = Math.round(amount * LAMPORTS_PER_SOL);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey,
      lamports,
    })
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
  transaction.recentBlockhash = blockhash;
  transaction.lastValidBlockHeight = lastValidBlockHeight;
  transaction.feePayer = fromKeypair.publicKey;
  transaction.sign(fromKeypair);

  const serialized = transaction.serialize();
  const base64 = Buffer.from(serialized).toString('base64');

  const response = await axios.post('http://localhost:3002/payments/submit', {
    signedTransaction: base64,
    from: fromKeypair.publicKey.toBase58(),
    to: toAddress,
    amount,
    currency: 'SOL',
    serviceId,
  });

  return response.data;
}

async function runChainDemo() {
  const useRealTransactions = process.env.REAL_TRANSACTIONS === 'true';

  log('\n╔═══════════════════════════════════════════════════════╗', colors.bright);
  log('║   🤖 AGENT CHAIN DEMO - Real-time Conversation      ║', colors.bright);
  log('╚═══════════════════════════════════════════════════════╝\n', colors.bright);

  if (useRealTransactions) {
    log('🔥 REAL TRANSACTION MODE ENABLED', colors.yellow);
    log('   Using actual Solana devnet transactions', colors.yellow);
    log('   Transactions will be slower but verifiable on-chain\n', colors.yellow);
  } else {
    log('⚡ FAST MODE: Using simulated transactions', colors.cyan);
    log('   Set REAL_TRANSACTIONS=true in .env for real blockchain\n', colors.cyan);
  }

  const userKeypair = loadKeypair(USER_WALLET_NAME);
  const userAddress = userKeypair.publicKey.toBase58();
  log(`👛 Using user wallet ${USER_WALLET_NAME}: ${userAddress}`, colors.cyan);

  try {
    // Start services silently
    log('⚙️  Starting services...', colors.yellow);
    startProcess('Registry', 'npx', ['tsx', 'packages/registry/src/index.ts'], colors.cyan);
    await waitForService('http://localhost:3001/health', 'Registry');

    startProcess('Router', 'npx', ['tsx', 'packages/router/src/index.ts'], colors.blue);
    await waitForService('http://localhost:3002/health', 'Router');

    await new Promise(resolve => setTimeout(resolve, 1000));

    startProcess('Translator', 'npx', ['tsx', 'demo/agents/translator-agent.ts'], colors.green);
    await waitForService('http://localhost:3100/health', 'Translator Agent');

    startProcess('Summarizer', 'npx', ['tsx', 'demo/agents/summarizer-agent.ts'], colors.magenta);
    await waitForService('http://localhost:3101/health', 'Summarizer Agent');

    startProcess('Analyzer', 'npx', ['tsx', 'demo/agents/analyzer-agent.ts'], colors.yellow);
    await waitForService('http://localhost:3102/health', 'Analyzer Agent');

    await new Promise(resolve => setTimeout(resolve, 3000));

    log('✅ All services ready!\n', colors.green);

    // Get agents
    const agentsResponse = await axios.get('http://localhost:3001/agents');
    const translator = agentsResponse.data.find(a => a.name === 'Translator Agent');
    const summarizer = agentsResponse.data.find(a => a.name === 'Summarizer Agent');
    const analyzer = agentsResponse.data.find(a => a.name === 'Analyzer Agent');

    if (useRealTransactions) {
      if (!translator?.walletAddress || !summarizer?.walletAddress || !analyzer?.walletAddress) {
        throw new Error('Agent wallet addresses are missing. Ensure agents are configured with real wallet addresses.');
      }
      log('📬 Agent wallets:', colors.cyan);
      log(`   Translator: ${translator.walletAddress}`, colors.cyan);
      log(`   Summarizer: ${summarizer.walletAddress}`, colors.cyan);
      log(`   Analyzer:   ${analyzer.walletAddress}`, colors.cyan);
    }

    const scenarios = [
      {
        title: 'Tech Discussion',
        text: 'Artificial intelligence is revolutionizing blockchain technology. Payment systems are becoming more efficient and secure. Smart contracts enable trustless transactions.',
        language: 'spanish',
      },
      {
        title: 'Customer Feedback',
        text: 'This product is absolutely amazing! The user interface is intuitive and the performance is excellent. Best purchase I have made this year!',
        language: 'french',
      },
      {
        title: 'Market Analysis',
        text: 'The cryptocurrency market shows volatile behavior. Decentralized finance platforms are gaining significant traction. Investment risks remain considerable.',
        language: 'german',
      },
    ];

    for (let i = 0; i < scenarios.length; i++) {
      const scenario = scenarios[i];

      log(`\n${'='.repeat(70)}`, colors.bright);
      log(`📝 SCENARIO ${i + 1}: ${scenario.title}`, colors.bright);
      log(`${'='.repeat(70)}\n`, colors.bright);

      log(`💬 Original Message:`, colors.cyan);
      log(`   "${scenario.text}"\n`, colors.cyan);

      log(`🔄 Executing Agent Chain:`, colors.yellow);
      log(`   1. 🌍 Translator → Translate to ${scenario.language}`, colors.yellow);
      log(`   2. 📝 Summarizer → Create bullet points`, colors.yellow);
      log(`   3. 🔍 Analyzer → Analyze sentiment\n`, colors.yellow);

      let signatures = undefined;
      if (useRealTransactions) {
        const capabilityOrder = [
          { agent: translator, capability: 'translate' },
          { agent: summarizer, capability: 'summarize' },
          { agent: analyzer, capability: 'analyze_sentiment' },
        ];

        signatures = [];

        for (const step of capabilityOrder) {
          const capabilityInfo = step.agent.capabilities.find(c => c.name === step.capability);
          if (!capabilityInfo) {
            throw new Error(`Capability ${step.capability} not found on agent ${step.agent.name}`);
          }

          log(`💸 Paying ${step.agent.name} ${capabilityInfo.pricing.amount} ${capabilityInfo.pricing.currency}`, colors.green);
          const paymentRecord = await signAndSubmitSolPayment({
            fromKeypair: userKeypair,
            toAddress: step.agent.walletAddress,
            amount: capabilityInfo.pricing.amount,
            serviceId: step.capability,
          });
          signatures.push(paymentRecord.signature);
          log(`   ↳ Signature: ${paymentRecord.signature}`, colors.green);
        }
      }

      const chainResponse = await axios.post('http://localhost:3002/payments/chain', {
        paymentSource: useRealTransactions ? userAddress : 'UserWallet000',
        chain: [
          {
            agentId: translator.id,
            capability: 'translate',
            input: {
              text: scenario.text,
              targetLanguage: scenario.language,
            },
          },
          {
            agentId: summarizer.id,
            capability: 'summarize',
            input: {},
          },
          {
            agentId: analyzer.id,
            capability: 'analyze_sentiment',
            input: {},
          },
        ],
        signatures,
      });

      log(`\n📊 RESULTS:`, colors.bright);
      log(`─────────────────────────────────────────────────────\n`, colors.bright);

      const [translationResult, summaryResult, analysisResult] = chainResponse.data.results;

      log(`🌍 Translation (${scenario.language}):`, colors.green);
      log(`   "${translationResult.translatedText}"\n`, colors.green);

      log(`📝 Summary:`, colors.magenta);
      summaryResult.summary.forEach((point, idx) => {
        log(`   ${idx + 1}. ${point}`, colors.magenta);
      });
      log(`   (${summaryResult.compressionRatio} compression)\n`, colors.magenta);

      log(`🔍 Sentiment Analysis:`, colors.blue);
      log(`   Sentiment: ${analysisResult.sentiment.toUpperCase()}`, colors.blue);
      log(`   Score: ${analysisResult.score.toFixed(2)}`, colors.blue);
      analysisResult.insights.forEach(insight => {
        log(`   • ${insight}`, colors.blue);
      });

      log(`\n💰 Payment Summary:`, colors.yellow);
      log(`   Total Cost: ${chainResponse.data.totalCost.toFixed(4)} ${useRealTransactions ? 'SOL' : 'USDC'}`, colors.yellow);
      log(`   Payments Made: ${chainResponse.data.payments.length}`, colors.yellow);
      log(`   Execution Time: ${chainResponse.data.executionTime}ms`, colors.yellow);

      chainResponse.data.payments.forEach((payment, idx) => {
        const agentNames = ['Translator', 'Summarizer', 'Analyzer'];
        log(`   ${idx + 1}. ${agentNames[idx]}: ${payment.amount} ${payment.currency}`, colors.yellow);
        if (payment.signature) {
          log(`      ↳ Signature: ${payment.signature}`, colors.yellow);
        }
      });

      if (i < scenarios.length - 1) {
        log(`\n⏳ Next scenario in 3 seconds...\n`, colors.cyan);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    log(`\n\n${'='.repeat(70)}`, colors.bright);
    log(`📈 FINAL STATISTICS`, colors.bright);
    log(`${'='.repeat(70)}\n`, colors.bright);

    const routerStats = await axios.get('http://localhost:3002/stats');
    log(`💰 Payment Router:`, colors.cyan);
    log(`   Total Transactions: ${routerStats.data.totalProcessed}`, colors.cyan);
    log(`   Total Volume: ${routerStats.data.totalVolume.toFixed(4)} ${useRealTransactions ? 'SOL' : 'USDC'}`, colors.cyan);
    log(`   Success Rate: ${(routerStats.data.successful / routerStats.data.totalProcessed * 100).toFixed(1)}%\n`, colors.cyan);

    const registryStats = await axios.get('http://localhost:3001/stats');
    log(`🤖 Agent Registry:`, colors.magenta);
    log(`   Active Agents: ${registryStats.data.active}`, colors.magenta);
    log(`   Total Registered: ${registryStats.data.total}\n`, colors.magenta);

    log(`\n╔═══════════════════════════════════════════════════════╗`, colors.bright);
    log(`║              ✅ DEMO COMPLETED SUCCESSFULLY!         ║`, colors.green);
    log(`╚═══════════════════════════════════════════════════════╝\n`, colors.bright);

    log(`Press Ctrl+C to stop all services.\n`, colors.yellow);
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    if (error.response) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
    }
    cleanup();
  }
}

function cleanup() {
  log('\n\n⚙️  Shutting down services...', colors.yellow);
  processes.forEach(({ name, proc }) => {
    proc.kill();
  });
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

runChainDemo();

