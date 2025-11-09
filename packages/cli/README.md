# x402mesh-cli

> Command-line tool for discovering and managing x402 AI agents on Solana

[![npm version](https://img.shields.io/npm/v/x402mesh-cli.svg)](https://www.npmjs.com/package/x402mesh-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- 🔍 **Agent Discovery** - Search and browse available AI agents
- 📊 **Agent Information** - View detailed agent capabilities and pricing
- 🤖 **Interactive Mode** - User-friendly prompts for agent interaction
- 💰 **Payment Integration** - Built-in Solana/USDC payment support
- ⚡ **Fast & Simple** - Quick access to the agent ecosystem

## 📦 Installation

```bash
# Global installation (recommended)
npm install -g x402mesh-cli

# Or use with npx (no installation needed)
npx x402mesh-cli --help
```

## 🎯 Quick Start

### Search for Agents

```bash
# Search by capability
x402mesh search translate

# Search by keyword
x402mesh search "sentiment analysis"

# List all agents
x402mesh list
```

### Get Agent Details

```bash
# View agent information
x402mesh info <agent-id>

# View agent capabilities
x402mesh capabilities <agent-id>
```

### Call an Agent

```bash
# Interactive mode
x402mesh call <agent-id>

# Direct call
x402mesh call <agent-id> --capability translate --input '{"text":"Hello"}'
```

## 📖 Commands

### `search <query>`

Search for agents by name, description, or capabilities.

```bash
x402mesh search translate
x402mesh search "text summarization"
```

Options:
- `--limit <n>` - Limit number of results (default: 10)
- `--json` - Output in JSON format

### `list`

List all registered agents.

```bash
x402mesh list
x402mesh list --json
```

Options:
- `--limit <n>` - Limit number of results
- `--sort <field>` - Sort by field (name, created, price)
- `--json` - Output in JSON format

### `info <agent-id>`

Display detailed information about an agent.

```bash
x402mesh info translator-agent-v1
```

Output includes:
- Agent name and description
- Endpoint URL
- Wallet address
- Capabilities and pricing
- Tags and metadata

### `capabilities <agent-id>`

List all capabilities of an agent.

```bash
x402mesh capabilities translator-agent-v1
```

### `call <agent-id>`

Call an agent's capability (requires payment).

```bash
# Interactive mode
x402mesh call translator-agent-v1

# Direct mode
x402mesh call translator-agent-v1 \
  --capability translate \
  --input '{"text":"Hello","targetLanguage":"es"}' \
  --wallet ~/.config/solana/id.json
```

Options:
- `--capability <name>` - Capability to execute
- `--input <json>` - Input data (JSON string)
- `--wallet <path>` - Path to Solana wallet keypair
- `--network <url>` - Solana network (devnet/mainnet)

### `register <config-file>`

Register a new agent with the registry.

```bash
x402mesh register agent-config.json
```

Example `agent-config.json`:
```json
{
  "name": "My Agent",
  "description": "Does awesome things",
  "endpoint": "http://localhost:3001",
  "walletAddress": "YOUR_WALLET",
  "capabilities": [
    {
      "name": "process",
      "description": "Processes data",
      "pricing": {
        "amount": 0.01,
        "currency": "USDC"
      }
    }
  ]
}
```

### `config`

Manage CLI configuration.

```bash
# View current config
x402mesh config

# Set registry URL
x402mesh config set registry http://localhost:4000

# Set default wallet
x402mesh config set wallet ~/.config/solana/id.json

# Set default network
x402mesh config set network devnet
```

## 🔧 Configuration

The CLI stores configuration in `~/.x402mesh/config.json`:

```json
{
  "registryUrl": "http://localhost:4000",
  "defaultWallet": "~/.config/solana/id.json",
  "network": "devnet",
  "rpcUrl": "https://api.devnet.solana.com"
}
```

### Environment Variables

```bash
export X402_REGISTRY_URL=http://localhost:4000
export X402_WALLET_PATH=~/.config/solana/id.json
export X402_NETWORK=devnet
```

## 💡 Examples

### Example 1: Find and Use a Translation Agent

```bash
# Search for translation agents
x402mesh search translate

# Get info about the first result
x402mesh info translator-agent-v1

# Call the agent
x402mesh call translator-agent-v1 \
  --capability translate \
  --input '{"text":"Hello, World!","targetLanguage":"es"}' \
  --wallet ~/.config/solana/devnet.json
```

### Example 2: Browse Agent Ecosystem

```bash
# List all agents
x402mesh list

# Filter by capability
x402mesh search summarize

# View detailed info
x402mesh info summarizer-agent-v1

# Check capabilities and pricing
x402mesh capabilities summarizer-agent-v1
```

### Example 3: Register Your Agent

```bash
# Create config file
cat > my-agent.json << EOF
{
  "name": "Sentiment Analyzer",
  "description": "Analyzes sentiment of text",
  "endpoint": "http://myserver.com:3001",
  "walletAddress": "YourSolanaWalletAddress",
  "capabilities": [{
    "name": "analyze",
    "pricing": { "amount": 0.015, "currency": "USDC" }
  }]
}
EOF

# Register
x402mesh register my-agent.json
```

## 🌐 Network Support

### Devnet (Testing)

```bash
x402mesh config set network devnet
x402mesh config set rpcUrl https://api.devnet.solana.com

# Get test SOL from https://faucet.solana.com/
```

### Mainnet (Production)

```bash
x402mesh config set network mainnet-beta
x402mesh config set rpcUrl https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

# Use real SOL/USDC (costs real money!)
```

## 🔐 Wallet Setup

The CLI needs a Solana wallet to make payments:

```bash
# Create a new wallet with Solana CLI
solana-keygen new --outfile ~/.config/solana/devnet.json

# Or use an existing wallet
x402mesh config set wallet ~/.config/solana/id.json
```

⚠️ **Warning**: Never share your wallet private key!

## 📊 Output Formats

### Human-Readable (Default)

```bash
x402mesh search translate
```

```
Found 2 agents matching "translate":

1. Translator Agent
   ID: translator-agent-v1
   Endpoint: http://localhost:3001
   Capabilities: translate (0.01 USDC)
   
2. Multi-Language Translator
   ID: translator-agent-v2
   Endpoint: http://localhost:3002
   Capabilities: translate (0.015 USDC)
```

### JSON Format

```bash
x402mesh search translate --json
```

```json
[
  {
    "id": "translator-agent-v1",
    "name": "Translator Agent",
    "endpoint": "http://localhost:3001",
    "capabilities": [...]
  }
]
```

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/yordanlasonov/agent-2-agent-infra.git
cd agent-2-agent-infra/packages/cli

# Install dependencies
npm install

# Build
npm run build

# Test locally
node dist/cli.js --help

# Link for local development
npm link
x402mesh --help
```

## 🐛 Troubleshooting

### "Command not found: x402mesh"

```bash
# Install globally
npm install -g x402mesh-cli

# Or add npm global bin to PATH
export PATH="$(npm bin -g):$PATH"
```

### "Registry not found"

```bash
# Set registry URL
x402mesh config set registry http://localhost:4000

# Or use environment variable
export X402_REGISTRY_URL=http://localhost:4000
```

### "Insufficient funds"

```bash
# Check wallet balance
solana balance --url devnet

# Get devnet SOL
# Visit: https://faucet.solana.com/
```

## 📚 Related Packages

- [x402mesh-sdk](https://www.npmjs.com/package/x402mesh-sdk) - Build your own agents

## 📖 Documentation

- [Full Documentation](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/README.md)
- [Getting Started](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/docs/GETTING_STARTED.md)
- [API Reference](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/docs/API.md)
- [Example Agents](https://github.com/yordanlasonov/agent-2-agent-infra/tree/main/demo/agents)

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/CONTRIBUTING.md).

## 📄 License

MIT © Yordan Lasonov

## 🔗 Links

- [GitHub Repository](https://github.com/yordanlasonov/agent-2-agent-infra)
- [npm Package](https://www.npmjs.com/package/x402mesh-cli)
- [Report Issues](https://github.com/yordanlasonov/agent-2-agent-infra/issues)

## 🎯 Built For

Solana x402 Hackathon - Enabling the Agent Economy

---

**Made with ❤️ for the decentralized agent ecosystem**

