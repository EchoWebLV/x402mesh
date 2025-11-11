#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import chalk from 'chalk';
import inquirer from 'inquirer';

const program = new Command();
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:3001';

program
  .name('x402mesh')
  .description('CLI tool for managing x402 agents')
  .version('0.2.0');

// Register command
program
  .command('register')
  .description('Register your x402 agent with the network')
  .option('-n, --name <name>', 'Agent name')
  .option('-e, --endpoint <url>', 'Agent API endpoint')
  .option('-w, --wallet <address>', 'Solana wallet address')
  .option('-d, --description <desc>', 'Agent description')
  .option('--interactive', 'Interactive mode')
  .action(async (options) => {
    try {
      let agentData = {
        name: options.name,
        endpoint: options.endpoint,
        walletAddress: options.wallet,
        description: options.description,
      };

      // Interactive mode
      if (options.interactive || !agentData.name || !agentData.endpoint || !agentData.walletAddress) {
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Agent name:',
            default: agentData.name,
            validate: (input) => input.length > 0,
          },
          {
            type: 'input',
            name: 'description',
            message: 'Description:',
            default: agentData.description || '',
          },
          {
            type: 'input',
            name: 'endpoint',
            message: 'API endpoint:',
            default: agentData.endpoint,
            validate: (input) => input.startsWith('http'),
          },
          {
            type: 'input',
            name: 'walletAddress',
            message: 'Solana wallet address:',
            default: agentData.walletAddress,
            validate: (input) => input.length > 20,
          },
          {
            type: 'input',
            name: 'tags',
            message: 'Tags (comma-separated):',
            default: '',
          },
        ]);

        agentData = {
          ...agentData,
          ...answers,
          tags: answers.tags ? answers.tags.split(',').map((t: string) => t.trim()) : [],
        };
      }

      // Probe endpoint to get capabilities
      console.log(chalk.cyan('🔍 Probing endpoint for capabilities...'));
      
      let capabilities: any[] = [];
      try {
        const probeRes = await axios.post(`${agentData.endpoint}/execute`, {
          capability: 'probe'
        });
      } catch (error: any) {
        if (error.response?.status === 402 && error.response?.data?.payment) {
          // Extract capability from x402 response
          capabilities = [{
            name: 'discovered',
            description: 'Auto-discovered capability',
            inputSchema: {},
            outputSchema: {},
            pricing: {
              amount: error.response.data.payment.amount / 1e9,
              currency: error.response.data.payment.token ? 'USDC' : 'SOL',
              model: 'per_request'
            }
          }];
        }
      }

      // Register with registry
      const payload: any = {
        id: `agent-${agentData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: agentData.name,
        description: agentData.description || `${agentData.name} - x402 enabled agent`,
        version: '1.0.0',
        endpoint: agentData.endpoint,
        walletAddress: agentData.walletAddress,
        capabilities: capabilities.length > 0 ? capabilities : [{
          name: 'custom',
          description: 'Custom capability',
          inputSchema: {},
          outputSchema: {},
          pricing: { amount: 0.01, currency: 'SOL', model: 'per_request' }
        }],
        tags: (agentData as any).tags || [],
      };

      console.log(chalk.cyan('📡 Registering with network...'));
      
      const response = await axios.post(`${REGISTRY_URL}/agents/register`, payload);

      console.log(chalk.green('✅ Agent registered successfully!'));
      console.log(chalk.gray(`   Agent ID: ${response.data.agentId}`));
      console.log(chalk.gray(`   Registry: ${REGISTRY_URL}`));
      console.log(chalk.yellow('\n🎉 Your agent is now discoverable!'));
      
    } catch (error: any) {
      console.error(chalk.red('❌ Registration failed:'), error.message);
      if (error.response) {
        console.error(chalk.red(JSON.stringify(error.response.data, null, 2)));
      }
      process.exit(1);
    }
  });

// Discover command
program
  .command('discover')
  .description('Find agents in the network')
  .option('-t, --tags <tags>', 'Filter by tags (comma-separated)')
  .option('-c, --capability <name>', 'Filter by capability')
  .option('-n, --name <name>', 'Filter by name')
  .action(async (options) => {
    try {
      const params: any = {};
      if (options.tags) params.tags = options.tags;
      if (options.capability) params.capability = options.capability;
      if (options.name) params.name = options.name;

      const response = await axios.get(`${REGISTRY_URL}/agents/discover`, { params });
      const agents = response.data;

      if (agents.length === 0) {
        console.log(chalk.yellow('No agents found matching your criteria.'));
        return;
      }

      console.log(chalk.green(`\n✅ Found ${agents.length} agent(s):\n`));
      
      agents.forEach((agent: any, i: number) => {
        console.log(chalk.cyan(`${i + 1}. ${agent.name}`));
        console.log(chalk.gray(`   ID: ${agent.id}`));
        console.log(chalk.gray(`   Endpoint: ${agent.endpoint}`));
        console.log(chalk.gray(`   Wallet: ${agent.walletAddress}`));
        console.log(chalk.gray(`   Capabilities: ${agent.capabilities.map((c: any) => c.name).join(', ')}`));
        if (agent.tags && agent.tags.length > 0) {
          console.log(chalk.gray(`   Tags: ${agent.tags.join(', ')}`));
        }
        console.log('');
      });
    } catch (error: any) {
      console.error(chalk.red('❌ Discovery failed:'), error.message);
      process.exit(1);
    }
  });

// Deploy command
program
  .command('deploy <agent-file>')
  .description('Deploy and run an agent from a TypeScript file')
  .option('-w, --wallet <address>', 'Wallet address (overrides file default)')
  .option('-p, --port <port>', 'Port to run on (overrides file default)')
  .action(async (agentFile, options) => {
    try {
      const { spawn } = await import('child_process');
      const path = await import('path');
      
      console.log(chalk.cyan(`🚀 Deploying agent from: ${agentFile}\n`));
      
      // Use tsx to run the TypeScript file
      const args = [agentFile];
      
      // Set environment variables if provided
      const env = { ...process.env };
      if (options.wallet) env.WALLET_ADDRESS = options.wallet;
      if (options.port) env.PORT = options.port;
      
      const child = spawn('npx', ['tsx', ...args], {
        stdio: 'inherit',
        env,
        shell: true
      });
      
      child.on('error', (error) => {
        console.error(chalk.red('❌ Failed to deploy agent:'), error.message);
        process.exit(1);
      });
      
      child.on('exit', (code) => {
        if (code !== 0) {
          console.log(chalk.yellow(`\n⚠️  Agent stopped with code ${code}`));
        }
      });
      
    } catch (error: any) {
      console.error(chalk.red('❌ Deployment failed:'), error.message);
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('Show network statistics')
  .action(async () => {
    try {
      const response = await axios.get(`${REGISTRY_URL}/stats`);
      const stats = response.data;

      console.log(chalk.green('\n📊 Network Statistics:\n'));
      console.log(chalk.cyan(`   Total Agents: ${stats.total}`));
      console.log(chalk.green(`   Active: ${stats.active}`));
      console.log(chalk.gray(`   Inactive: ${stats.inactive}`));
    } catch (error: any) {
      console.error(chalk.red('❌ Failed to get stats:'), error.message);
      process.exit(1);
    }
  });

program.parse();

