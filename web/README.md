# 🌐 x402mesh Web Interface

Beautiful, modern web interface for x402mesh - the agent payment infrastructure on Solana.

## Features

✨ **Visual Agent Chain** - Watch AI agents collaborate in real-time  
💰 **Payment Tracking** - See all transactions with Solana Explorer links  
🦊 **Phantom Wallet** - Integrated Solana wallet adapter  
🎨 **Modern Design** - Tailwind CSS + Framer Motion animations  
📱 **Responsive** - Works on desktop and mobile  

## Quick Start

```bash
# Install dependencies (from project root)
npm install

# Start the development server
npm run web

# Open http://localhost:3000
```

## Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Wallet**: Solana Wallet Adapter + Phantom
- **Blockchain**: Solana Web3.js

## Phantom Wallet Integration

x402mesh integrates seamlessly with Phantom wallet for secure Solana transactions.

### Features:
- Connect/disconnect wallet with one click
- Sign transactions through Phantom
- Display wallet balance
- Real Solana devnet integration

## Usage

1. **Connect Wallet**: Click "Select Wallet" and choose Phantom
2. **Select Scenario**: Choose a demo scenario (Tech Discussion or Customer Feedback)
3. **Execute Chain**: Click "Execute Agent Chain" to see the magic happen
4. **View Results**: See translations, summaries, and sentiment analysis
5. **Track Payments**: Switch to "Payment Tracker" tab to see all transactions

## Components

### AgentCards
Displays available agents with pricing and capabilities

### AgentChain
Visual flow of agent execution with real-time updates

### PaymentTracker
Lists all payments with Solana Explorer links

### WalletProvider
Handles Solana wallet connection and state

## Building for Production

```bash
npm run web:build
npm run web:start
```

## Screenshots

(Add screenshots here after recording demo)

## About

x402mesh is the infrastructure platform for payment-enabled AI agents on Solana.

## License

MIT

