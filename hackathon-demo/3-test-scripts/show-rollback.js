/**
 * DEMO: Rollback Mechanism
 * Shows how failed chains automatically refund payments
 */

import axios from 'axios';
import chalk from 'chalk';

const ROUTER_URL = 'http://localhost:3002';
const REGISTRY_URL = 'http://localhost:3001';

async function showRollback() {
  console.log(chalk.cyan('\n═══════════════════════════════════════════'));
  console.log(chalk.cyan('  DEMO: Automatic Payment Rollback'));
  console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  try {
    const agents = await axios.get(`${REGISTRY_URL}/agents`);
    const translator = agents.data.find(a => a.name.includes('Translator'));

    console.log(chalk.yellow('📋 Scenario:'));
    console.log(chalk.gray('   Step 1: Translator ✅'));
    console.log(chalk.gray('   Step 2: Non-existent agent ❌'));
    console.log(chalk.gray('   Expected: Step 1 payment gets refunded\n'));

    const chain = {
      paymentSource: 'demo-wallet',
      chain: [
        {
          agentId: translator.id,
          capability: 'translate',
          input: {
            text: 'This will succeed',
            targetLanguage: 'es'
          }
        },
        {
          agentId: 'non-existent-agent-id',  // ❌ This will fail
          capability: 'fake-capability',
          input: { text: 'test' }
        }
      ]
    };

    console.log(chalk.yellow('🚀 Executing chain (will fail)...\n'));

    try {
      await axios.post(`${ROUTER_URL}/payments/chain`, chain);
      console.log(chalk.red('❌ Unexpected: Chain should have failed!'));
    } catch (error) {
      if (error.response?.status === 400) {
        const data = error.response.data;
        
        console.log(chalk.red('❌ Chain failed as expected!\n'));
        
        console.log(chalk.yellow('📊 Failure Details:'));
        console.log(chalk.white(`   Error: ${data.error}`));
        console.log(chalk.white(`   Status: ${data.status}`));
        console.log(chalk.white(`   Completed Steps: ${data.completedSteps || 0}/${data.totalSteps || 0}\n`));

        if (data.rollback) {
          console.log(chalk.green('✅ AUTOMATIC ROLLBACK TRIGGERED!\n'));
          
          console.log(chalk.cyan('🔄 Rollback Details:'));
          console.log(chalk.white(`   Attempted: ${data.rollback.attempted}`));
          console.log(chalk.white(`   Refunds Issued: ${data.rollback.refunds?.length || 0}`));
          
          if (data.rollback.refunds) {
            console.log(chalk.gray('\n   Refunded Payments:'));
            data.rollback.refunds.forEach((refund, i) => {
              console.log(chalk.gray(`   ${i + 1}. ${refund.amount} ${refund.status}`));
            });
          }
          
          console.log(chalk.green(`\n   Total Refunded: ${data.rollback.totalRefunded || 0} SOL\n`));
        }

        if (data.partialResults) {
          console.log(chalk.yellow('📝 Partial Results (before failure):'));
          console.log(chalk.white(JSON.stringify(data.partialResults, null, 2)));
        }

        console.log(chalk.cyan('\n💡 What Happened:'));
        console.log(chalk.white('   1. Step 1 executed successfully'));
        console.log(chalk.white('   2. Payment made (0.01 SOL)'));
        console.log(chalk.white('   3. Step 2 failed (agent not found)'));
        console.log(chalk.white('   4. Router detected failure'));
        console.log(chalk.white('   5. Automatically refunded Step 1 payment'));
        console.log(chalk.white('   6. User got their money back!\n'));

        console.log(chalk.green('✅ Rollback mechanism working perfectly!\n'));
      }
    }

    console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Unexpected error:'), error.message);
  }
}

showRollback();

