import axios from 'axios';
import { AgentMetadata } from './types.js';

export class RegistryClient {
  private baseUrl: string;

  constructor(registryUrl: string = 'http://localhost:3001') {
    this.baseUrl = registryUrl;
  }

  async register(metadata: AgentMetadata): Promise<{ success: boolean; agentId: string }> {
    const response = await axios.post(`${this.baseUrl}/agents/register`, metadata);
    return response.data;
  }

  async discover(query?: { tags?: string[]; capability?: string; name?: string }): Promise<AgentMetadata[]> {
    const response = await axios.get(`${this.baseUrl}/agents/discover`, { params: query });
    return response.data;
  }

  async getAgent(agentId: string): Promise<AgentMetadata> {
    const response = await axios.get(`${this.baseUrl}/agents/${agentId}`);
    return response.data;
  }

  async updateAgent(agentId: string, updates: Partial<AgentMetadata>): Promise<{ success: boolean }> {
    const response = await axios.put(`${this.baseUrl}/agents/${agentId}`, updates);
    return response.data;
  }

  async deregister(agentId: string): Promise<{ success: boolean }> {
    const response = await axios.delete(`${this.baseUrl}/agents/${agentId}`);
    return response.data;
  }

  async heartbeat(agentId: string): Promise<{ success: boolean }> {
    const response = await axios.post(`${this.baseUrl}/agents/${agentId}/heartbeat`);
    return response.data;
  }
}

