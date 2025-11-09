import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const TRANSLATOR_WALLET_NAME = process.env.TRANSLATOR_WALLET || 'TranslatorWallet';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

class TranslatorAgent extends Agent {
  private openaiClient: any = null;

  constructor(walletAddress: string, port: number = 3100) {
    if (OPENAI_API_KEY) {
      import('openai').then(({ default: OpenAI }) => {
        this.openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
        console.log('✨ OpenAI integration enabled for real AI translation');
      }).catch(() => {
        console.warn('⚠️  OpenAI not available, using fallback');
      });
    } else {
      console.log('🌍 Using basic translation (set OPENAI_API_KEY for AI translation)');
    }

    const capabilities: AgentCapability[] = [
      {
        name: 'translate',
        description: 'Translate text between languages',
        inputSchema: { text: 'string', targetLanguage: 'string' },
        outputSchema: { translatedText: 'string', language: 'string' },
        pricing: { amount: 0.01, currency: 'SOL' as const, model: 'per_request' },
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
  }

  // This is the ONLY method you need to implement!
  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'translate') {
      return this.translate(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async translate(input: { text: string; targetLanguage: string }): Promise<any> {
    const text = input.text;
    const targetLanguage = input.targetLanguage;

    // Try OpenAI translation first
    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the given text to ${targetLanguage}. Return ONLY the translated text, nothing else. Preserve the tone and meaning of the original text.`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        });

        const translatedText = completion.choices[0]?.message?.content?.trim() || text;
        
        console.log(`   ✅ AI Translated: "${text}" → "${translatedText}" (${targetLanguage})`);

        return {
          translatedText,
          language: targetLanguage,
          originalText: text,
          method: 'openai',
          confidence: 95
        };
      } catch (error) {
        console.warn('   ⚠️  OpenAI translation failed, using fallback');
      }
    }

    // Fallback to basic dictionary-based translation
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

    const lang = targetLanguage.toLowerCase();
    let translatedText = text.toLowerCase();

    if (translations[lang]) {
      Object.entries(translations[lang]).forEach(([key, value]) => {
        const regex = new RegExp(key, 'gi');
        translatedText = translatedText.replace(regex, value);
      });
    }

    console.log(`   ✅ Translated: "${text}" → "${translatedText}" (${targetLanguage}) [fallback]`);

    return {
      translatedText,
      language: targetLanguage,
      originalText: text,
      method: 'dictionary',
      note: 'Set OPENAI_API_KEY for AI translation'
    };
  }
}

export async function startTranslatorAgent(port: number = 3100) {
  const walletAddress = await getWalletAddress(TRANSLATOR_WALLET_NAME);
  const agent = new TranslatorAgent(walletAddress, port);
  await agent.start();  // ✅ SDK handles everything automatically!
  console.log(`🌍 Translator Agent wallet: ${walletAddress}`);
  return agent;
}

startTranslatorAgent().catch(console.error);

export { TranslatorAgent };

