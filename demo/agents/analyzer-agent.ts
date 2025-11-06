import express from 'express';
import { Agent, AgentCapability } from '../../packages/sdk/src/agent.js';

class AnalyzerAgent extends Agent {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3102) {
    const capabilities: AgentCapability[] = [
      {
        name: 'analyze_sentiment',
        description: 'Analyze sentiment and tone of text',
        inputSchema: { text: 'string' },
        outputSchema: { sentiment: 'string', score: 'number', insights: 'string[]' },
        pricing: {
          amount: 0.015,
          currency: 'USDC',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Analyzer Agent',
      description: 'Analyzes text sentiment and provides insights',
      version: '1.0.0',
      capabilities,
      walletAddress: 'AnalyzerWallet789GHI',
      port,
      tags: ['sentiment', 'analysis', 'nlp'],
    });

    this.port = port;
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
      if (payment) {
        console.log(`   Payment: ${payment.amount} ${payment.currency} (${payment.transactionId})`);
      }

      try {
        const result = await this.execute(capability, input);
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
    if (capability === 'analyze_sentiment') {
      return this.analyzeSentiment(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async analyzeSentiment(input: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 350)); // Simulate processing

    const text = typeof input === 'string' ? input : 
                 (input.summary ? input.summary.join(' ') : 
                  input.text || JSON.stringify(input));

    // Simple sentiment analysis
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

  async startServer() {
    await this.start();
    this.app.listen(this.port, () => {
      console.log(`🔍 Analyzer Agent listening on port ${this.port}`);
    });
  }
}

// Start the agent
const agent = new AnalyzerAgent(3102);
agent.startServer().catch(console.error);

export { AnalyzerAgent };

