import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { Agent, AgentCapability } from '../../packages/sdk/src/agent.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const ROUTER_URL = process.env.ROUTER_URL || 'http://localhost:3002';
const ANALYZER_WALLET_NAME = process.env.ANALYZER_WALLET || 'AnalyzerWallet';

class AnalyzerAgent extends Agent {
  private app: express.Application;
  private port: number;
  private routerUrl: string;

  constructor(walletAddress: string, port: number = 3102) {
    const capabilities: AgentCapability[] = [
      {
        name: 'analyze_sentiment',
        description: 'Analyze sentiment and tone of text',
        inputSchema: { text: 'string' },
        outputSchema: { sentiment: 'string', score: 'number', insights: 'string[]' },
        pricing: {
          amount: 0.012,
          currency: 'SOL',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Analyzer Agent',
      description: 'Analyzes text sentiment and provides insights',
      version: '1.0.0',
      capabilities,
      walletAddress,
      port,
      tags: ['sentiment', 'analysis', 'nlp'],
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

      console.log(`\n🔍 Analyzer Agent received request:`);
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
    if (capability === 'analyze_sentiment') {
      return this.analyzeSentiment(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async analyzeSentiment(input: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 350));

    const text = typeof input === 'string'
      ? input
      : (Array.isArray(input.summary) ? input.summary.join(' ') : input.text || JSON.stringify(input));

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'happy', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'poor', 'disappointing'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) score += 1;
      if (negativeWords.some(nw => word.includes(nw))) score -= 1;
    });

    const normalizedScore = Math.max(-1, Math.min(1, score / Math.max(words.length * 0.1, 1)));

    let sentiment: string;
    if (normalizedScore > 0.2) sentiment = 'positive';
    else if (normalizedScore < -0.2) sentiment = 'negative';
    else sentiment = 'neutral';

    const insights = [
      `Detected ${words.length} words`,
      `Sentiment leaning: ${sentiment}`,
      `Confidence: ${(Math.abs(normalizedScore) * 100).toFixed(0)}%`,
    ];

    console.log(`   ✅ Analysis complete: ${sentiment} (score: ${normalizedScore.toFixed(2)})`);

    return {
      sentiment,
      score: normalizedScore,
      insights,
      wordCount: words.length,
    };
  }

}

export async function startAnalyzerAgent(port: number = 3102) {
  const walletAddress = await getWalletAddress(ANALYZER_WALLET_NAME);
  const agent = new AnalyzerAgent(walletAddress, port);
  await agent.start();  // SDK now handles server startup automatically!
  console.log(`🔍 Analyzer Agent wallet: ${walletAddress}`);
  return agent;
}

startAnalyzerAgent().catch(console.error);

export { AnalyzerAgent };

