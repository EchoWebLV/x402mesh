/**
 * DEMO: Execute Template Variables Example
 * Shows how to use {{step0.field}} for precise field extraction
 */

import axios from 'axios';
import chalk from 'chalk';

const ROUTER_URL = 'http://localhost:3002';
const REGISTRY_URL = 'http://localhost:3001';

async function executeTemplateChain() {
  console.log(chalk.cyan('\n═══════════════════════════════════════════'));
  console.log(chalk.cyan('  DEMO: Template Variables (Precise Mapping)'));
  console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  try {
    const agents = await axios.get(`${REGISTRY_URL}/agents`);
    const translator = agents.data.find(a => a.name.includes('Translator'));
    const analyzer = agents.data.find(a => a.name.includes('Analyzer'));

    console.log(chalk.yellow('📋 Chain Configuration:'));
    console.log(chalk.gray('   Step 1: Translator'));
    console.log(chalk.gray('   Step 2: Analyzer'));
    console.log(chalk.gray('   🔗 Using: {{step0.text}} template variable\n'));

    const chain = {
      paymentSource: 'demo-wallet',
      chain: [
        {
          agentId: translator.id,
          capability: 'translate',
          input: {
            text: 'I absolutely love this product! It exceeded all my expectations!',
            targetLanguage: 'es'
          }
        },
        {
          agentId: analyzer.id,
          capability: 'analyze_sentiment',
          input: {
            text: '{{step0.text}}'  // ✨ Template variable!
          }
        }
      ]
    };

    console.log(chalk.yellow('🔗 Template Resolution:'));
    console.log(chalk.gray('   {{step0.text}} → extracts translated text'));
    console.log(chalk.gray('   Allows different schemas to work together\n'));

    console.log(chalk.yellow('🚀 Executing chain...\n'));

    const response = await axios.post(`${ROUTER_URL}/payments/chain`, chain);

    console.log(chalk.green('✅ Chain executed successfully!\n'));

    console.log(chalk.cyan('📊 Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    console.log(chalk.yellow('\nStep 1: Translation'));
    console.log(chalk.white(JSON.stringify(response.data.results[0], null, 2)));
    
    console.log(chalk.yellow('\nStep 2: Sentiment Analysis (of Spanish text)'));
    console.log(chalk.white(JSON.stringify(response.data.results[1], null, 2)));

    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.cyan('\n💡 What Happened:'));
    console.log(chalk.white('   1. Translated English → Spanish'));
    console.log(chalk.white('   2. Template {{step0.text}} extracted Spanish text'));
    console.log(chalk.white('   3. Analyzed sentiment of Spanish translation\n'));

    console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
  }
}

executeTemplateChain();

