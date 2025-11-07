import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const ANALYZER_WALLET_NAME = process.env.ANALYZER_WALLET || 'AnalyzerWallet';

class AnalyzerAgent extends Agent {
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
    await new Promise(resolve => setTimeout(resolve, 350));

    const text = typeof input === 'string'
      ? input
      : (Array.isArray(input.summary) ? input.summary.join(' ') : input.text || JSON.stringify(input));

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'happy', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'sad', 'poor', 'disappointing'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach((word: string) => {
      if (positiveWords.some((pw: string) => word.includes(pw))) score += 1;
      if (negativeWords.some((nw: string) => word.includes(nw))) score -= 1;
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
