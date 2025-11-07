import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentRouter } from './payment-router.js';

describe('PaymentRouter', () => {
  let router: PaymentRouter;

  beforeEach(() => {
    router = new PaymentRouter(false); // Use simulated transactions for tests
  });

  describe('processPayment', () => {
    it('should process a valid payment', async () => {
      const payment = await router.processPayment({
        from: 'UserWallet123',
        to: 'AgentWallet456',
        amount: 0.01,
        currency: 'SOL',
        serviceId: 'translate',
      });

      expect(payment.status).toBe('completed');
      expect(payment.amount).toBe(0.01);
      expect(payment.currency).toBe('SOL');
      expect(payment.transactionId).toBeDefined();
    });

    it('should track payment in history', async () => {
      const payment = await router.processPayment({
        from: 'UserWallet123',
        to: 'AgentWallet456',
        amount: 0.01,
        currency: 'SOL',
        serviceId: 'translate',
      });

      const retrieved = router.getPayment(payment.transactionId);
      expect(retrieved.transactionId).toBe(payment.transactionId);
      expect(retrieved.status).toBe('completed');
    });

    it('should update router stats', async () => {
      await router.processPayment({
        from: 'UserWallet123',
        to: 'AgentWallet456',
        amount: 0.01,
        currency: 'SOL',
        serviceId: 'translate',
      });

      const stats = router.getStats();
      expect(stats.totalProcessed).toBeGreaterThan(0);
      expect(stats.successful).toBeGreaterThan(0);
      expect(stats.totalVolume).toBeGreaterThan(0);
    });
  });

  describe('refundPayment', () => {
    it('should refund a completed payment', async () => {
      const originalPayment = await router.processPayment({
        from: 'UserWallet123',
        to: 'AgentWallet456',
        amount: 0.01,
        currency: 'SOL',
        serviceId: 'translate',
      });

      const refund = await router.refundPayment(
        originalPayment.transactionId,
        'Agent execution failed'
      );

      expect(refund.status).toBe('completed');
      expect(refund.amount).toBe(originalPayment.amount);
      expect(refund.from).toBe(originalPayment.to);
      expect(refund.to).toBe(originalPayment.from);
    });

    it('should fail to refund non-existent payment', async () => {
      await expect(
        router.refundPayment('non-existent-tx', 'Test')
      ).rejects.toThrow('Payment not found');
    });

    it('should fail to refund pending payment', async () => {
      const payment = await router.processPayment({
        from: 'UserWallet123',
        to: 'AgentWallet456',
        amount: 0.01,
        currency: 'SOL',
        serviceId: 'translate',
      });

      // Manually set to pending
      (router as any).payments.get(payment.transactionId).status = 'pending';

      await expect(
        router.refundPayment(payment.transactionId, 'Test')
      ).rejects.toThrow('Can only refund completed payments');
    });
  });

  describe('splitPayment', () => {
    it('should split payment among multiple recipients', async () => {
      const results = await router.splitPayment(
        {
          from: 'UserWallet123',
          to: 'RouterWallet',
          amount: 0.1,
          currency: 'SOL',
          serviceId: 'chain',
        },
        [
          { agentId: 'agent1', percentage: 50 },
          { agentId: 'agent2', percentage: 30 },
          { agentId: 'agent3', percentage: 20 },
        ]
      );

      expect(results).toHaveLength(3);
      expect(results[0].amount).toBe(0.05);
      expect(results[1].amount).toBe(0.03);
      expect(results[2].amount).toBe(0.02);
    });

    it('should reject splits that dont sum to 100%', async () => {
      await expect(
        router.splitPayment(
          {
            from: 'UserWallet123',
            to: 'RouterWallet',
            amount: 0.1,
            currency: 'SOL',
            serviceId: 'chain',
          },
          [
            { agentId: 'agent1', percentage: 50 },
            { agentId: 'agent2', percentage: 30 },
          ]
        )
      ).rejects.toThrow('Split percentages must sum to 100');
    });
  });

  describe('getPaymentHistory', () => {
    it('should return payment history', async () => {
      await router.processPayment({
        from: 'UserWallet123',
        to: 'AgentWallet456',
        amount: 0.01,
        currency: 'SOL',
        serviceId: 'test',
      });

      const history = router.getPaymentHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      // Process multiple payments
      for (let i = 0; i < 5; i++) {
        await router.processPayment({
          from: 'UserWallet123',
          to: 'AgentWallet456',
          amount: 0.01,
          currency: 'SOL',
          serviceId: `test-${i}`,
        });
      }

      const history = router.getPaymentHistory(3);
      expect(history.length).toBeLessThanOrEqual(3);
    });
  });

  describe('getStats', () => {
    it('should return accurate statistics', async () => {
      const initialStats = router.getStats();
      
      await router.processPayment({
        from: 'UserWallet123',
        to: 'AgentWallet456',
        amount: 0.05,
        currency: 'SOL',
        serviceId: 'test',
      });

      const newStats = router.getStats();
      expect(newStats.totalProcessed).toBe(initialStats.totalProcessed + 1);
      expect(newStats.successful).toBe(initialStats.successful + 1);
      expect(newStats.totalVolume).toBe(initialStats.totalVolume + 0.05);
    });
  });
});

