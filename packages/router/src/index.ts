import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PaymentRouter } from './payment-router.js';
import axios from 'axios';

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

// Process a payment with x402 headers
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

// Get payment status
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
  try {
    const startTime = Date.now();
    const { chain, paymentSource } = req.body;
    
    const results = [];
    const payments = [];
    let totalCost = 0;

    // Execute each agent in the chain
    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      
      // Get agent info from registry
      const agentResponse = await axios.get(`${REGISTRY_URL}/agents/${step.agentId}`);
      const agent = agentResponse.data;
      
      // Find the capability pricing
      const capability = agent.capabilities.find((c: any) => c.name === step.capability);
      if (!capability) {
        throw new Error(`Capability ${step.capability} not found on agent ${agent.name}`);
      }
      
      // Process payment
      const payment = await router.processPayment({
        from: paymentSource,
        to: agent.walletAddress,
        amount: capability.pricing.amount,
        currency: capability.pricing.currency,
        serviceId: step.capability,
        metadata: { step: i, chain: true },
      });
      
      payments.push(payment);
      totalCost += capability.pricing.amount;
      
      // Call the agent (simulated for demo - in production would call actual endpoint)
      const input: any = i === 0 ? step.input : results[i - 1];
      
      try {
        const response: any = await axios.post(`${agent.endpoint}/execute`, {
          capability: step.capability,
          input,
          payment,
        }, { timeout: 10000 });
        
        results.push(response.data.data);
      } catch (error) {
        // If agent endpoint not available, simulate response
        console.log(`Agent ${agent.name} endpoint not available, using simulated response`);
        results.push(input);
      }
    }
    
    const executionTime = Date.now() - startTime;
    
    res.json({
      results,
      totalCost,
      payments,
      executionTime,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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

// Get payment history
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

