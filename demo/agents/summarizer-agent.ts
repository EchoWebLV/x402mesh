import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { Agent, AgentCapability } from '../../packages/sdk/src/agent.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const ROUTER_URL = process.env.ROUTER_URL || 'http://localhost:3002';
const SUMMARIZER_WALLET_NAME = process.env.SUMMARIZER_WALLET || 'SummarizerWallet';

class SummarizerAgent extends Agent {
  private app: express.Application;
  private port: number;
  private openaiClient: any = null;
  private routerUrl: string;

  constructor(walletAddress: string, port: number = 3101) {
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
          amount: 0.015,
          currency: 'SOL',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Summarizer Agent',
      description: 'Summarizes text into key points',
      version: '1.0.0',
      capabilities,
      walletAddress,
      port,
      tags: ['summarization', 'nlp', 'text-processing'],
    });

    this.port = port;
    this.routerUrl = ROUTER_URL;
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

      const capabilityInfo = this.metadata.capabilities.find(c => c.name === capability);
      if (!capabilityInfo) {
        res.status(400).json({ success: false, error: `Capability ${capability} not available` });
        return;
      }

      try {
        await this.verifyPayment(payment, capabilityInfo);
      } catch (error: any) {
        const message = error.message || 'Payment verification failed';
        
        // Return standard x402 402 Payment Required response
        const priceInSmallestUnits = capabilityInfo.pricing.currency === 'SOL'
          ? Math.floor(capabilityInfo.pricing.amount * 1_000_000_000)
          : Math.floor(capabilityInfo.pricing.amount * 1_000_000);
        
        return res.status(error.statusCode || 402).json({ 
          error: message,
          paymentRequired: true,
          payment: {
            x402Version: 1,
            scheme: 'exact',
            network: 'solana-devnet',
            recipient: this.metadata.walletAddress,
            amount: priceInSmallestUnits,
            memo: `Payment for ${capability}`
          }
        });
      }

      try {
        const result = await this.execute(capability, input);

        // Standard x402 success headers
        const paymentResponseHeader = Buffer.from(JSON.stringify({
          x402Version: 1,
          verified: true,
          signature: payment.signature || payment.transactionId,
          timestamp: new Date().toISOString()
        })).toString('base64');

        res.set({
          'X-PAYMENT-RESPONSE': paymentResponseHeader,
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

  private async verifyPayment(payment: any, capability: AgentCapability) {
    if (!payment || !payment.transactionId) {
      const err: any = new Error('Payment Required');
      err.statusCode = 402;
      throw err;
    }

    try {
      const response = await axios.get(`${this.routerUrl}/payments/${payment.transactionId}`);
      const paymentRecord = response.data;

      if (paymentRecord.status !== 'completed') {
        throw new Error('Payment not completed');
      }

      if (paymentRecord.to !== this.metadata.walletAddress) {
        throw new Error('Payment destination mismatch');
      }

      if (paymentRecord.currency !== capability.pricing.currency) {
        throw new Error('Payment currency mismatch');
      }

      if (Math.abs(paymentRecord.amount - capability.pricing.amount) > 0.0000001) {
        throw new Error('Payment amount mismatch');
      }
    } catch (error: any) {
      const err: any = new Error(error.response?.data?.error || error.message || 'Payment verification failed');
      err.statusCode = 402;
      throw err;
    }
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'summarize') {
      return this.summarize(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async summarize(input: { text: string; maxBullets?: number }): Promise<any> {
    const text = typeof input === 'string' ? input : (input.translatedText || input.text || JSON.stringify(input));
    const maxBullets = input.maxBullets || 3;

    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a summarization assistant. Create ${maxBullets} concise bullet points from the given text. Return ONLY the bullet points, one per line, without numbers or dashes.`,
            },
            {
              role: 'user',
              content: text,
            },
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

}

export async function startSummarizerAgent(port: number = 3101) {
  const walletAddress = await getWalletAddress(SUMMARIZER_WALLET_NAME);
  const agent = new SummarizerAgent(walletAddress, port);
  await agent.start();  // SDK now handles server startup automatically!
  console.log(`📝 Summarizer Agent wallet: ${walletAddress}`);
  return agent;
}

startSummarizerAgent().catch(console.error);

export { SummarizerAgent };

