import { EventEmitter } from 'events';
import express, { Request, Response } from 'express';
import { RegistryClient } from './registry-client.js';
import { PaymentClient } from './payment-client.js';
import { AgentMetadata, AgentRequest, AgentResponse, AgentCapability } from './types.js';
import { parseXPaymentHeader, createXPaymentResponse } from './x402-utils.js';
import axios from 'axios';
import type { Server } from 'http';

export interface AgentConfig {
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  walletAddress: string;
  port?: number;
  registryUrl?: string;
  routerUrl?: string;
  tags?: string[];
}

export abstract class Agent extends EventEmitter {
  protected metadata: AgentMetadata;
  protected registry: RegistryClient;
  protected paymentClient: PaymentClient;
  protected isRunning: boolean = false;
  protected heartbeatInterval?: NodeJS.Timeout;
  protected app: express.Application;
  protected server?: Server;
  protected port: number;
  protected routerUrl: string;

  constructor(config: AgentConfig) {
    super();
    
    this.port = config.port || 3100;
    this.routerUrl = config.routerUrl || 'http://localhost:3002';
    
    this.metadata = {
      id: this.generateId(config.name),
      name: config.name,
      description: config.description,
      version: config.version,
      capabilities: config.capabilities,
      endpoint: `http://localhost:${this.port}`,
      walletAddress: config.walletAddress,
      tags: config.tags || [],
      createdAt: new Date().toISOString(),
    };

    this.registry = new RegistryClient(config.registryUrl);
    this.paymentClient = new PaymentClient(config.routerUrl);
    
    // Automatically create Express app with endpoints
    this.app = express();
    this.app.use(express.json());
    this.setupHttpEndpoints();
  }

