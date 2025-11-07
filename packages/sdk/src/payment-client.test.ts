import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PaymentClient } from './payment-client';
import axios from 'axios';

vi.mock('axios');

describe('PaymentClient', () => {
  let client: PaymentClient;
  const mockBaseUrl = 'http://localhost:3002';

  beforeEach(() => {
    client = new PaymentClient(mockBaseUrl);
    vi.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process payment successfully', async () => {
      const paymentRequest = {
        from: 'wallet1',
        to: 'wallet2',
        amount: 0.01,
        currency: 'SOL' as const,
        serviceId: 'test-service'
      };

      const mockResponse = {
        data: {
          transactionId: 'tx-123',
          status: 'completed',
          amount: 0.01,
          currency: 'SOL',
          timestamp: new Date().toISOString()
        }
      };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await client.processPayment(paymentRequest);

      expect(axios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/payments/process`,
        paymentRequest
      );
      expect(result.transactionId).toBe('tx-123');
      expect(result.status).toBe('completed');
    });
  });

  describe('executeChain', () => {
    it('should execute agent chain with payments', async () => {
      const chainRequest = {
        chain: [
          { agentId: 'agent-1', capability: 'translate', input: { text: 'hello' } },
          { agentId: 'agent-2', capability: 'summarize', input: {} }
        ],
        paymentSource: 'user-wallet'
      };

      const mockResponse = {
        data: {
          results: [
            { translatedText: 'hola' },
            { summary: ['Greeting'] }
          ],
          payments: [
            { transactionId: 'tx-1', amount: 0.01 },
            { transactionId: 'tx-2', amount: 0.015 }
          ],
          totalCost: 0.025,
          executionTime: 1234
        }
      };
      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await client.executeChain(chainRequest);

      expect(axios.post).toHaveBeenCalledWith(
        `${mockBaseUrl}/payments/chain`,
        chainRequest
      );
      expect(result.results).toHaveLength(2);
      expect(result.payments).toHaveLength(2);
      expect(result.totalCost).toBe(0.025);
    });
  });

  describe('getPayment', () => {
    it('should retrieve payment by transaction ID', async () => {
      const mockPayment = {
        data: {
          transactionId: 'tx-123',
          status: 'completed',
          amount: 0.01,
          currency: 'SOL',
          timestamp: '2025-11-06T12:00:00Z'
        }
      };
      vi.mocked(axios.get).mockResolvedValue(mockPayment);

      const result = await client.getPayment('tx-123');

      expect(axios.get).toHaveBeenCalledWith(`${mockBaseUrl}/payments/tx-123`);
      expect(result.transactionId).toBe('tx-123');
      expect(result.status).toBe('completed');
    });
  });
});

