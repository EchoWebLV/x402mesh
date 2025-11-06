import 'dotenv/config';
import express from 'express';
import { Agent, AgentCapability } from '../../packages/sdk/src/agent.js';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

class SummarizerAgent extends Agent {
  private app: express.Application;
  private port: number;
  private openaiClient: any = null;
  
  constructor(port: number = 3101) {
    // Initialize OpenAI if API key is provided
    if (process.env.OPENAI_API_KEY) {
      import('openai').then(({ default: OpenAI }) => {
        this.openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('✨ OpenAI integration enabled for real AI summarization');
      }).catch(err => {
        console.warn('⚠️  OpenAI not available, using fallback algorithm');
      });
    } else {
      console.log('📝 Using sentence extraction (set OPENAI_API_KEY for real AI)');
    }

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
      
      // x402 Protocol: Verify payment (real or simulated)
      const requiredCapability = this.metadata.capabilities.find(c => c.name === capability);
      const requiredAmount = requiredCapability?.pricing.amount || 0.02;
      
      if (!payment) {
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
      
      // REAL VERIFICATION MODE: Check on blockchain
      if (payment.onChain === true && payment.signature) {
        try {
          const tx = await connection.getTransaction(payment.signature, {
            maxSupportedTransactionVersion: 0,
          });
          
          if (!tx || tx.meta?.err) {
            res.status(402).json({
              error: 'Payment transaction not found or failed on-chain',
              paymentRequired: true,
            });
            return;
          }
          
          console.log(`   ✅ Payment verified on-chain: ${payment.signature.slice(0, 8)}...`);
        } catch (error) {
          console.error('   ❌ On-chain verification failed:', error);
          res.status(402).json({
            error: 'Could not verify payment on blockchain',
            paymentRequired: true,
          });
          return;
        }
      } else if (payment.status === 'completed') {
        // SIMULATED MODE: Accept completed status
        console.log(`   ✅ Payment accepted (simulated): ${payment.transactionId}`);
      } else {
        res.status(402).json({
          error: 'Invalid payment proof',
          paymentRequired: true,
        });
        return;
      }

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
    const text = typeof input === 'string' ? input : 
                 (input.translatedText || input.text || JSON.stringify(input));
    const maxBullets = input.maxBullets || 3;

    // Try OpenAI first if available
    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a summarization assistant. Create ${maxBullets} concise bullet points from the given text. Return ONLY the bullet points, one per line, without numbers or dashes.`
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 150,
          temperature: 0.7,
        });

        const aiSummary = completion.choices[0]?.message?.content || '';
        const summary = aiSummary.split('\n').filter(s => s.trim().length > 0).slice(0, maxBullets);
        const wordCount = text.split(/\s+/).length;

        console.log(`   ✅ AI Summarized ${wordCount} words into ${summary.length} points (OpenAI)`);

        return {
          summary,
          wordCount,
          originalLength: text.length,
          compressionRatio: (summary.join(' ').length / text.length * 100).toFixed(1) + '%',
          method: 'openai',
        };
      } catch (error) {
        console.warn('   ⚠️  OpenAI failed, using fallback:', error);
      }
    }

    // Fallback: Simple sentence extraction
    await new Promise(resolve => setTimeout(resolve, 400));
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, maxBullets).map(s => s.trim());
    const wordCount = text.split(/\s+/).length;

    console.log(`   ✅ Summarized ${wordCount} words into ${summary.length} points (fallback)`);

    return {
      summary,
      wordCount,
      originalLength: text.length,
      compressionRatio: (summary.join(' ').length / text.length * 100).toFixed(1) + '%',
      method: 'sentence-extraction',
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