  private generateId(name: string): string {
    return `agent-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }

  /**
   * Automatically setup HTTP endpoints for agent
   * Developers don't need to create Express routes manually
   */
  private setupHttpEndpoints(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'healthy', 
        agent: this.metadata.name,
        version: this.metadata.version 
      });
    });

    // Execute capability endpoint with automatic x402 payment handling
    this.app.post('/execute', async (req: Request, res: Response) => {
      const { capability, input, payment } = req.body;

      console.log(`\n${this.metadata.name} received request:`);
      console.log(`   Capability: ${capability}`);
      console.log(`   Input: ${JSON.stringify(input).substring(0, 100)}`);

      // Find the capability
      const capabilityInfo = this.metadata.capabilities.find(c => c.name === capability);
      if (!capabilityInfo) {
        return res.status(400).json({ 
          success: false, 
          error: `Capability ${capability} not available` 
        });
      }

      // Verify payment (automatic x402 handling)
      try {
        await this.verifyPayment(payment, capabilityInfo);
      } catch (error: any) {
        // Return standard x402 402 Payment Required response
        const priceInSmallestUnits = capabilityInfo.pricing.currency === 'SOL'
          ? Math.floor(capabilityInfo.pricing.amount * 1_000_000_000)
          : Math.floor(capabilityInfo.pricing.amount * 1_000_000);
        
        return res.status(error.statusCode || 402).json({ 
          error: error.message || 'Payment Required',
          paymentRequired: true,
          payment: {
            x402Version: 1,
            scheme: 'exact',
            network: 'solana-devnet',
            recipient: this.metadata.walletAddress,
            amount: priceInSmallestUnits,
            memo: `Payment for ${capability}`
          }
        });
      }

      // Execute the capability
      try {
        const result = await this.execute(capability, input);

        // Add standard x402 success headers
        const paymentResponseHeader = createXPaymentResponse(
          payment.signature || payment.transactionId,
          true,
          payment.explorerUrl
        );

        res.setHeader('X-PAYMENT-RESPONSE', paymentResponseHeader);
        res.setHeader('X-Payment-Received', 'true');
        res.setHeader('X-Transaction-Id', payment.transactionId);

        res.json({ success: true, data: result, payment });
      } catch (error: any) {
        console.error('Execution error:', error);
        res.status(400).json({ success: false, error: error.message });
      }
    });
  }

  /**
   * Verify payment against router
   */
  private async verifyPayment(payment: any, capability: AgentCapability): Promise<void> {
    if (!payment || !payment.transactionId) {
      const err: any = new Error('Payment Required');
      err.statusCode = 402;
      throw err;
    }

    try {
      const response = await axios.get(`${this.routerUrl}/payments/${payment.transactionId}`);
      const paymentRecord = response.data;

      if (paymentRecord.status !== 'completed') {
        throw new Error('Payment not completed');
      }

      if (paymentRecord.to !== this.metadata.walletAddress) {
        throw new Error('Payment destination mismatch');
      }

      if (paymentRecord.currency !== capability.pricing.currency) {
        throw new Error('Payment currency mismatch');
      }

      if (Math.abs(paymentRecord.amount - capability.pricing.amount) > 0.0000001) {
        throw new Error('Payment amount mismatch');
      }
    } catch (error: any) {
      const err: any = new Error(error.response?.data?.error || error.message || 'Payment verification failed');
      err.statusCode = 402;
      throw err;
    }
  }

  async start(): Promise<void> {
    try {
      // Start HTTP server first
      await new Promise<void>((resolve) => {
        this.server = this.app.listen(this.port, () => {
          console.log(`🚀 ${this.metadata.name} HTTP server listening on port ${this.port}`);
          resolve();
        });
      });

      // Register with the registry
      const result = await this.registry.register(this.metadata);
      console.log(`✅ Agent ${this.metadata.name} registered with ID: ${result.agentId}`);
      console.log(`   Endpoint: ${this.metadata.endpoint}`);
      console.log(`   Wallet: ${this.metadata.walletAddress}`);
      
      this.isRunning = true;
      
      // Start heartbeat
      this.heartbeatInterval = setInterval(async () => {
        try {
          await this.registry.heartbeat(this.metadata.id);
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      }, 30000); // Every 30 seconds

      this.emit('started');
    } catch (error) {
      console.error('Failed to start agent:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      
      // Stop HTTP server
      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server!.close(() => resolve());
        });
      }
      
      // Deregister from registry
      await this.registry.deregister(this.metadata.id);
      this.isRunning = false;
      this.emit('stopped');
      console.log(`✅ Agent ${this.metadata.name} stopped`);
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  }

  async discoverAgents(query?: { tags?: string[]; capability?: string }): Promise<AgentMetadata[]> {
    return this.registry.discover(query);
  }

  async callAgent(agentId: string, capability: string, input: any, paymentAmount?: number): Promise<any> {
    const agent = await this.registry.getAgent(agentId);
    
    // Find the capability to get correct currency
    const cap = agent.capabilities.find(c => c.name === capability);
    if (!cap) {
      throw new Error(`Capability ${capability} not found on agent ${agent.name}`);
    }
    
    let paymentResponse;
    const amount = paymentAmount || cap.pricing.amount;
    
    // Process payment with correct currency from capability
    paymentResponse = await this.paymentClient.processPayment({
      from: this.metadata.walletAddress,
      to: agent.walletAddress,
      amount,
      currency: cap.pricing.currency,  // Use capability's currency, not hard-coded
      serviceId: capability,
    });

    // Call the agent's endpoint
    const response = await axios.post(`${agent.endpoint}/execute`, {
      agentId: this.metadata.id,
      capability,
      input,
      payment: paymentResponse,
    });

    return response.data;
  }

  async executeChain(chain: { agentId: string; capability: string; input: any }[]): Promise<any> {
    const result = await this.paymentClient.executeChain({
      chain,
      paymentSource: this.metadata.walletAddress,
    });
    return result;
  }

  // Abstract method that each agent must implement
  abstract execute(capability: string, input: any): Promise<any>;

  getMetadata(): AgentMetadata {
    return this.metadata;
  }

  getId(): string {
    return this.metadata.id;
  }
}

