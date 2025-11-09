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
        console.log('✨ OpenAI integration enabled for real translation');
      }).catch(() => {
        console.warn('⚠️  OpenAI not available, using fallback');
      });
    } else {
      console.log('🌍 Using dictionary translation (set OPENAI_API_KEY for AI translation)');
    }
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
    const targetLang = input.targetLanguage.toLowerCase();

    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the given text to ${targetLang}. Return ONLY the translated text, no explanations.`,
            },
            {
              role: 'user',
              content: input.text,
            },
          ],
          temperature: 0.3,
        });

        const translatedText = completion.choices[0]?.message?.content || input.text;
        
        console.log(`   ✅ AI Translated: "${input.text}" → "${translatedText}" (${targetLang})`);

        return {
          translatedText,
          language: input.targetLanguage,
          originalText: input.text,
          method: 'openai'
        };
      } catch (error) {
        console.warn('   ⚠️  OpenAI translation failed, using fallback');
      }
    }

    // Simple fallback - just return original with note
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log(`   ✅ Simulated translation: "${input.text}" (${targetLang})`);

    return {
      translatedText: `[${targetLang.toUpperCase()}] ${input.text}`,
      language: input.targetLanguage,
      originalText: input.text,
      method: 'simulated',
      note: 'Demo mode - set OPENAI_API_KEY for real AI translation'
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

