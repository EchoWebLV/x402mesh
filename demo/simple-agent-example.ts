/**
 * Simplified Agent Example
 * Shows how easy it is to create an agent with the improved SDK
 * 
 * This is what developers actually write - compare to the old translator-agent.ts
 */

import 'dotenv/config';
import { Agent, AgentCapability } from '../packages/sdk/src/agent.js';
import { getWalletAddress } from '../packages/router/src/wallet-utils.js';

/**
 * Simple Echo Agent - Returns input with timestamp
 * Only ~30 lines of actual code!
 */
class EchoAgent extends Agent {
  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'echo') {
      return {
        echo: input,
        timestamp: new Date().toISOString(),
        message: `Echo agent processed your request!`
      };
    }
    
    throw new Error(`Unknown capability: ${capability}`);
  }
}

// Start the agent - that's it!
async function startEchoAgent() {
  const walletAddress = await getWalletAddress('EchoWallet');
  
  const capabilities: AgentCapability[] = [
    {
      name: 'echo',
      description: 'Echo back the input with a timestamp',
      inputSchema: { data: 'any' },
      outputSchema: { echo: 'any', timestamp: 'string', message: 'string' },
      pricing: {
        amount: 0.001,
        currency: 'SOL',
        model: 'per_request',
      },
    },
  ];

  const agent = new EchoAgent({
    name: 'Echo Agent',
    description: 'Simple echo service for testing',
    version: '1.0.0',
    capabilities,
    walletAddress,
    port: 3103,
    tags: ['test', 'demo', 'echo'],
  });

  // This single line:
  // - Creates Express server
  // - Sets up /execute and /health endpoints
  // - Implements x402 payment handling
  // - Registers with registry
  // - Starts heartbeat
  // - Makes agent discoverable
  await agent.start();
  
  console.log(`\n✨ Echo Agent is now live!`);
  console.log(`   Try: curl http://localhost:3103/health`);
  console.log(`   Or discover it: curl http://localhost:3001/agents/discover?tags=echo\n`);
}

startEchoAgent().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n👋 Shutting down Echo Agent...');
  process.exit(0);
});

