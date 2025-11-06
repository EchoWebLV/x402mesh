# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User / Client                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Payment Router (Port 3002)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Process Payments      • Execute Chains                 │  │
│  │ • Split Payments        • Track Transactions             │  │
│  │ • x402 Protocol         • Solana Integration             │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
┌───────────────────────────┐  ┌──────────────────────────────────┐
│ Agent Registry (3001)     │  │   Blockchain (Solana)            │
│ ┌───────────────────────┐ │  │ ┌──────────────────────────────┐ │
│ │ • Register Agents     │ │  │ │ • USDC Transfers             │ │
│ │ • Discover Agents     │ │  │ │ • Transaction History        │ │
│ │ • Heartbeat Monitor   │ │  │ │ • Payment Verification       │ │
│ │ • Capability Search   │ │  │ │ • Wallet Management          │ │
│ └───────────────────────┘ │  │ └──────────────────────────────┘ │
└───────────────────────────┘  └──────────────────────────────────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐  ┌────────┐  ┌────────┐
│ Agent  │  │ Agent  │  │ Agent  │
│   1    │  │   2    │  │   3    │
│ 🌍     │  │ 📝     │  │ 🔍     │
└────────┘  └────────┘  └────────┘
Translator  Summarizer  Analyzer
```

## Core Components

### 1. Agent Discovery Registry

**Purpose**: Central registry for agent discovery and management

**Key Features**:
- Agent registration with capabilities and pricing
- Tag-based and capability-based search
- Heartbeat monitoring for agent health
- Automatic cleanup of inactive agents

**Technology**:
- Express.js REST API
- In-memory storage (production would use PostgreSQL/Redis)
- WebSocket support for real-time updates (optional)

**API Surface**:
```
POST   /agents/register      - Register new agent
GET    /agents/discover      - Find agents
GET    /agents/:id           - Get agent details
PUT    /agents/:id           - Update agent
DELETE /agents/:id           - Deregister agent
POST   /agents/:id/heartbeat - Health check
GET    /stats                - Registry statistics
```

### 2. Payment Router

**Purpose**: Route and process payments between agents

**Key Features**:
- Individual payment processing
- Agent chain execution with automatic payment routing
- Payment splitting across multiple recipients
- x402 protocol implementation
- Transaction history and tracking

**Technology**:
- Express.js REST API
- Solana Web3.js for blockchain integration
- Axios for agent communication
- Transaction queue for reliability

**API Surface**:
```
POST   /payments/process     - Process single payment
POST   /payments/chain       - Execute agent chain
POST   /payments/split       - Split payment
GET    /payments/:id         - Payment status
GET    /payments             - Payment history
GET    /stats                - Router statistics
```

### 3. Agent SDK

**Purpose**: Developer toolkit for building payment-enabled agents

**Key Features**:
- Base `Agent` class for inheritance
- Automatic registration with discovery registry
- Built-in payment client integration
- Heartbeat management
- Agent-to-agent communication helpers

**Usage Pattern**:
```typescript
class MyAgent extends Agent {
  constructor() {
    super({
      name: 'My Agent',
      capabilities: [...],
      walletAddress: '...',
      port: 3100,
    });
  }
  
  async execute(capability, input) {
    // Your logic here
  }
}
```

## Data Flow

### Simple Agent Call

```
1. Client → Payment Router: "Pay Agent A $0.01"
2. Payment Router → Solana: Process transaction
3. Payment Router → Client: Transaction ID
4. Client → Agent A: Call with payment proof
5. Agent A → Client: Result + payment confirmation
```

### Agent Chain Execution

```
1. Client → Payment Router: "Execute chain [A, B, C]"
2. Payment Router → Registry: Get agent details
3. Payment Router → Solana: Pay Agent A
4. Payment Router → Agent A: Execute with payment
5. Agent A → Payment Router: Result 1
6. Payment Router → Solana: Pay Agent B
7. Payment Router → Agent B: Execute with Result 1
8. Agent B → Payment Router: Result 2
9. Payment Router → Solana: Pay Agent C
10. Payment Router → Agent C: Execute with Result 2
11. Agent C → Payment Router: Result 3
12. Payment Router → Client: [Result 1, 2, 3] + payment summary
```

## Agent Lifecycle

```
┌─────────────┐
│   Created   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Register   │ ← Agent calls registry API
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Active    │ ← Sends heartbeats every 30s
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Inactive   │ ← No heartbeat for 60s
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Deregistered│ ← Removed from registry
└─────────────┘
```

## Payment Models

### Per Request
Fixed fee for each API call
```typescript
pricing: {
  amount: 0.01,
  currency: 'USDC',
  model: 'per_request'
}
```

### Per Token
Charge based on tokens processed (for LLMs)
```typescript
pricing: {
  amount: 0.00001,
  currency: 'USDC',
  model: 'per_token'
}
```

### Per Minute
Time-based pricing (for streaming/long-running)
```typescript
pricing: {
  amount: 0.05,
  currency: 'USDC',
  model: 'per_minute'
}
```

## Security Considerations

### Current (Demo)
- ✅ Input validation
- ✅ Error handling
- ✅ Transaction tracking
- ⚠️  No authentication (public endpoints)
- ⚠️  Simulated blockchain transactions

### Production Additions Needed
- 🔒 Wallet signature verification
- 🔒 API key authentication
- 🔒 Rate limiting
- 🔒 Real blockchain transactions
- 🔒 Escrow for disputes
- 🔒 Agent reputation system
- 🔒 DDoS protection
- 🔒 Encrypted communication

## Scalability

### Current Limitations
- In-memory storage (single node)
- Synchronous agent calls
- No load balancing

### Production Scaling Strategy

**Horizontal Scaling**:
```
Load Balancer
    ├─── Registry Instance 1
    ├─── Registry Instance 2
    └─── Registry Instance 3
         (Shared Redis/PostgreSQL)
