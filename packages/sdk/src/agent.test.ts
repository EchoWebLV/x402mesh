import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Agent } from './agent';
import { AgentCapability } from './types';

// Mock Agent implementation for testing
class TestAgent extends Agent {
  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'test_capability') {
      return { result: 'test_output', input };
    }
    throw new Error(`Unknown capability: ${capability}`);
  }
}

describe('Agent Base Class', () => {
  let agent: TestAgent;

  beforeEach(() => {
    const capabilities: AgentCapability[] = [
      {
        name: 'test_capability',
        description: 'Test capability',
        inputSchema: { data: 'string' },
        outputSchema: { result: 'string' },
        pricing: {
          amount: 0.01,
          currency: 'SOL',
          model: 'per_request'
        }
      }
    ];

    agent = new TestAgent({
      name: 'Test Agent',
      description: 'Agent for testing',
      version: '1.0.0',
      capabilities,
      walletAddress: 'TestWallet123',
      port: 4000,
      tags: ['test', 'demo']
    });
  });

  describe('constructor', () => {
    it('should create agent with correct metadata', () => {
      const metadata = agent.getMetadata();

      expect(metadata.name).toBe('Test Agent');
      expect(metadata.description).toBe('Agent for testing');
      expect(metadata.version).toBe('1.0.0');
      expect(metadata.walletAddress).toBe('TestWallet123');
      expect(metadata.endpoint).toBe('http://localhost:4000');
      expect(metadata.tags).toEqual(['test', 'demo']);
      expect(metadata.capabilities).toHaveLength(1);
    });

    it('should generate unique agent ID', () => {
      const id1 = agent.getId();
      const agent2 = new TestAgent({
        name: 'Test Agent',
        description: 'Another test',
        version: '1.0.0',
        capabilities: [],
        walletAddress: 'wallet2',
        port: 4001
      });
      const id2 = agent2.getId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^agent-test-agent-\d+$/);
    });
  });

  describe('execute', () => {
    it('should execute known capability', async () => {
      const result = await agent.execute('test_capability', { data: 'test' });

      expect(result).toEqual({
        result: 'test_output',
        input: { data: 'test' }
      });
    });

    it('should throw error for unknown capability', async () => {
      await expect(
        agent.execute('unknown_capability', {})
      ).rejects.toThrow('Unknown capability: unknown_capability');
    });
  });

  describe('getMetadata', () => {
    it('should return complete metadata object', () => {
      const metadata = agent.getMetadata();

      expect(metadata).toHaveProperty('id');
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('version');
      expect(metadata).toHaveProperty('capabilities');
      expect(metadata).toHaveProperty('endpoint');
      expect(metadata).toHaveProperty('walletAddress');
      expect(metadata).toHaveProperty('tags');
      expect(metadata).toHaveProperty('createdAt');
    });
  });

  describe('getId', () => {
    it('should return agent ID', () => {
      const id = agent.getId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
    });
  });
});

