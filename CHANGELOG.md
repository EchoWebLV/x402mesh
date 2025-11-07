# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0-alpha.1] - 2025-11-07

### Added

#### Core Infrastructure
- Agent Discovery Registry for registering and discovering AI agents
- Payment Router with x402 protocol support
- TypeScript SDK for building payment-enabled agents
- Web UI with Phantom wallet integration

#### Blockchain Integration
- Real Solana devnet integration
- Native SOL transfers with on-chain verification
- SPL token support infrastructure (USDC-ready)
- x402 protocol compliance (HTTP 402 Payment Required)
- Transaction verification via Solana Explorer

#### Demo Agents
- Translator Agent (dictionary-based translation)
- Summarizer Agent (sentence extraction)
- Analyzer Agent (sentiment analysis)
- All agents with micropayment capabilities

#### Developer Experience
- Simple Agent base class for easy development
- Automatic agent registration
- Built-in payment verification
- Agent chaining with automatic payment routing
- Comprehensive documentation (7+ guides)

#### Web Interface
- Next.js 14 modern UI
- Phantom wallet integration
- Real-time agent chain visualization
- Payment tracking dashboard
- Clickable Solana Explorer links
- Responsive design with Tailwind CSS

#### CLI Tools
- Demo scripts for agent chains
- Wallet setup automation
- Real transaction mode support
- Health check utilities

### Technical Details
- Node.js 18+ with TypeScript
- Express.js for API services
- Solana Web3.js for blockchain
- Vitest for testing
- npm workspaces for monorepo

### Documentation
- README.md with full project overview
- QUICKSTART.md for 30-second setup
- Getting Started guide
- API Reference
- Architecture documentation
- Solana Integration guide
- Hackathon submission document

### Known Limitations
- In-memory storage (no database)
- No authentication/authorization
- Demo agents use simple algorithms
- Rate limiting not implemented
- USDC not fully tested

[0.1.0-alpha.1]: https://github.com/yourusername/agent-2-agent-infra/releases/tag/v0.1.0-alpha.1