```

**Database Layer**:
- PostgreSQL for agent registry
- Redis for caching and real-time data
- TimescaleDB for payment history

**Message Queue**:
- RabbitMQ or Kafka for async agent calls
- Job queue for payment processing
- Event streaming for analytics

**Microservices**:
- Separate services for discovery, payments, analytics
- API Gateway for unified interface
- Service mesh for inter-service communication

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **HTTP Client**: Axios

### Blockchain
- **Network**: Solana (devnet/mainnet)
- **SDK**: @solana/web3.js
- **Token**: USDC (SPL Token)

### Development
- **Build Tool**: TypeScript Compiler
- **Package Manager**: npm workspaces
- **Process Manager**: tsx (dev), pm2 (prod)

### Testing (Planned)
- **Unit Tests**: Jest
- **Integration Tests**: Supertest
- **E2E Tests**: Playwright
- **Load Tests**: k6

## Deployment Architecture

### Development
```
Local Machine
├── Registry (localhost:3001)
├── Router (localhost:3002)
└── Agents (localhost:3100+)
```

### Production
```
Cloud Provider (AWS/GCP/Azure)
├── Load Balancer
├── API Gateway
├── Container Cluster (Kubernetes)
│   ├── Registry Pods (3 replicas)
│   ├── Router Pods (3 replicas)
│   └── Agent Pods (auto-scaling)
├── Database Cluster
│   ├── PostgreSQL (Primary)
│   ├── PostgreSQL (Replica)
│   └── Redis Cache
└── Monitoring
    ├── Prometheus
    ├── Grafana
    └── Logging (ELK Stack)
```

## Monitoring & Observability

### Metrics to Track
- Request rate (requests/second)
- Payment volume (USDC/day)
- Agent count (active/inactive)
- Response time (p50, p95, p99)
- Error rate (%)
- Chain execution time

### Logging
- Structured JSON logs
- Request/response logging
- Payment transaction logs
- Error tracking

### Alerts
- Registry down
- Payment failures > 5%
- Agent unresponsive
- High latency (>1s)
- Low wallet balance

## Future Enhancements

### Phase 2: Production Ready
- Real Solana mainnet integration
- Wallet signature verification
- Database persistence
- API authentication

### Phase 3: Advanced Features
- Agent reputation system
- Escrow and dispute resolution
- Multi-protocol support (AP2, ATXP, ACP)
- Agent marketplace UI
- Analytics dashboard

### Phase 4: Enterprise
- Private agent networks
- SLA guarantees
- Custom pricing models
- White-label solutions
- Enterprise support

## Development Workflow

```
Developer creates agent
       ↓
Agent registers with Registry
       ↓
Agent appears in discovery
       ↓
Other agents can find it
       ↓
Payments route automatically
       ↓
Transactions tracked on Solana
```

## Testing Strategy

### Unit Tests
- Individual function testing
- Mock external dependencies
- Test payment calculations
- Validate agent capabilities

### Integration Tests
- Registry ↔ Router integration
- Agent ↔ Registry registration
- Payment flow end-to-end
- Chain execution

### E2E Tests
- Full user workflows
- Multi-agent scenarios
- Payment verification
- Error recovery

### Load Tests
- 1000 concurrent agents
- 10,000 payments/minute
- Chain execution under load
- Database performance

## Error Handling

### Retry Strategy
- Payment failures: 3 retries with exponential backoff
- Agent calls: 2 retries with 1s delay
- Registry registration: 5 retries

### Fallback Behavior
- Agent unavailable: Return error to user
- Payment fails: Rollback chain execution
- Registry down: Use cached agent data

### Circuit Breaker
- Open after 5 consecutive failures
- Half-open after 30 seconds
- Close after 3 successful requests

---

## Questions?

- Check [API Documentation](./API.md)
- See [Getting Started Guide](./GETTING_STARTED.md)
- Review [Example Agents](../demo/agents/)
- Open an issue on GitHub

