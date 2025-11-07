import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentRouter } from './payment-router.js';

describe('Health Check and Refund Integration', () => {
  let router: PaymentRouter;

  beforeEach(() => {
    router = new PaymentRouter(false);
  });

  it('should automatically refund if agent execution fails', async () => {
    // Process payment
    const payment = await router.processPayment({
      from: 'UserWallet123',
      to: 'AgentWallet456',
      amount: 0.01,
      currency: 'SOL',
      serviceId: 'translate',
    });

    // Simulate agent failure and refund
    const refund = await router.refundPayment(payment.transactionId, 'Agent execution failed');

    expect(refund.status).toBe('completed');
    expect(refund.from).toBe('AgentWallet456');
    expect(refund.to).toBe('UserWallet123');
    
    // Verify refund is tracked
    const refundRecord = router.getPayment(refund.transactionId);
    expect(refundRecord).toBeDefined();
  });

  it('should track refund metadata', async () => {
    const payment = await router.processPayment({
      from: 'UserWallet123',
      to: 'AgentWallet456',
      amount: 0.01,
      currency: 'SOL',
      serviceId: 'translate',
    });

    const refund = await router.refundPayment(
      payment.transactionId, 
      'Chain execution failed at step 2'
    );

    // Metadata should indicate it's a refund
    const refundRecord = router.getPayment(refund.transactionId);
    expect(refundRecord.serviceId).toContain('refund');
  });

  it('should maintain correct balance after refund', async () => {
    const initialStats = router.getStats();

    // Payment
    const payment = await router.processPayment({
      from: 'UserWallet123',
      to: 'AgentWallet456',
      amount: 0.05,
      currency: 'SOL',
      serviceId: 'test',
    });

    // Refund
    await router.refundPayment(payment.transactionId, 'Test refund');

    const finalStats = router.getStats();
    
    // Total processed should include both payment and refund
    expect(finalStats.totalProcessed).toBe(initialStats.totalProcessed + 2);
  });
});

