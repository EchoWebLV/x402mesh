/**
 * DEMO: Execute Auto-Chaining Example
 * Shows how agents with compatible schemas chain automatically
 */

import axios from 'axios';
import chalk from 'chalk';

const ROUTER_URL = 'http://localhost:3002';
const REGISTRY_URL = 'http://localhost:3001';

async function getAgents() {
  const response = await axios.get(`${REGISTRY_URL}/agents`);
  return response.data;
}

async function findAgent(agents, name) {
  return agents.find(a => a.name.toLowerCase().includes(name.toLowerCase()));
}

async function executeAutoChain() {
  console.log(chalk.cyan('\n═══════════════════════════════════════════'));
  console.log(chalk.cyan('  DEMO: Auto-Chaining (Compatible Schemas)'));
  console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  try {
    // Get agents
    const agents = await getAgents();
    const translator = await findAgent(agents, 'translator');
    const summarizer = await findAgent(agents, 'summarizer');

    if (!translator || !summarizer) {
      console.log(chalk.red('❌ Agents not found. Make sure they are running.'));
      return;
    }

    console.log(chalk.yellow('📋 Chain Configuration:'));
    console.log(chalk.gray('   Step 1: Translator (text_processing_v1)'));
    console.log(chalk.gray('   Step 2: Summarizer (text_processing_v1)'));
    console.log(chalk.gray('   ✨ Auto-chains - no manual mapping!\n'));

    const chain = {
      paymentSource: 'demo-wallet',
      chain: [
        {
          agentId: translator.id,
          capability: 'translate',
          input: {
            text: 'Artificial intelligence is transforming the world. Machine learning algorithms are becoming more sophisticated every day.',
            targetLanguage: 'es'
          }
        },
        {
          agentId: summarizer.id,
          capability: 'summarize'
          // ✨ NO INPUT - auto-chains from step 1!
        }
      ]
    };

    console.log(chalk.yellow('🚀 Executing chain...\n'));

    const startTime = Date.now();
    const response = await axios.post(`${ROUTER_URL}/payments/chain`, chain);
    const duration = Date.now() - startTime;

    console.log(chalk.green('✅ Chain executed successfully!\n'));

    console.log(chalk.cyan('📊 Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    response.data.results.forEach((result, i) => {
      console.log(chalk.yellow(`\nStep ${i + 1}:`));
      console.log(chalk.white(JSON.stringify(result, null, 2)));
    });

    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.cyan('\n💰 Payment Details:'));
    console.log(chalk.white(`   Total Cost: ${response.data.totalCost} SOL`));
    console.log(chalk.white(`   Execution Time: ${duration}ms`));
    console.log(chalk.white(`   Payments: ${response.data.payments.length} transactions\n`));

    if (response.data.payments[0].explorerUrl) {
      console.log(chalk.green('🔍 View on Solana Explorer:'));
      response.data.payments.forEach((payment, i) => {
        console.log(chalk.blue(`   Step ${i + 1}: ${payment.explorerUrl}`));
      });
    }

    console.log(chalk.cyan('\n═══════════════════════════════════════════\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    if (error.response?.data) {
      console.error(chalk.red('Details:'), error.response.data);
    }
  }
}

executeAutoChain();

