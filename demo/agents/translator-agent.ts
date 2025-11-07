import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { Agent, AgentCapability } from '../../packages/sdk/src/agent.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const ROUTER_URL = process.env.ROUTER_URL || 'http://localhost:3002';
const TRANSLATOR_WALLET_NAME = process.env.TRANSLATOR_WALLET || 'TranslatorWallet';

class TranslatorAgent extends Agent {
  private app: express.Application;
  private port: number;
  private routerUrl: string;

  constructor(walletAddress: string, port: number = 3100) {
    const capabilities: AgentCapability[] = [
      {
        name: 'translate',
        description: 'Translate text between languages',
        inputSchema: { text: 'string', targetLanguage: 'string' },
        outputSchema: { translatedText: 'string', language: 'string' },
        pricing: {
          amount: 0.01,
          currency: 'SOL',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Translator Agent',
      description: 'Translates text between multiple languages',
      version: '1.0.0',
      capabilities,
      walletAddress,
      port,
      tags: ['translation', 'language', 'nlp'],
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

      console.log(`\n🌍 Translator Agent received request:`);
      console.log(`   Capability: ${capability}`);
      console.log(`   Input: ${JSON.stringify(input)}`);

      const capabilityInfo = this.metadata.capabilities.find(c => c.name === capability);
      if (!capabilityInfo) {
        res.status(400).json({ success: false, error: `Capability ${capability} not available` });
        return;
      }

      // Check for x402 payment
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
          'X-Payment-Received': 'true',  // Keep for backward compat
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
    if (capability === 'translate') {
      return this.translate(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async translate(input: { text: string; targetLanguage: string }): Promise<any> {
    const translations: Record<string, Record<string, string>> = {
      spanish: {
        hello: 'hola',
        world: 'mundo',
        'good morning': 'buenos días',
        'how are you': 'cómo estás',
        'thank you': 'gracias',
        'artificial intelligence': 'inteligencia artificial',
        'payment system': 'sistema de pago',
        blockchain: 'cadena de bloques',
      },
      french: {
        hello: 'bonjour',
        world: 'monde',
        'good morning': 'bonjour',
        'how are you': 'comment allez-vous',
        'thank you': 'merci',
        'artificial intelligence': 'intelligence artificielle',
        'payment system': 'système de paiement',
        blockchain: 'blockchain',
      },
      german: {
        hello: 'hallo',
        world: 'welt',
        'good morning': 'guten morgen',
        'how are you': 'wie geht es dir',
        'thank you': 'danke',
        'artificial intelligence': 'künstliche intelligenz',
        'payment system': 'zahlungssystem',
        blockchain: 'blockchain',
      },
    };

    await new Promise(resolve => setTimeout(resolve, 300));

    const lang = input.targetLanguage.toLowerCase();
    let translatedText = input.text.toLowerCase();

    if (translations[lang]) {
      Object.entries(translations[lang]).forEach(([key, value]) => {
        const regex = new RegExp(key, 'gi');
        translatedText = translatedText.replace(regex, value);
      });
    }

    console.log(`   ✅ Translated: "${input.text}" → "${translatedText}" (${input.targetLanguage})`);

    return {
      translatedText,
      language: input.targetLanguage,
      originalText: input.text,
    };
  }

  async startServer() {
    await this.start();
    this.app.listen(this.port, () => {
      console.log(`🌍 Translator Agent listening on port ${this.port}`);
    });
  }
}

export async function startTranslatorAgent(port: number = 3100) {
  const walletAddress = await getWalletAddress(TRANSLATOR_WALLET_NAME);
  const agent = new TranslatorAgent(walletAddress, port);
  await agent.startServer();
  console.log(`🌍 Translator Agent wallet: ${walletAddress}`);
  return agent;
}

startTranslatorAgent().catch(console.error);

export { TranslatorAgent };

