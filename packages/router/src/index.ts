import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PaymentRouter } from './payment-router.js';
import { verifyPaymentOnChain } from './signature-verifier.js';
import axios from 'axios';
import { Connection } from '@solana/web3.js';

const app = express();
// Enable real Solana transactions with REAL_TRANSACTIONS=true environment variable
const useRealTransactions = process.env.REAL_TRANSACTIONS === 'true';
const router = new PaymentRouter(useRealTransactions);
const PORT = process.env.ROUTER_PORT || 3002;
const REGISTRY_URL = process.env.REGISTRY_URL || 'http://localhost:3001';

if (useRealTransactions) {
  console.log('⚡ REAL SOLANA TRANSACTIONS ENABLED - Using devnet');
} else {
  console.log('🎭 Demo mode - Using simulated transactions (set REAL_TRANSACTIONS=true for real Solana)');
}

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'payment-router' });
});

// Submit a signed transaction and verify payment
app.post('/payments/submit', async (req, res) => {
  try {
    const { signedTransaction, from, to, amount, currency, serviceId } = req.body;
    
    if (!signedTransaction) {
      return res.status(400).json({ error: 'Signed transaction required' });
    }
    
    // Submit transaction to Solana
    const connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    const signature = await connection.sendRawTransaction(
      Buffer.from(signedTransaction, 'base64'),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );
    
    // Wait for confirmation
    await connection.confirmTransaction(signature, 'confirmed');
    
    // Verify the payment on-chain
    const verified = await verifyPaymentOnChain({
      signature,
      from,
      to,
      amount,
      currency,
    });
    
    if (!verified) {
      return res.status(400).json({
        error: 'Payment verification failed - transaction does not match claimed amounts',
        signature,
      });
    }
    
    // Create payment record
    const payment = {
      transactionId: signature,
      signature,
      status: 'completed',
      amount,
      currency,
      from,
      to,
      serviceId,
      timestamp: new Date().toISOString(),
      explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
      verified: true,
      onChain: true,
    };
    
    // x402 headers
    res.setHeader('X-Payment-Received', 'true');
    res.setHeader('X-Payment-Status', 'completed');
    res.setHeader('X-Solana-Signature', signature);
    res.setHeader('X-Explorer-Url', payment.explorerUrl);
    
    res.json(payment);
  } catch (error: any) {
    console.error('Payment submission failed:', error);
    res.status(402).json({ 
      error: error.message,
      paymentRequired: true 
    });
  }
});

// Process a payment with x402 headers (legacy - for backward compat)
app.post('/payments/process', async (req, res) => {
  try {
    const result = await router.processPayment(req.body);
    
    // x402 Payment Required headers
    res.setHeader('X-Payment-Required', 'true');
    res.setHeader('X-Payment-Status', result.status);
    res.setHeader('X-Payment-Amount', result.amount.toString());
    res.setHeader('X-Payment-Currency', result.currency);
    if (result.signature) {
      res.setHeader('X-Solana-Signature', result.signature);
      res.setHeader('X-Explorer-Url', result.explorerUrl || '');
    }
    
    res.json(result);
  } catch (error: any) {
    // Return 402 Payment Required on failure
    res.status(402).json({ 
      error: error.message,
      paymentRequired: true 
    });
  }
});

// Get payment history - MUST come before /payments/:transactionId
app.get('/payments/history', (req, res) => {
  const history = router.getPaymentHistory();
  res.json(history);
});

