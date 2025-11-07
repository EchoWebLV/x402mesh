import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';

const BACKGROUND_REMOVER_WALLET_NAME = process.env.BACKGROUND_REMOVER_WALLET || 'BackgroundRemoverWallet';

class BackgroundRemoverAgent extends Agent {
  constructor(walletAddress: string, port: number = 3104) {
    const capabilities: AgentCapability[] = [
      {
        name: 'remove_background',
        description: 'Remove background from images using AI',
        inputSchema: { imageUrl: 'string' },
        outputSchema: { processedImageUrl: 'string', removed: 'boolean' },
        pricing: {
          amount: 0.008,
          currency: 'SOL',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Background Remover',
      description: 'AI-powered background removal from images',
      version: '1.0.0',
      capabilities,
      walletAddress,
      port,
      tags: ['image', 'ai', 'background-removal', 'processing'],
    });
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'remove_background') {
      return this.removeBackground(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async removeBackground(input: any): Promise<any> {
    // Simulate AI background removal
    await new Promise(resolve => setTimeout(resolve, 400));

    // Handle input from previous agent or direct input
    const imageUrl = typeof input === 'string' 
      ? input 
      : input.imageUrl || input.processedImageUrl || 'placeholder.png';

    // In production, would call:
    // - remove.bg API
    // - Adobe Firefly API
    // - Custom ML model
    // For demo, return simulated response
    
    const processedImageUrl = imageUrl.replace('.png', '-no-bg.png');
    
    console.log(`   ✅ Removed background from: ${imageUrl.slice(0, 50)}...`);

    return {
      processedImageUrl,
      originalImageUrl: imageUrl,
      removed: true,
      format: 'png',
      transparency: true,
      note: 'Demo: Real integration with remove.bg/Adobe Firefly available with API key'
    };
  }
}

export async function startBackgroundRemoverAgent(port: number = 3104) {
  const walletAddress = await getWalletAddress(BACKGROUND_REMOVER_WALLET_NAME);
  const agent = new BackgroundRemoverAgent(walletAddress, port);
  await agent.start();
  console.log(`🖼️  Background Remover Agent wallet: ${walletAddress}`);
  return agent;
}

startBackgroundRemoverAgent().catch(console.error);

export { BackgroundRemoverAgent };

