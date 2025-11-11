/**
 * DEMO 1: Build a Payment-Enabled Agent in 20 Lines
 * 
 * This is the agent you'll build LIVE during the demo to show
 * how simple it is to create a payment-enabled agent with x402mesh.
 * 
 * Time: 0:45 - 1:30 (45 seconds)
 */

import { Agent } from '../packages/sdk/src/agent.js';
import { AgentCapability } from '../packages/sdk/src/types.js';

class SentimentAgent extends Agent {
  constructor(walletAddress: string) {
    super({
      name: 'Sentiment Analyzer',
      description: 'Analyzes sentiment of text',
      version: '1.0.0',
      capabilities: [{
        name: 'analyze',
        description: 'Analyze sentiment of text',
        schema: 'analysis_v1',  // ← Standard schema for auto-chaining
        inputSchema: { text: 'string' },
        outputSchema: { result: 'object', confidence: 'number' },
        pricing: { 
          amount: 0.01,    // 0.01 SOL per request
          currency: 'SOL', 
          model: 'per_request' 
        }
      }],
      walletAddress,
      port: 3105,  // Different port to not conflict with demo agents
      tags: ['sentiment', 'analysis', 'nlp']
    });
  }

  // The ONLY method you need to implement!
  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'analyze') {
      // Simple sentiment analysis logic
      const text = input.text.toLowerCase();
      
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'happy'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'poor'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
      
      let sentiment = 'neutral';
      let confidence = 0.5;
      
      if (positiveCount > negativeCount) {
        sentiment = 'positive';
        confidence = Math.min(0.95, 0.5 + (positiveCount * 0.15));
      } else if (negativeCount > positiveCount) {
        sentiment = 'negative';
        confidence = Math.min(0.95, 0.5 + (negativeCount * 0.15));
      }
      
      return {
        result: {
          sentiment,
          positiveWords: positiveCount,
          negativeWords: negativeCount
        },
        confidence,
        metadata: {
          analyzed: true,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    throw new Error(`Unknown capability: ${capability}`);
  }
}

// Start the agent
async function startDemo() {
  console.log('\n🎬 DEMO 1: Building a Payment-Enabled Agent\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Use a demo wallet address (in production, use your real wallet)
  const DEMO_WALLET = 'DemoWallet123456789ABCDEFGHIJK';
  
  const agent = new SentimentAgent(DEMO_WALLET);
  
  console.log('✨ Agent created! The SDK automatically handles:');
  console.log('   ✅ HTTP server setup');
  console.log('   ✅ x402 payment verification');
  console.log('   ✅ Registry registration');
  console.log('   ✅ Health check endpoint');
  console.log('   ✅ Heartbeat monitoring\n');
  
  await agent.start();
  
  console.log('\n🎉 Agent is now LIVE and ready to accept payments!\n');
  console.log('📍 Endpoint: http://localhost:3105');
  console.log('💰 Price: 0.01 SOL per request');
  console.log('🔍 Discoverable in Registry\n');
  console.log('═══════════════════════════════════════════\n');
  console.log('Press Ctrl+C to stop the agent\n');
}

// Run the demo
startDemo().catch(console.error);

/**
 * WHAT TO SAY DURING DEMO:
 * 
 * "Let me show you how fast this is. I'll build an agent from scratch."
 * 
 * [Show the code]
 * 
 * "20 lines of code. I define:
 *  - The capability name
 *  - The standard schema for auto-chaining
 *  - The price: 0.01 SOL
 *  - And implement one method: execute()
 * 
 * The SDK handles everything else - HTTP server, payment verification,
 * registry registration, health checks, heartbeat monitoring.
 * 
 * Let's start it..."
 * 
 * [Run the agent]
 * 
 * "Boom. Agent is live. It's discoverable, it accepts payments, and it's
 * ready to chain with other agents. That's it."
 */

