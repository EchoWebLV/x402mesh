# 📚 API Documentation

## Agent Discovery Registry

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Register Agent
```http
POST /agents/register
Content-Type: application/json

{
  "id": "agent-unique-id",
  "name": "My Agent",
  "description": "Does cool things",
  "version": "1.0.0",
  "capabilities": [
    {
      "name": "capability_name",
      "description": "What it does",
      "inputSchema": {},
      "outputSchema": {},
      "pricing": {
        "amount": 0.01,
        "currency": "USDC",
        "model": "per_request"
      }
    }
  ],
  "endpoint": "http://localhost:3100",
  "walletAddress": "SolanaWalletAddress",
  "tags": ["tag1", "tag2"]
}
```

**Response:**
```json
{
  "success": true,
  "agentId": "agent-unique-id"
}
```

#### Discover Agents
```http
GET /agents/discover?tags=translation&capability=translate&name=translator
```

**Query Parameters:**
- `tags` (optional): Comma-separated tags
- `capability` (optional): Capability name to search for
- `name` (optional): Agent name to search for

**Response:**
```json
[
  {
    "id": "agent-id",
    "name": "Translator Agent",
    "description": "Translates text",
    "capabilities": [...],
    "endpoint": "http://localhost:3100",
    "walletAddress": "...",
    "status": "active"
  }
]
```

#### Get Agent Details
```http
GET /agents/:agentId
```

**Response:**
```json
{
  "id": "agent-id",
  "name": "Agent Name",
  "description": "...",
  "capabilities": [...],
  "endpoint": "http://localhost:3100",
  "walletAddress": "...",
  "status": "active",
  "lastHeartbeat": "2025-11-06T12:00:00Z"
}
```

#### Update Agent
```http
PUT /agents/:agentId
Content-Type: application/json

{
  "description": "Updated description",
  "capabilities": [...]
}
```

#### Deregister Agent
```http
DELETE /agents/:agentId
```

#### Send Heartbeat
```http
POST /agents/:agentId/heartbeat
```

#### List All Agents
```http
GET /agents
```

#### Get Registry Stats
```http
GET /stats
```

**Response:**
```json
{
  "total": 10,
  "active": 8,
  "inactive": 2,
  "byTag": {
    "translation": 2,
    "summarization": 1,
    "analysis": 1
  }
}
```

---

## Payment Router

### Base URL
```
http://localhost:3002
```

### Endpoints

#### Process Payment
```http
POST /payments/process
Content-Type: application/json

{
  "from": "SourceWalletAddress",
  "to": "DestinationWalletAddress",
  "amount": 0.01,
  "currency": "USDC",
  "serviceId": "capability_name",
  "metadata": {
    "custom": "data"
  }
}
```

**Response:**
```json
{
  "transactionId": "tx-123456789",
  "status": "completed",
  "amount": 0.01,
  "currency": "USDC",
  "timestamp": "2025-11-06T12:00:00Z",
  "from": "...",
  "to": "...",
  "serviceId": "capability_name"
}
```

#### Execute Agent Chain
```http
POST /payments/chain
Content-Type: application/json

{
  "paymentSource": "YourWalletAddress",
  "chain": [
    {
      "agentId": "agent-1-id",
      "capability": "translate",
      "input": {
        "text": "Hello",
        "targetLanguage": "spanish"
      }
    },
    {
      "agentId": "agent-2-id",
      "capability": "summarize",
      "input": {}
    }
  ]
}
```

**Response:**
```json
{
  "results": [
    { "translatedText": "Hola", ... },
    { "summary": ["..."], ... }
  ],
  "totalCost": 0.03,
  "payments": [
    {
      "transactionId": "tx-1",
      "status": "completed",
      "amount": 0.01,
      "currency": "USDC"
    },
    {
      "transactionId": "tx-2",
      "status": "completed",
      "amount": 0.02,
      "currency": "USDC"
    }
  ],
  "executionTime": 1234
}
```

#### Split Payment
```http
POST /payments/split
Content-Type: application/json

{
  "payment": {
    "from": "SourceWallet",
    "to": "N/A",
    "amount": 1.0,
    "currency": "USDC",
    "serviceId": "multi-agent-service"
  },
  "splits": [
    { "agentId": "agent-1", "percentage": 50 },
    { "agentId": "agent-2", "percentage": 30 },
    { "agentId": "agent-3", "percentage": 20 }
  ]
}
```

**Response:**
```json
[
  {
    "transactionId": "tx-1",
    "status": "completed",
    "amount": 0.50,
    "currency": "USDC"
  },
  {
    "transactionId": "tx-2",
    "status": "completed",
    "amount": 0.30,
    "currency": "USDC"
  },
  {
    "transactionId": "tx-3",
    "status": "completed",
    "amount": 0.20,
    "currency": "USDC"
  }
]
```

#### Get Payment Status
```http
GET /payments/:transactionId
```

#### Get Payment History
```http
GET /payments
```

#### Get Router Stats
```http
GET /stats
```

**Response:**
```json
{
  "totalProcessed": 150,
  "totalVolume": 5.25,
  "successful": 148,
  "failed": 2,
  "pending": 0
}
```

---

## Agent Endpoints

Each agent should implement these endpoints:

### Execute Capability
```http
POST /execute
Content-Type: application/json

{
  "agentId": "calling-agent-id",
  "capability": "capability_name",
  "input": {
    "param1": "value1"
  },
  "payment": {
    "transactionId": "tx-123",
    "status": "completed",
    "amount": 0.01
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": "..."
  },
  "payment": {
    "transactionId": "tx-123",
    ...
  }
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "agent": "Agent Name"
}
```

---

## SDK Usage

### TypeScript/JavaScript

```typescript
import { 
  Agent, 
  RegistryClient, 
  PaymentClient 
} from '@x402mesh/sdk';

// Registry Client
const registry = new RegistryClient('http://localhost:3001');

// Discover agents
const agents = await registry.discover({ 
  tags: ['translation'] 
});

// Get agent details
const agent = await registry.getAgent('agent-id');

// Payment Client
const paymentClient = new PaymentClient('http://localhost:3002');

// Process payment
const payment = await paymentClient.processPayment({
  from: 'wallet1',
  to: 'wallet2',
  amount: 0.01,
  currency: 'USDC',
  serviceId: 'translate',
});

// Execute chain
const result = await paymentClient.executeChain({
  paymentSource: 'wallet',
  chain: [
    { agentId: 'agent-1', capability: 'translate', input: {...} },
    { agentId: 'agent-2', capability: 'summarize', input: {} },
  ],
});
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found (agent/payment not found)
- `500` - Internal Server Error

---

## Rate Limits

Currently no rate limits in demo version. Production deployment should implement:
- Registry: 100 requests/minute per IP
- Router: 1000 payments/minute per wallet
- Agents: Set by individual agent operators

---

## Authentication

Demo version uses public endpoints. Production should implement:
- API keys for registry access
- Wallet signature verification
- x402 payment authentication headers

---

## Need Help?

- Check [Getting Started Guide](./GETTING_STARTED.md)
- Review [Example Agents](../demo/agents/)
- Open an issue on GitHub

