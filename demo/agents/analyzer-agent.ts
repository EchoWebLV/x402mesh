import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const ANALYZER_WALLET_NAME = process.env.ANALYZER_WALLET || 'AnalyzerWallet';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

class AnalyzerAgent extends Agent {
  private openaiClient: any = null;

  constructor(walletAddress: string, port: number = 3102) {
    if (OPENAI_API_KEY) {
      import('openai').then(({ default: OpenAI }) => {
        this.openaiClient = new OpenAI({ apiKey: OPENAI_API_KEY });
        console.log('✨ OpenAI integration enabled for real sentiment analysis');
      }).catch(() => {
        console.warn('⚠️  OpenAI not available, using fallback');
      });
    } else {
      console.log('🔍 Using word-based analysis (set OPENAI_API_KEY for AI analysis)');
    }
    const capabilities: AgentCapability[] = [
      {
        name: 'analyze_sentiment',
        description: 'Analyze sentiment and tone of text',
        schema: 'analysis_v1',  // ✨ Standard schema for auto-chaining
        inputSchema: { 
          text: 'string',
          analysis_type: 'string',
          metadata: 'object'
        },
        outputSchema: { 
          result: 'object',
          confidence: 'number',
          metadata: 'object'
        },
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
    // ✅ SDK now automatically handles:
    // - Express app creation
    // - /execute endpoint with x402 payment handling
    // - /health endpoint
    // - Payment verification
    // - Server startup
  }

  // This is the ONLY method you need to implement!
  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'analyze_sentiment') {
      return this.analyzeSentiment(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async analyzeSentiment(input: any): Promise<any> {
    const text = typeof input === 'string'
      ? input
      : (Array.isArray(input.summary) ? input.summary.join(' ') : input.text || JSON.stringify(input));

    if (this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a sentiment analysis expert. Analyze the sentiment of the given text and return ONLY a JSON object with this exact structure:
{
  "sentiment": "positive|negative|neutral",
  "score": <number between -1 and 1>,
  "insights": ["insight 1", "insight 2", "insight 3"],
  "confidence": <number between 0 and 100>
}`,
            },
            {
              role: 'user',
              content: text,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        });

        const analysisResult = JSON.parse(completion.choices[0]?.message?.content || '{}');
        
        console.log(`   ✅ AI Analysis: ${analysisResult.sentiment} (${analysisResult.confidence}% confidence)`);

        return {
          result: {  // ✨ Standard schema field
            sentiment: analysisResult.sentiment,
            score: analysisResult.score,
            insights: analysisResult.insights
          },
          confidence: analysisResult.confidence / 100,  // normalized to 0-1
          metadata: {
            wordCount: text.split(/\s+/).length,
            method: 'openai'
          }
        };
      } catch (error) {
        console.warn('   ⚠️  OpenAI analysis failed, using fallback');
      }
    }

    // Simple fallback
    await new Promise(resolve => setTimeout(resolve, 350));
    const words = text.split(/\s+/);

    console.log(`   ✅ Simulated analysis (${words.length} words)`);

    return {
      result: {  // ✨ Standard schema field
        sentiment: 'neutral',
        score: 0,
        insights: [
          `Detected ${words.length} words`,
          'Demo mode - sentiment not analyzed',
          'Set OPENAI_API_KEY for AI analysis'
        ]
      },
      confidence: 0.5,
      metadata: {
        wordCount: words.length,
        method: 'simulated'
      }
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