// Get payment status - MUST come after specific routes like /payments/history
app.get('/payments/:transactionId', (req, res) => {
  try {
    const payment = router.getPayment(req.params.transactionId);
    res.json(payment);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Execute a chain of agent calls with automatic payment routing
app.post('/payments/chain', async (req, res) => {
  const startTime = Date.now();
  const { chain, paymentSource, signatures } = req.body;
  const realTransactions = router.isRealTransactionsEnabled();
  
  const results = [];
  const payments = [];
  const completedPayments: any[] = [];
  let totalCost = 0;
  let rollbackNeeded = false;
  const chainId = Date.now();

  try {
    // Execute each agent in the chain
    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      
      // Get agent info from registry
      const agentResponse = await axios.get(`${REGISTRY_URL}/agents/${step.agentId}`);
      const agent = agentResponse.data;
      
      // Find the capability pricing
      const capability = agent.capabilities.find((c: any) => c.name === step.capability);
      if (!capability) {
        rollbackNeeded = true;
        throw new Error(`Capability ${step.capability} not found on agent ${agent.name}`);
      }

      // Health check before payment
      console.log(`   🏥 Checking health of ${agent.name}...`);
      try {
        const healthCheck = await axios.get(`${agent.endpoint}/health`, { 
          timeout: 3000,
          validateStatus: (status) => status === 200
        });
        
        if (healthCheck.data.status !== 'healthy') {
          throw new Error('Agent health check failed');
        }
        console.log(`   ✅ ${agent.name} is healthy`);
      } catch (healthError: any) {
        rollbackNeeded = false; // No payments made yet, no rollback needed
        throw new Error(`Agent ${agent.name} is unavailable (health check failed: ${healthError.message}). Payment not processed.`);
      }

      const signatureForStep = Array.isArray(signatures) ? signatures[i] : undefined;
      if (realTransactions && !signatureForStep) {
        rollbackNeeded = true;
        throw new Error(`Transaction signature required for step ${i + 1} when REAL_TRANSACTIONS=true`);
      }
      
      // Process payment (only after health check passes)
      const payment = await router.processPayment({
        from: paymentSource,
        to: agent.walletAddress,
        amount: capability.pricing.amount,
        currency: capability.pricing.currency,
        serviceId: step.capability,
        metadata: { step: i, chain: true, chainId },
        transactionSignature: signatureForStep,
      });
      
      payments.push(payment);
      completedPayments.push({ payment, agent });
      totalCost += capability.pricing.amount;
      
      // Call the agent
      const input: any = i === 0 ? step.input : results[i - 1];
      
      try {
        const response: any = await axios.post(`${agent.endpoint}/execute`, {
          capability: step.capability,
          input,
          payment,
        }, { timeout: 10000 });
        
        // Check if agent returned success
        if (!response.data.success) {
          rollbackNeeded = true;
          throw new Error(`Agent ${agent.name} execution failed: ${response.data.error}`);
        }
        
        results.push(response.data.data);
      } catch (error: any) {
        // Agent execution failed - need rollback
        rollbackNeeded = true;
        console.error(`Agent ${agent.name} failed:`, error.message);
        throw new Error(`Chain failed at step ${i + 1} (${agent.name}): ${error.message}`);
      }
    }
    
    const executionTime = Date.now() - startTime;
    
    res.json({
      results,
      totalCost,
      payments,
      executionTime,
      status: 'success',
    });
  } catch (error: any) {
    // Chain failed - attempt rollback
    if (rollbackNeeded && completedPayments.length > 0) {
      console.log(`\n⚠️  Chain failed - initiating payment rollback for ${completedPayments.length} payments...`);
      
      const rollbacks = [];
      for (const { payment, agent } of completedPayments) {
        try {
          // Automatically refund the payment
          console.log(`   🔄 Refunding ${payment.amount} ${payment.currency} from ${agent.name}`);
          
          if (realTransactions) {
            console.log(`   ℹ️  Real transaction refund requires new on-chain payment (manual process)`);
            rollbacks.push({
              originalPayment: payment.transactionId,
              amount: payment.amount,
              status: 'refund_required',
              note: 'Agent execution failed - manual refund needed',
              signature: payment.signature,
            });
          } else {
            // For simulated transactions, execute actual refund
            const refund = await router.refundPayment(payment.transactionId, 'Chain execution failed');
            rollbacks.push({
              originalPayment: payment.transactionId,
              refundPayment: refund.transactionId,
              amount: payment.amount,
              status: 'refunded',
              note: 'Chain execution failed - payment refunded',
            });
          }
        } catch (rollbackError) {
          console.error(`   ❌ Failed to rollback payment to ${agent.name}:`, rollbackError);
          rollbacks.push({
            originalPayment: payment.transactionId,
            amount: payment.amount,
            status: 'refund_failed',
            error: rollbackError instanceof Error ? rollbackError.message : 'Unknown error',
          });
        }
      }
      
      res.status(400).json({ 
        error: error.message,
        status: 'failed',
        rollback: {
          attempted: true,
          refunds: rollbacks,
          totalRefunded: rollbacks.reduce((sum, r) => sum + r.amount, 0),
        },
        partialResults: results,
        completedSteps: results.length,
        totalSteps: chain.length,
      });
    } else {
      res.status(400).json({ error: error.message, status: 'failed' });
    }
  }
});

// Split payment among multiple agents
app.post('/payments/split', async (req, res) => {
  try {
    const { payment, splits } = req.body;
    const results = await router.splitPayment(payment, splits);
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all payments
app.get('/payments', (req, res) => {
  const history = router.getPaymentHistory();
  res.json(history);
});

// Get router stats
app.get('/stats', (req, res) => {
  const stats = router.getStats();
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🚀 Payment Router running on http://localhost:${PORT}`);
});

