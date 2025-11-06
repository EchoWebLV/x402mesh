# 🚀 Getting Started

## Installation

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/agent-2-agent-infra.git
cd agent-2-agent-infra
npm install
npm run build
```

### 2. Run the Demo

**Quick Start** - See agents in action:
```bash
npm run demo:chain
```

This will:
1. Start the Registry service (port 3001)
2. Start the Payment Router (port 3002)
3. Start 3 demo agents (ports 3100-3102)
4. Run 3 demo scenarios showing agent interactions
5. Display real-time payments and results

## Building Your First Agent

### Step 1: Create Your Agent

```typescript
// my-agent.ts
import { Agent, AgentCapability } from '@a2a/sdk';
import express from 'express';

class WeatherAgent extends Agent {
  private app: express.Application;

  constructor() {
    const capabilities: AgentCapability[] = [
      {
        name: 'get_weather',
        description: 'Get current weather for a location',
        inputSchema: { location: 'string' },
        outputSchema: { temperature: 'number', conditions: 'string' },
        pricing: {
          amount: 0.005,
          currency: 'USDC',
          model: 'per_request',
        },
      },
    ];

    super({
      name: 'Weather Agent',
      description: 'Provides weather information',
      version: '1.0.0',
      capabilities,
      walletAddress: 'YOUR_SOLANA_WALLET_ADDRESS',
      port: 3200,
      tags: ['weather', 'data'],
    });

    this.app = express();
    this.app.use(express.json());
    this.setupEndpoints();
  }

  private setupEndpoints() {
    this.app.post('/execute', async (req, res) => {
      const { capability, input, payment } = req.body;
      
      try {
        const result = await this.execute(capability, input);
        res.json({ success: true, data: result, payment });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    this.app.get('/health', (req, res) => {
      res.json({ status: 'healthy', agent: this.metadata.name });
    });
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'get_weather') {
      // Your implementation here
      return {
        temperature: 72,
        conditions: 'Sunny',
        location: input.location,
      };
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  async startServer() {
    await this.start(); // Register with registry
    this.app.listen(3200, () => {
      console.log('Weather Agent running on port 3200');
    });
  }
}

const agent = new WeatherAgent();
agent.startServer();
```

### Step 2: Run Your Agent

Make sure the Registry and Router are running:

```bash
# Terminal 1: Registry
npm run dev -w @a2a/registry

# Terminal 2: Router
npm run dev -w @a2a/router

# Terminal 3: Your agent
npx tsx my-agent.ts
```

### Step 3: Call Your Agent

```typescript
import { RegistryClient, PaymentClient } from '@a2a/sdk';

const registry = new RegistryClient('http://localhost:3001');
const paymentRouter = new PaymentClient('http://localhost:3002');

// Find your agent
const agents = await registry.discover({ tags: ['weather'] });
const weatherAgent = agents[0];

// Process payment
const payment = await paymentRouter.processPayment({
  from: 'YOUR_WALLET',
  to: weatherAgent.walletAddress,
  amount: 0.005,
  currency: 'USDC',
  serviceId: 'get_weather',
});

// Call the agent
const response = await axios.post(`${weatherAgent.endpoint}/execute`, {
  capability: 'get_weather',
  input: { location: 'San Francisco' },
  payment,
});

console.log(response.data);
```

## Agent Chaining

Combine multiple agents into a workflow:

```typescript
const chainResponse = await paymentRouter.executeChain({
  paymentSource: 'YOUR_WALLET',
  chain: [
    {
      agentId: 'weather-agent-id',
      capability: 'get_weather',
      input: { location: 'NYC' },
    },
    {
      agentId: 'translator-agent-id',
      capability: 'translate',
      input: {}, // Receives weather data
    },
    {
      agentId: 'summarizer-agent-id',
      capability: 'summarize',
      input: {}, // Receives translated weather
    },
  ],
});

// Chain results
console.log('Results:', chainResponse.results);
console.log('Total Cost:', chainResponse.totalCost);
console.log('Time:', chainResponse.executionTime, 'ms');
```

## Payment Models

Your agent can use different pricing models:

### Per Request
```typescript
pricing: {
  amount: 0.01,
  currency: 'USDC',
  model: 'per_request',
}
```

### Per Token (for LLMs)
```typescript
pricing: {
  amount: 0.00001,
  currency: 'USDC',
  model: 'per_token',
}
```

### Per Minute (for streaming)
```typescript
pricing: {
  amount: 0.05,
  currency: 'USDC',
  model: 'per_minute',
}
```

## Best Practices

### 1. Error Handling
```typescript
async execute(capability: string, input: any) {
  try {
    // Validate input
    if (!input.location) {
      throw new Error('Location is required');
    }
    
    // Process
    const result = await this.processWeather(input.location);
    
    return result;
  } catch (error) {
    console.error('Execution failed:', error);
    throw error;
  }
}
```

### 2. Heartbeat
The SDK automatically sends heartbeats every 30 seconds. Make sure your agent stays running!

### 3. Graceful Shutdown
```typescript
process.on('SIGINT', async () => {
  await agent.stop(); // Deregister from registry
  process.exit(0);
});
```

### 4. Testing
```typescript
// Test your agent locally
const result = await agent.execute('get_weather', { 
  location: 'Test City' 
});
console.log('Test result:', result);
```

## Next Steps

- 📖 Read the [API Documentation](./API.md)
- 🏗️ Check out [Architecture Guide](./ARCHITECTURE.md)
- 💡 See [Example Agents](../demo/agents/)
- 🎯 Review [Hackathon Checklist](./HACKATHON_CHECKLIST.md)

## Troubleshooting

### Agent not registering
- Ensure Registry is running on port 3001
- Check wallet address is valid
- Verify no port conflicts

### Payments failing
- Ensure Router is running on port 3002
- Check payment amounts are positive
- Verify wallet addresses

### Agent not found
- Check agent sent heartbeat recently
- Verify agent registered successfully
- Search by correct tags/capabilities

Need help? Open an issue on GitHub!

