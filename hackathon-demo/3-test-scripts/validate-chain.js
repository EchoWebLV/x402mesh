/**
 * DEMO: Chain Validation
 * Shows how validation catches errors BEFORE payment
 */

import axios from 'axios';
import chalk from 'chalk';

const ROUTER_URL = 'http://localhost:3002';
const REGISTRY_URL = 'http://localhost:3001';

async function validateChain() {
  console.log(chalk.cyan('\n═══════════════════════════════════════════'));
  console.log(chalk.cyan('  DEMO: Chain Validation (Pre-Payment)'));
  console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  try {
    const agents = await axios.get(`${REGISTRY_URL}/agents`);
    const translator = agents.data.find(a => a.name.includes('Translator'));

    // Test 1: Invalid template reference
    console.log(chalk.yellow('Test 1: Invalid Template Reference\n'));
    console.log(chalk.gray('   Attempting to reference {{step2.text}} in step 1'));
    console.log(chalk.gray('   (Cannot reference future steps)\n'));

    const invalidChain1 = [
      {
        agentId: translator.id,
        capability: 'translate',
        input: {
          text: '{{step2.text}}',  // ❌ Invalid - references future step
          targetLanguage: 'es'
        }
      }
    ];

    let validation1 = await axios.post(`${ROUTER_URL}/payments/chain/validate`, {
      chain: invalidChain1
    });

    if (validation1.data.valid) {
      console.log(chalk.red('   ❌ Should have been invalid!\n'));
    } else {
      console.log(chalk.green('   ✅ Correctly detected as INVALID\n'));
      console.log(chalk.yellow('   Errors:'));
      validation1.data.errors.forEach(err => {
        console.log(chalk.red(`      • ${err.message}`));
      });
    }

    // Test 2: Missing agent
    console.log(chalk.yellow('\n\nTest 2: Non-Existent Agent\n'));
    console.log(chalk.gray('   Attempting to use agent that doesn\'t exist\n'));

    const invalidChain2 = [
      {
        agentId: 'fake-agent-id-12345',
        capability: 'translate',
        input: { text: 'test' }
      }
    ];

    let validation2 = await axios.post(`${ROUTER_URL}/payments/chain/validate`, {
      chain: invalidChain2
    });

    if (validation2.data.valid) {
      console.log(chalk.red('   ❌ Should have been invalid!\n'));
    } else {
      console.log(chalk.green('   ✅ Correctly detected as INVALID\n'));
      console.log(chalk.yellow('   Errors:'));
      validation2.data.errors.forEach(err => {
        console.log(chalk.red(`      • ${err.message}`));
      });
    }

    // Test 3: Valid chain
    console.log(chalk.yellow('\n\nTest 3: Valid Chain\n'));
    console.log(chalk.gray('   Proper configuration with real agent\n'));

    const validChain = [
      {
        agentId: translator.id,
        capability: 'translate',
        input: {
          text: 'Hello world',
          targetLanguage: 'es'
        }
      }
    ];

    let validation3 = await axios.post(`${ROUTER_URL}/payments/chain/validate`, {
      chain: validChain
    });

    if (validation3.data.valid) {
      console.log(chalk.green('   ✅ Chain is VALID\n'));
      if (validation3.data.warnings?.length > 0) {
        console.log(chalk.yellow('   ⚠️  Warnings:'));
        validation3.data.warnings.forEach(warn => {
          console.log(chalk.yellow(`      • ${warn}`));
        });
      } else {
        console.log(chalk.gray('   No warnings - safe to execute!\n'));
      }
    } else {
      console.log(chalk.red('   ❌ Should have been valid!\n'));
    }

    console.log(chalk.cyan('\n💡 Key Benefits:'));
    console.log(chalk.white('   ✅ Catch errors BEFORE making any payments'));
    console.log(chalk.white('   ✅ Validate template references'));
    console.log(chalk.white('   ✅ Check agent availability'));
    console.log(chalk.white('   ✅ Verify schema compatibility'));
    console.log(chalk.white('   ✅ Get warnings about potential issues\n'));

    console.log(chalk.cyan('═══════════════════════════════════════════\n'));

  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
  }
}

validateChain();

