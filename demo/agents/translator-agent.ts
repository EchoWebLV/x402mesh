import 'dotenv/config';
import express from 'express';
import { Agent, AgentCapability } from '../../packages/sdk/src/agent.js';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

class TranslatorAgent extends Agent {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3100) {
    const capabilities: AgentCapability[] = [
      {
        name: 'translate',
        description: 'Translate text between languages',
        inputSchema: { text: 'string', targetLanguage: 'string' },
        outputSchema: { translatedText: 'string', language: 'string' },
        pricing: {
          amount: 0.01,
          currency: 'USDC',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Translator Agent',
      description: 'Translates text between multiple languages',
      version: '1.0.0',
      capabilities,
      walletAddress: 'TranslatorWallet123ABC',
      port,
      tags: ['translation', 'language', 'nlp'],
    });

    this.port = port;
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
      
      // x402 Protocol: Verify payment (real or simulated)
      const requiredCapability = this.metadata.capabilities.find(c => c.name === capability);
      const requiredAmount = requiredCapability?.pricing.amount || 0.01;
      
      if (!payment) {
        // Return HTTP 402 Payment Required
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
      
      // REAL VERIFICATION MODE: Check payment on Solana blockchain
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
        // No valid payment proof
        res.status(402).json({
          error: 'Invalid payment proof - need either on-chain signature or completed status',
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
    if (capability === 'translate') {
      return this.translate(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async translate(input: { text: string; targetLanguage: string }): Promise<any> {
    // Simulate translation (in production, would use actual translation API)
    const translations: Record<string, Record<string, string>> = {
      'spanish': {
        'hello': 'hola',
        'world': 'mundo',
        'good morning': 'buenos días',
        'how are you': 'cómo estás',
        'thank you': 'gracias',
        'artificial intelligence': 'inteligencia artificial',
        'payment system': 'sistema de pago',
        'blockchain': 'cadena de bloques',
      },
      'french': {
        'hello': 'bonjour',
        'world': 'monde',
        'good morning': 'bonjour',
        'how are you': 'comment allez-vous',
        'thank you': 'merci',
        'artificial intelligence': 'intelligence artificielle',
        'payment system': 'système de paiement',
        'blockchain': 'blockchain',
      },
      'german': {
        'hello': 'hallo',
        'world': 'welt',
        'good morning': 'guten morgen',
        'how are you': 'wie geht es dir',
        'thank you': 'danke',
        'artificial intelligence': 'künstliche intelligenz',
        'payment system': 'zahlungssystem',
        'blockchain': 'blockchain',
      },
    };

    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate processing

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

// Start the agent
const agent = new TranslatorAgent(3100);
agent.startServer().catch(console.error);

export { TranslatorAgent };

