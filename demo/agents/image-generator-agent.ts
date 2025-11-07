import 'dotenv/config';
import { Agent } from '../../packages/sdk/src/agent.js';
import { AgentCapability } from '../../packages/sdk/src/types.js';
import { getWalletAddress } from '../../packages/router/src/wallet-utils.js';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import * as path from 'node:path';

const IMAGE_GENERATOR_WALLET_NAME = process.env.IMAGE_GENERATOR_WALLET || 'ImageGeneratorWallet';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

class ImageGeneratorAgent extends Agent {
  private geminiClient: any = null;

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

    // Initialize Gemini after super()
    if (GEMINI_API_KEY) {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        console.log('✨ Gemini AI integration enabled for real image generation');
      } catch (error) {
        console.warn('⚠️  Gemini AI not available, using fallback');
      }
    } else {
      console.log('🎨 Using simulated image generation (set GEMINI_API_KEY for real AI)');
    }
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'generate_image') {
      return this.generateImage(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async generateImage(input: { prompt: string; style?: string }): Promise<any> {
    const prompt = input.prompt || 'a beautiful landscape';
    const style = input.style || 'realistic';
    const fullPrompt = `${prompt} in ${style} style`;

    if (this.geminiClient) {
      try {
        console.log(`   🎨 Generating image with Gemini: "${fullPrompt}"`);
        
        const response = await this.geminiClient.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: fullPrompt,
        });

        // Extract image from response
        if (response.candidates && response.candidates[0]) {
          const candidate = response.candidates[0];
          const parts = candidate.content?.parts || [];
          
          for (const part of parts) {
            if (part.inlineData) {
              const imageData = part.inlineData.data;
              
              console.log(`   ✅ Image generated with Gemini AI`);

              return {
                imageData: imageData, // base64 string
                imageUrl: `data:image/png;base64,${imageData}`,
                prompt: fullPrompt,
                style,
                dimensions: { width: 1024, height: 1024 },
                model: 'gemini-2.5-flash-image',
                format: 'png',
                note: 'Generated with Google Gemini AI'
              };
            }
          }
        }
      } catch (error: any) {
        console.error('   ❌ Gemini generation failed:', error.message || error);
        console.error('   Full error:', error);
      }
    }

    // Fallback for demo - create a simple placeholder base64 image
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 1x1 transparent PNG in base64
    const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log(`   ✅ Simulated image: "${prompt}" (${style} style)`);

    return {
      imageData: placeholderBase64,
      imageUrl: `data:image/png;base64,${placeholderBase64}`,
      prompt: input.prompt,
      style,
      dimensions: { width: 1024, height: 1024 },
      model: 'simulated',
      note: 'Demo mode - set GEMINI_API_KEY for real AI generation'
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

