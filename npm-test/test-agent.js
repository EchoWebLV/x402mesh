#!/usr/bin/env node

/**
 * Test Agent - Verifies x402mesh-sdk works from npm
 * 
 * This creates a simple echo agent that:
 * - Accepts text input
 * - Returns it with a timestamp
 * - Requires payment (simulated for testing)
 */

import { Agent } from 'x402mesh-sdk';

class TestEchoAgent extends Agent {
  constructor() {
    super({
      name: 'Test Echo Agent',
      description: 'A simple agent to test npm package installation',
      version: '1.0.0',
      port: 3333,
      capabilities: [
        {
          name: 'echo',
          description: 'Echoes back your message with a timestamp',
          inputSchema: {
            type: 'object',
            properties: {
              message: { 
                type: 'string',
                description: 'The message to echo back'
              }
            },
            required: ['message']
          },
          outputSchema: {
            type: 'object',
            properties: {
              echo: { type: 'string' },
              timestamp: { type: 'string' },
              agent: { type: 'string' }
            }
          },
          pricing: {
            amount: 0.001,
            currency: 'USDC'
          }
        }
      ],
      // Using a dummy wallet address for testing
      walletAddress: 'DemoWallet111111111111111111111111111111111',
      tags: ['test', 'echo', 'demo', 'npm-verification']
    });

    console.log('✅ Test Echo Agent created successfully!');
    console.log(`📦 Using x402mesh-sdk from npm`);
    console.log(`🎯 Agent: ${this.metadata.name}`);
    console.log(`💰 Price: ${this.metadata.capabilities[0].pricing.amount} ${this.metadata.capabilities[0].pricing.currency}`);
  }

  async executeCapability(capabilityName, input) {
    console.log(`\n🔄 Executing capability: ${capabilityName}`);
    console.log(`📥 Input:`, input);

    if (capabilityName === 'echo') {
      const result = {
        echo: `Echo: "${input.message}"`,
        timestamp: new Date().toISOString(),
        agent: this.metadata.name,
        status: 'success'
      };

      console.log(`📤 Output:`, result);
      return result;
    }

    throw new Error(`Unknown capability: ${capabilityName}`);
  }
}

// Create and start the agent
console.log('\n🚀 Starting Test Echo Agent...\n');

const agent = new TestEchoAgent();

// Start the agent server
const PORT = 3333;
agent.start(PORT);

console.log(`\n✨ Agent is running on http://localhost:${PORT}`);
console.log(`\n📋 Test the agent with:`);
console.log(`   curl http://localhost:${PORT}/health`);
console.log(`   curl -X POST http://localhost:${PORT}/capabilities/echo -H "Content-Type: application/json" -d '{"message":"Hello from npm!"}'`);
console.log(`\n🎉 npm package verification successful!\n`);

