interface AgentCapability {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema: any;
  pricing: {
    amount: number;
    currency: 'USDC' | 'SOL';
    model: 'per_request' | 'per_token' | 'per_minute';
  };
}

interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
  endpoint: string;
  walletAddress: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastHeartbeat?: string;
  status?: 'active' | 'inactive';
}

export class AgentRegistry {
  private agents: Map<string, AgentMetadata> = new Map();
  private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds

  constructor() {
    // Clean up inactive agents every minute
    setInterval(() => this.cleanupInactiveAgents(), 60000);
  }

  register(metadata: AgentMetadata): { success: boolean; agentId: string } {
    if (!metadata.id || !metadata.name || !metadata.walletAddress) {
      throw new Error('Missing required fields: id, name, walletAddress');
    }

    const agent: AgentMetadata = {
      ...metadata,
      createdAt: metadata.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      status: 'active',
    };

    this.agents.set(metadata.id, agent);
    console.log(`✅ Registered agent: ${metadata.name} (${metadata.id})`);
    
    return { success: true, agentId: metadata.id };
  }

  discover(query?: {
    tags?: string[];
    capability?: string;
    name?: string;
  }): AgentMetadata[] {
    let results = Array.from(this.agents.values());

    // Filter by status (only active agents)
    results = results.filter(agent => agent.status === 'active');

    if (query?.tags && query.tags.length > 0) {
      results = results.filter(agent =>
        agent.tags?.some(tag => query.tags!.includes(tag))
      );
    }

    if (query?.capability) {
      results = results.filter(agent =>
        agent.capabilities.some(cap => 
          cap.name.toLowerCase().includes(query.capability!.toLowerCase())
        )
      );
    }

    if (query?.name) {
      results = results.filter(agent =>
        agent.name.toLowerCase().includes(query.name!.toLowerCase())
      );
    }

    return results;
  }

  getAgent(agentId: string): AgentMetadata {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    return agent;
  }

  updateAgent(agentId: string, updates: Partial<AgentMetadata>): void {
    const agent = this.getAgent(agentId);
    const updated = {
      ...agent,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.agents.set(agentId, updated);
  }

  deregister(agentId: string): void {
    if (!this.agents.has(agentId)) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    this.agents.delete(agentId);
    console.log(`❌ Deregistered agent: ${agentId}`);
  }

  heartbeat(agentId: string): void {
    const agent = this.getAgent(agentId);
    agent.lastHeartbeat = new Date().toISOString();
    agent.status = 'active';
    this.agents.set(agentId, agent);
  }

  listAll(): AgentMetadata[] {
    return Array.from(this.agents.values());
  }

  getStats() {
    const agents = Array.from(this.agents.values());
    return {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      inactive: agents.filter(a => a.status === 'inactive').length,
      byTag: this.getTagStats(agents),
    };
  }

  private getTagStats(agents: AgentMetadata[]) {
    const stats: Record<string, number> = {};
    agents.forEach(agent => {
      agent.tags?.forEach(tag => {
        stats[tag] = (stats[tag] || 0) + 1;
      });
    });
    return stats;
  }

  private cleanupInactiveAgents(): void {
    const now = Date.now();
    this.agents.forEach((agent, id) => {
      if (agent.lastHeartbeat) {
        const lastBeat = new Date(agent.lastHeartbeat).getTime();
        if (now - lastBeat > this.HEARTBEAT_TIMEOUT) {
          agent.status = 'inactive';
          console.log(`⚠️  Agent marked inactive: ${agent.name} (${id})`);
        }
      }
    });
  }
}

