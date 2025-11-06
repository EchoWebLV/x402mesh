#!/bin/bash

# Fund USDC Mint Authority for creating test USDC tokens

echo "💵 Funding USDC Mint Authority..."
echo ""

WALLET_FILE=".wallets/USDCMintAuthority.json"

if [ ! -f "$WALLET_FILE" ]; then
    echo "Creating mint authority wallet..."
    npx tsx -e "
    import { Keypair } from '@solana/web3.js';
    import { writeFileSync, mkdirSync } from 'fs';
    
    mkdirSync('.wallets', { recursive: true });
    const keypair = Keypair.generate();
    writeFileSync('$WALLET_FILE', JSON.stringify(Array.from(keypair.secretKey)));
    console.log('Mint Authority:', keypair.publicKey.toBase58());
    "
fi

# Get address
MINT_AUTH=$(solana-keygen pubkey "$WALLET_FILE" 2>/dev/null)

echo "Mint Authority Address: $MINT_AUTH"
echo ""
echo "Requesting airdrop..."

solana airdrop 2 "$MINT_AUTH" --url devnet 2>&1 || {
    echo "⚠️  Airdrop failed. Fund manually:"
    echo "   Go to: https://faucet.solana.com/"
    echo "   Address: $MINT_AUTH"
}

echo ""
echo "✅ Mint authority funded!"
echo ""

