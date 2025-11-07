import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const IMAGE_GENERATOR_WALLET_NAME = process.env.IMAGE_GENERATOR_WALLET || 'ImageGeneratorWallet';

class ImageGeneratorAgent extends Agent {
  constructor(walletAddress: string, port: number = 3103) {
    const capabilities: AgentCapability[] = [
      {
        name: 'generate_image',
        description: 'Generate image from text prompt using AI',
        inputSchema: { prompt: 'string', style: 'string' },
        outputSchema: { imageUrl: 'string', prompt: 'string' },
        pricing: {
          amount: 0.01,
          currency: 'SOL',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Image Generator',
      description: 'AI-powered image generation from text prompts',
      version: '1.0.0',
      capabilities,
      walletAddress,
      port,
      tags: ['image', 'ai', 'generation', 'stable-diffusion'],
    });
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'generate_image') {
      return this.generateImage(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async generateImage(input: { prompt: string; style?: string }): Promise<any> {
    // Simulate AI image generation
    await new Promise(resolve => setTimeout(resolve, 500));

    const prompt = input.prompt || 'a beautiful landscape';
    const style = input.style || 'realistic';

    // In production, would call:
    // - Replicate API (Stable Diffusion)
    // - DALL-E API
    // - Midjourney API
    // For demo, return simulated response
    
    const imageUrl = `https://placeholder.image/generated/${encodeURIComponent(prompt.slice(0, 30))}.png`;
    
    console.log(`   ✅ Generated image: "${prompt}" (${style} style)`);

    return {
      imageUrl,
      prompt: input.prompt,
      style: style,
      dimensions: { width: 1024, height: 1024 },
      model: 'stable-diffusion-xl',
      note: 'Demo: Real integration with Replicate/DALL-E available with API key'
    };
  }
}

export async function startImageGeneratorAgent(port: number = 3103) {
  const walletAddress = await getWalletAddress(IMAGE_GENERATOR_WALLET_NAME);
  const agent = new ImageGeneratorAgent(walletAddress, port);
  await agent.start();
  console.log(`🎨 Image Generator Agent wallet: ${walletAddress}`);
  return agent;
}

startImageGeneratorAgent().catch(console.error);

export { ImageGeneratorAgent };

