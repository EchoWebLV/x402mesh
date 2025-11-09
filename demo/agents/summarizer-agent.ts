import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const SUMMARIZER_WALLET_NAME = process.env.SUMMARIZER_WALLET || 'SummarizerWallet';

class SummarizerAgent extends Agent {
  private openaiClient: any = null;

  constructor(walletAddress: string, port: number = 3101) {
    if (process.env.OPENAI_API_KEY) {
      import('openai').then(({ default: OpenAI }) => {
        this.openaiClient = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        console.log('✨ OpenAI integration enabled for real AI summarization');
      }).catch(() => {
        console.warn('⚠️  OpenAI not available, using fallback algorithm');
      });
    } else {
      console.log('📝 Using sentence extraction (set OPENAI_API_KEY for real AI)');
    }

    const capabilities: AgentCapability[] = [
      {
        name: 'summarize',
        description: 'Summarize long text into concise bullet points',
        schema: 'text_processing_v1',  // ✨ Standard schema for auto-chaining
        inputSchema: { 
          text: 'string',
          language: 'string',
          metadata: 'object'
        },
        outputSchema: { 
          text: 'string',
          language: 'string',
          metadata: 'object'
        },
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
    // ✅ SDK now automatically handles:
    // - Express app creation
    // - /execute endpoint with x402 payment handling
    // - /health endpoint
    // - Payment verification
    // - Server startup
  }

  // This is the ONLY method you need to implement!
  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'summarize') {
      return this.summarize(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async summarize(input: any): Promise<any> {
    const text = typeof input === 'string' ? input : (input.text || JSON.stringify(input));
    const maxBullets = input.metadata?.maxBullets || 3;
    const language = input.language || 'en';

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
        const summary = aiSummary.split('\n').filter((s: string) => s.trim().length > 0).slice(0, maxBullets);
        const wordCount = text.split(/\s+/).length;

        console.log(`   ✅ AI Summarized ${wordCount} words into ${summary.length} points (OpenAI)`);

        return {
          text: summary.join('\n'),  // ✨ Standard schema field
          language,
          metadata: {
            bulletPoints: summary,
            wordCount,
            originalLength: text.length,
            compressionRatio: (summary.join(' ').length / text.length * 100).toFixed(1) + '%',
            method: 'openai'
          }
        };
      } catch (error) {
        console.warn('   ⚠️  OpenAI failed, using fallback:', error);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 400));
    const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const summary = sentences.slice(0, maxBullets).map((s: string) => s.trim());
    const wordCount = text.split(/\s+/).length;

    console.log(`   ✅ Summarized ${wordCount} words into ${summary.length} points (fallback)`);

    return {
      text: summary.join('\n'),  // ✨ Standard schema field
      language,
      metadata: {
        bulletPoints: summary,
        wordCount,
        originalLength: text.length,
        compressionRatio: (summary.join(' ').length / text.length * 100).toFixed(1) + '%',
        method: 'sentence-extraction'
      }
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
