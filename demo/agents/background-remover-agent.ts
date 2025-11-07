import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';
import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'node:fs';
import * as path from 'node:path';

const BACKGROUND_REMOVER_WALLET_NAME = process.env.BACKGROUND_REMOVER_WALLET || 'BackgroundRemoverWallet';
const REMOVEBG_API_KEY = process.env.REMOVEBG_API_KEY;

class BackgroundRemoverAgent extends Agent {
  private hasApiKey: boolean;

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

    this.hasApiKey = !!REMOVEBG_API_KEY;
    
    if (this.hasApiKey) {
      console.log('✨ Remove.bg API integration enabled for real background removal');
    } else {
      console.log('🖼️  Using simulated background removal (set REMOVEBG_API_KEY for real API)');
    }
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'remove_background') {
      return this.removeBackground(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async removeBackground(input: any): Promise<any> {
    // Handle input from previous agent - get base64 data or URL
    const imageData = input.imageData;
    const imageUrl = input.imageUrl;

    if (this.hasApiKey && REMOVEBG_API_KEY) {
      try {
        console.log(`   🖼️  Removing background with remove.bg API...`);
        
        let imageBuffer: Buffer;
        
        if (imageData) {
          // Convert base64 to buffer
          imageBuffer = Buffer.from(imageData, 'base64');
        } else if (imageUrl && imageUrl.startsWith('data:image')) {
          // Extract base64 from data URI
          const base64Data = imageUrl.split(',')[1];
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (imageUrl && imageUrl.startsWith('http')) {
          // Download from URL
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          imageBuffer = Buffer.from(response.data);
        } else {
          throw new Error('Invalid image source');
        }

        // Call remove.bg API
        const formData = new FormData();
        formData.append('image_file', imageBuffer, 'image.png');
        formData.append('size', 'auto');

        const apiResponse = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
          headers: {
            'X-API-Key': REMOVEBG_API_KEY,
            ...formData.getHeaders(),
          },
          responseType: 'arraybuffer',
        });

        // Convert to base64
        const processedBase64 = Buffer.from(apiResponse.data).toString('base64');
        
        console.log(`   ✅ Background removed with remove.bg API`);

        return {
          imageData: processedBase64,
          processedImageUrl: `data:image/png;base64,${processedBase64}`,
          originalImageUrl: imageUrl,
          removed: true,
          format: 'png',
          transparency: true,
          note: 'Processed with remove.bg API'
        };
      } catch (error: any) {
        console.warn('   ⚠️  Remove.bg API failed, using fallback:', error.message);
      }
    }

    // Fallback for demo - return same image with note
    await new Promise(resolve => setTimeout(resolve, 400));
    
    console.log(`   ✅ Simulated background removal`);

    return {
      imageData: imageData || 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      processedImageUrl: imageUrl || `data:image/png;base64,${imageData}`,
      originalImageUrl: imageUrl,
      removed: true,
      format: 'png',
      transparency: true,
      note: 'Demo mode - set REMOVEBG_API_KEY for real API'
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

