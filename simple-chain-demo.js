import { PaymentClient } from './packages/sdk/dist/payment-client.js';
import axios from 'axios';

const REGISTRY_URL = 'http://localhost:3001';
const ROUTER_URL = 'http://localhost:3002';
const client = new PaymentClient(ROUTER_URL);

console.log('🔍 Discovering agents...');
const { data: agents } = await axios.get(`${REGISTRY_URL}/agents`);
const translator = agents.find(a => a.name.includes('Translator'));
const summarizer = agents.find(a => a.name.includes('Summarizer'));
const analyzer = agents.find(a => a.name.includes('Analyzer'));

console.log(`✅ Found ${agents.length} agents\n`);
console.log('⛓️  Executing chain: Translate → Summarize → Analyze\n');

// Execute chain: Translate → Summarize → Analyze
const result = await client.executeChain({
  paymentSource: 'demo-wallet',
  chain: [
    {
      agentId: translator.id,
      capability: 'translate',
      input: {
        text: 'Artificial intelligence is transforming the world. The future of technology is incredibly exciting!',
        targetLanguage: 'es'
      }
    },
    {
      agentId: summarizer.id,
      capability: 'summarize'
      // Auto-chains from translator
    },
    {
      agentId: analyzer.id,
      capability: 'analyze_sentiment',
      input: {
        text: '{{step1.text}}'  // Template: analyze the summary
      }
    }
  ]
});

// Results
console.log('1. Translation:', result.results[0].text);
console.log('\n2. Summary:', result.results[1].text);
console.log('\n3. Sentiment:', result.results[2].result.sentiment, `(confidence: ${result.results[2].confidence})`);

console.log('\n━━━ PAYMENTS ━━━\n');
result.payments.forEach((payment, i) => {
  console.log(`${i + 1}. ${payment.amount} ${payment.currency} - ${payment.status}`);
});
console.log(`\nTotal: ${result.totalCost} SOL`);

// Show example real Solana devnet transactions
console.log('\n━━━ SOLANA DEVNET TRANSACTIONS ━━━\n');
console.log('Example real transactions from x402mesh:');
console.log('https://explorer.solana.com/tx/4xHmBHMcSwGuqvvLgeToqEcfFBDQeRsGVkJ4rBiHHWsKpQvwqVDKDAWM7faDdENTrjDovbMiN5AUo67rPEF5taKR?cluster=devnet');
console.log('https://explorer.solana.com/tx/5Bz37jEQ6YBDAcqLqoDkrJx6FoNXcVq7488zCYeKk6iJkAHKn2cKQWJ4Ac84oYxLBrScRn877j35CFgLCHyCNnQ2?cluster=devnet');
console.log('https://explorer.solana.com/tx/3gHvqtt2EEVdb8w8SZnVt3SVociVM6rLjv1W1LbXij78EdcYmMfrwdbRkJ82GoxM1e6uH62tJbEB55dzeYSXDZuf?cluster=devnet');
console.log('');

