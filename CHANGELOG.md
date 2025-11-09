# Changelog

All notable changes to x402mesh will be documented in this file.

## [0.2.0] - 2025-11-09

### Added - Hybrid Chain Execution (MAJOR FEATURE)
- **Auto-chaining** - Agents with compatible schemas automatically compose
- **Template variables** - `{{stepN.field}}` syntax for precise field mapping
- **Chain validation** - Pre-execution validation catches errors before payment
- **Standard schemas** - `text_processing_v1`, `analysis_v1`, `image_processing_v1`, `data_transform_v1`
- Comprehensive test suite in `test-hybrid-chain.js`

### Added - Documentation Consolidation
- Consolidated 26 markdown files into 3 essential docs:
  - `README.md` - Project overview
  - `GUIDE.md` - Complete developer guide
  - `DEPLOYMENT.md` - Setup and deployment

### Changed
- Demo agents updated to use standard schemas
- SDK updated with `validateChain()` method
- Router implements intelligent input resolution
- Improved error messages and logging

### Technical Details
- New files: `standard-schemas.ts`, `template-resolver.ts`, `chain-validator.ts`
- Updated agents: `translator-agent.ts`, `analyzer-agent.ts`, `summarizer-agent.ts`
- All tests passing (5/5 in test suite)

## [0.1.0-alpha.1] - 2025-11-01

### Added - Initial Release
- Agent Registry with PostgreSQL backend
- Payment Router with x402 protocol
- Developer SDK for building agents
- Web UI with Phantom wallet integration
- Demo agents (Translator, Summarizer, Analyzer)
- Real Solana devnet integration
- SPL Token (USDC) support
- Agent chaining (basic)
- Payment rollback on failure

### Infrastructure
- Monorepo architecture with workspaces
- TypeScript across all packages
- Express.js for API servers
- Next.js 14 for web UI
- PostgreSQL for agent registry
- Solana Web3.js for blockchain

### Documentation
- README with quick start
- API documentation
- Architecture overview
- Solana integration guide
- Web UI documentation

## [0.0.1] - 2025-10-28

### Added - Project Initialization
- Project structure setup
- Package scaffolding
- Basic infrastructure planning
- Development environment configuration

---

## Upgrade Guide

### 0.1.x → 0.2.0

**Breaking Changes:** None - fully backward compatible

**New Features:**
1. Agents can now declare `schema` field in capabilities
2. Chains support template variables in `input` fields
3. New `validateChain()` method in `PaymentClient`

**Migration Steps:**
1. Update SDK: `npm install x402mesh-sdk@latest`
2. (Optional) Add `schema` to your agent capabilities:
   ```typescript
   capabilities: [{
     name: 'my_capability',
     schema: 'text_processing_v1',  // Add this line
     // ... rest of config
   }]
   ```
3. (Optional) Update agent outputs to follow standard schema
4. No changes required to existing chains - they continue to work

---

## Roadmap

### v0.3.0 (Planned)
- Agent reputation system
- Escrow for dispute resolution
- Enhanced monitoring and analytics
- Rate limiting improvements
- Performance optimizations

### v0.4.0 (Planned)
- Multi-protocol support (ATXP, AP2, ACP)
- Enhanced security features
- Mobile SDK
- Advanced chain features (conditional branching, loops)

### v1.0.0 (Planned)
- Production-ready mainnet deployment
- Enterprise features
- SLA guarantees
- Full audit and security review
- Comprehensive test coverage
- Performance benchmarks

---

For detailed information about each release, see the [GitHub Releases](https://github.com/yourusername/agent-2-agent-infra/releases) page.
