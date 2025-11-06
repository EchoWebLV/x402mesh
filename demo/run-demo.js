#!/usr/bin/env node

import { spawn } from 'child_process';
import axios from 'axios';

const processes = [];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function startProcess(name, command, args, color) {
  log(`Starting ${name}...`, color);
  const proc = spawn(command, args, { 
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true 
  });
  
  proc.stdout.on('data', (data) => {
    console.log(`${color}[${name}]${colors.reset} ${data.toString().trim()}`);
  });
  
  proc.stderr.on('data', (data) => {
    console.error(`${color}[${name}]${colors.reset} ${data.toString().trim()}`);
  });
  
  proc.on('close', (code) => {
    log(`${name} exited with code ${code}`, color);
  });
  
  processes.push({ name, proc });
  return proc;
}

async function waitForService(url, name, maxAttempts = 30) {
  log(`Waiting for ${name} to be ready...`, colors.yellow);
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(url);
      log(`✅ ${name} is ready!`, colors.green);
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`${name} failed to start`);
}

async function runDemo() {
  log('\n===========================================', colors.bright);
  log('🚀 Agent-to-Agent Payment Router Demo', colors.bright);
  log('===========================================\n', colors.bright);

  try {
    // Start Registry
    startProcess('Registry', 'npx', ['tsx', 'packages/registry/src/index.ts'], colors.cyan);
    await waitForService('http://localhost:3001/health', 'Registry');
    
    // Start Router
    startProcess('Router', 'npx', ['tsx', 'packages/router/src/index.ts'], colors.blue);
    await waitForService('http://localhost:3002/health', 'Router');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start Agents
    startProcess('Translator', 'npx', ['tsx', 'demo/agents/translator-agent.ts'], colors.green);
    await waitForService('http://localhost:3100/health', 'Translator Agent');
    
    startProcess('Summarizer', 'npx', ['tsx', 'demo/agents/summarizer-agent.ts'], colors.magenta);
    await waitForService('http://localhost:3101/health', 'Summarizer Agent');
    
    startProcess('Analyzer', 'npx', ['tsx', 'demo/agents/analyzer-agent.ts'], colors.yellow);
    await waitForService('http://localhost:3102/health', 'Analyzer Agent');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run demo interactions
    log('\n===========================================', colors.bright);
    log('💬 Starting Agent Interactions', colors.bright);
    log('===========================================\n', colors.bright);
    
    // Check registry
    const agentsResponse = await axios.get('http://localhost:3001/agents');
    log(`\n📋 Registered Agents: ${agentsResponse.data.length}`, colors.cyan);
    agentsResponse.data.forEach(agent => {
      log(`   - ${agent.name} (${agent.id})`, colors.cyan);
    });
    
    // Demo 1: Simple agent call
    log('\n\n--- Demo 1: Simple Translation ---', colors.bright);
    const translatorId = agentsResponse.data.find(a => a.name === 'Translator Agent')?.id;
    
    if (translatorId) {
      const payment = await axios.post('http://localhost:3002/payments/process', {
        from: 'UserWallet000',
        to: 'TranslatorWallet123ABC',
        amount: 0.01,
        currency: 'USDC',
        serviceId: 'translate',
      });
      
      log(`💰 Payment processed: ${payment.data.transactionId}`, colors.green);
      
      const translation = await axios.post('http://localhost:3100/execute', {
        capability: 'translate',
        input: { text: 'Hello World! Good morning!', targetLanguage: 'spanish' },
        payment: payment.data,
      });
      
      log(`🌍 Translation result: ${JSON.stringify(translation.data.data, null, 2)}`, colors.green);
    }
    
    // Demo 2: Agent chain
    log('\n\n--- Demo 2: Agent Chain (Translate → Summarize → Analyze) ---', colors.bright);
    
    const translatorAgent = agentsResponse.data.find(a => a.name === 'Translator Agent');
    const summarizerAgent = agentsResponse.data.find(a => a.name === 'Summarizer Agent');
    const analyzerAgent = agentsResponse.data.find(a => a.name === 'Analyzer Agent');
    
    if (translatorAgent && summarizerAgent && analyzerAgent) {
      const chainResponse = await axios.post('http://localhost:3002/payments/chain', {
        paymentSource: 'UserWallet000',
        chain: [
          {
            agentId: translatorAgent.id,
            capability: 'translate',
            input: {
              text: 'Artificial intelligence is transforming how we build payment systems. Blockchain technology enables secure transactions.',
              targetLanguage: 'french',
            },
          },
          {
            agentId: summarizerAgent.id,
            capability: 'summarize',
            input: {}, // Will receive output from previous agent
          },
          {
            agentId: analyzerAgent.id,
            capability: 'analyze_sentiment',
            input: {}, // Will receive output from previous agent
          },
        ],
      });
      
      log(`\n✨ Chain execution completed!`, colors.bright);
      log(`   Total cost: $${chainResponse.data.totalCost.toFixed(4)}`, colors.yellow);
      log(`   Execution time: ${chainResponse.data.executionTime}ms`, colors.yellow);
      log(`   Steps completed: ${chainResponse.data.results.length}`, colors.yellow);
      log(`\n   Final result:`, colors.bright);
      log(JSON.stringify(chainResponse.data.results[chainResponse.data.results.length - 1], null, 2), colors.green);
    }
    
    // Show stats
    log('\n\n--- System Statistics ---', colors.bright);
    const registryStats = await axios.get('http://localhost:3001/stats');
    const routerStats = await axios.get('http://localhost:3002/stats');
    
    log('\n📊 Registry Stats:', colors.cyan);
    log(JSON.stringify(registryStats.data, null, 2), colors.cyan);
    
    log('\n💰 Payment Router Stats:', colors.blue);
    log(JSON.stringify(routerStats.data, null, 2), colors.blue);
    
    log('\n\n===========================================', colors.bright);
    log('✅ Demo completed successfully!', colors.green);
    log('===========================================\n', colors.bright);
    log('Services are still running. Press Ctrl+C to stop.\n', colors.yellow);
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    cleanup();
  }
}

function cleanup() {
  log('\n\nShutting down services...', colors.yellow);
  processes.forEach(({ name, proc }) => {
    log(`Stopping ${name}...`, colors.yellow);
    proc.kill();
  });
  setTimeout(() => process.exit(0), 1000);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

runDemo();

