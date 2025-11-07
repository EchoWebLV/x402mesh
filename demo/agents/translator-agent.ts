import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const TRANSLATOR_WALLET_NAME = process.env.TRANSLATOR_WALLET || 'TranslatorWallet';

class TranslatorAgent extends Agent {
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
    // ✅ SDK now automatically handles:
    // - Express app creation
    // - /execute endpoint with x402 payment handling
    // - /health endpoint
    // - Payment verification
    // - Server startup
  }

  // This is the ONLY method you need to implement!
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

}

export async function startTranslatorAgent(port: number = 3100) {
  const walletAddress = await getWalletAddress(TRANSLATOR_WALLET_NAME);
  const agent = new TranslatorAgent(walletAddress, port);
  await agent.start();  // SDK now handles server startup automatically!
  console.log(`🌍 Translator Agent wallet: ${walletAddress}`);
  return agent;
}

startTranslatorAgent().catch(console.error);

export { TranslatorAgent };

