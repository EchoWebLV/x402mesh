import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RegistryClient } from './registry-client';
import axios from 'axios';

vi.mock('axios');

describe('RegistryClient', () => {
  let client: RegistryClient;
  const mockBaseUrl = 'http://localhost:3001';

  beforeEach(() => {
    client = new RegistryClient(mockBaseUrl);
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should register an agent successfully', async () => {
      const metadata = {
        id: 'test-agent-1',
        name: 'Test Agent',
        description: 'A test agent',
        version: '1.0.0',
        capabilities: [],
        endpoint: 'http://localhost:3100',
        walletAddress: 'testWallet123'
      };

      const mockResponse = { data: { success: true, agentId: 'test-agent-1' } };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await client.register(metadata);

      expect(axios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/agents/register`,
        metadata
      );
      expect(result).toEqual({ success: true, agentId: 'test-agent-1' });
    });
  });

  describe('discover', () => {
    it('should discover agents with capability filter', async () => {
      const mockAgents = [
        { id: '1', name: 'Agent 1', capabilities: [{ name: 'translate' }] }
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockAgents });

      const result = await client.discover({ capability: 'translate' });

      expect(axios.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/agents/discover`,
        { params: { capability: 'translate' } }
      );
      expect(result).toEqual(mockAgents);
    });

    it('should discover agents with tags filter', async () => {
      const mockAgents = [
        { id: '1', name: 'Agent 1', tags: ['nlp'] }
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockAgents });

      const result = await client.discover({ tags: ['nlp', 'translation'] });

      expect(axios.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/agents/discover`,
        { params: { tags: ['nlp', 'translation'] } }
      );
      expect(result).toEqual(mockAgents);
    });

    it('should discover all agents when no query provided', async () => {
      const mockAgents = [
        { id: '1', name: 'Agent 1' },
        { id: '2', name: 'Agent 2' }
      ];
      vi.mocked(axios.get).mockResolvedValue({ data: mockAgents });

      const result = await client.discover();

      expect(axios.get).toHaveBeenCalledWith(
        `${mockBaseUrl}/agents/discover`,
        { params: undefined }
      );
      expect(result).toEqual(mockAgents);
    });
  });

  describe('getAgent', () => {
    it('should get specific agent by ID', async () => {
      const mockAgent = { id: 'test-1', name: 'Test Agent' };
      vi.mocked(axios.get).mockResolvedValue({ data: mockAgent });

      const result = await client.getAgent('test-1');

      expect(axios.get).toHaveBeenCalledWith(`${mockBaseUrl}/agents/test-1`);
      expect(result).toEqual(mockAgent);
    });
  });

  describe('heartbeat', () => {
    it('should send heartbeat successfully', async () => {
      vi.mocked(axios.post).mockResolvedValue({ data: { success: true } });

      const result = await client.heartbeat('test-agent-1');

      expect(axios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/agents/test-agent-1/heartbeat`
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('deregister', () => {
    it('should deregister agent successfully', async () => {
      vi.mocked(axios.delete).mockResolvedValue({ data: { success: true } });

      const result = await client.deregister('test-agent-1');

      expect(axios.delete).toHaveBeenCalledWith(
        `${mockBaseUrl}/agents/test-agent-1`
      );
      expect(result).toEqual({ success: true });
    });
  });
});

