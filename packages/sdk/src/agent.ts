import { EventEmitter } from 'events';
import { RegistryClient } from './registry-client.js';
import { PaymentClient } from './payment-client.js';
import { AgentMetadata, AgentRequest, AgentResponse, AgentCapability } from './types.js';
import axios from 'axios';

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

  constructor(config: AgentConfig) {
    super();
    
    this.metadata = {
      id: this.generateId(config.name),
      name: config.name,
      description: config.description,
      version: config.version,
      capabilities: config.capabilities,
      endpoint: `http://localhost:${config.port || 3100}`,
      walletAddress: config.walletAddress,
      tags: config.tags || [],
      createdAt: new Date().toISOString(),
    };

    this.registry = new RegistryClient(config.registryUrl);
    this.paymentClient = new PaymentClient(config.routerUrl);
  }

  private generateId(name: string): string {
    return `agent-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
  }

  async start(): Promise<void> {
    try {
      // Register with the registry
      const result = await this.registry.register(this.metadata);
      console.log(`✅ Agent ${this.metadata.name} registered with ID: ${result.agentId}`);
      
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
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
      
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
    
    let paymentResponse;
    if (paymentAmount) {
      // Process payment first
      paymentResponse = await this.paymentClient.processPayment({
        from: this.metadata.walletAddress,
        to: agent.walletAddress,
        amount: paymentAmount,
        currency: 'USDC',
        serviceId: capability,
      });
    }

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

