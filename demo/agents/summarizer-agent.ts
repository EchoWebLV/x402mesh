import express from 'express';
import { Agent, AgentCapability } from '../../packages/sdk/src/agent.js';

class SummarizerAgent extends Agent {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3101) {
    const capabilities: AgentCapability[] = [
      {
        name: 'summarize',
        description: 'Summarize long text into concise bullet points',
        inputSchema: { text: 'string', maxBullets: 'number' },
        outputSchema: { summary: 'string[]', wordCount: 'number' },
        pricing: {
          amount: 0.02,
          currency: 'USDC',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Summarizer Agent',
      description: 'Summarizes text into key points',
      version: '1.0.0',
      capabilities,
      walletAddress: 'SummarizerWallet456DEF',
      port,
      tags: ['summarization', 'nlp', 'text-processing'],
    });

    this.port = port;
    this.app = express();
    this.app.use(express.json());
    this.setupEndpoints();
  }

  private setupEndpoints() {
    this.app.post('/execute', async (req, res) => {
      const { capability, input, payment } = req.body;
      
      console.log(`\n📝 Summarizer Agent received request:`);
      console.log(`   Capability: ${capability}`);
      console.log(`   Input: ${JSON.stringify(input).substring(0, 100)}...`);
      
      // x402 Protocol: Check payment
      if (!payment || payment.status !== 'completed') {
        // Return HTTP 402 Payment Required
        const requiredCapability = this.metadata.capabilities.find(c => c.name === capability);
        const requiredAmount = requiredCapability?.pricing.amount || 0.02;
        
        res.status(402).set({
          'X-Payment-Required': 'true',
          'X-Payment-Amount': requiredAmount.toString(),
          'X-Payment-Currency': 'USDC',
          'X-Payment-Address': this.metadata.walletAddress,
          'X-Service-Id': capability,
        }).json({ 
          error: 'Payment Required',
          paymentRequired: true,
          amount: requiredAmount,
          currency: 'USDC',
          walletAddress: this.metadata.walletAddress,
        });
        return;
      }
      
      console.log(`   ✅ Payment verified: ${payment.amount} ${payment.currency} (${payment.transactionId})`);

      try {
        const result = await this.execute(capability, input);
        
        // Add x402 success headers
        res.set({
          'X-Payment-Received': 'true',
          'X-Payment-Status': payment.status,
          'X-Transaction-Id': payment.transactionId,
        });
        
        res.json({ success: true, data: result, payment });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', agent: this.metadata.name });
    });
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'summarize') {
      return this.summarize(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async summarize(input: { text: string; maxBullets?: number }): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 400)); // Simulate processing

    const text = typeof input === 'string' ? input : 
                 (input.translatedText || input.text || JSON.stringify(input));
    const maxBullets = input.maxBullets || 3;

    // Simple summarization logic
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, maxBullets).map(s => s.trim());
    
    const wordCount = text.split(/\s+/).length;

    console.log(`   ✅ Summarized ${wordCount} words into ${summary.length} points`);

    return {
      summary,
      wordCount,
      originalLength: text.length,
      compressionRatio: (summary.join(' ').length / text.length * 100).toFixed(1) + '%',
    };
  }

  async startServer() {
    await this.start();
    this.app.listen(this.port, () => {
      console.log(`📝 Summarizer Agent listening on port ${this.port}`);
    });
  }
}

// Start the agent
const agent = new SummarizerAgent(3101);
agent.startServer().catch(console.error);

export { SummarizerAgent };

