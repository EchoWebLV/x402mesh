#!/bin/bash

# Interactive wallet funding helper
# Opens browser for each wallet that needs funding

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  💰 Interactive Wallet Funding Helper               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

WALLETS=(
  "TranslatorWallet:9eLnhcUS321fPHns8QTChu1o8aisTBwhSWmxJYu1Q5qc"
  "SummarizerWallet:8BbcXgqaS2ajJuKPWPtCF1ghaFHX2yKGSHep57ez6JMN"
  "AnalyzerWallet:7WKDtQnHVnPkxjSudXJw3b2wQbBffJyNa4cX8PMR1caJ"
)

echo "🎯 We need to fund 3 agent wallets for the demo"
echo ""
echo "For each wallet, I'll:"
echo "  1. Copy the address to your clipboard"
echo "  2. Open the Solana faucet in your browser"
echo "  3. You paste and request 1 SOL"
echo ""
read -p "Ready? Press Enter to start..."

for wallet_info in "${WALLETS[@]}"; do
    IFS=':' read -r name address <<< "$wallet_info"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📝 Funding: $name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Address: $address"
    echo ""
    
    # Copy to clipboard (works on macOS)
    echo "$address" | pbcopy
    echo "✅ Address copied to clipboard!"
    echo ""
    
    # Open faucet
    echo "🌐 Opening Solana faucet..."
    open "https://faucet.solana.com/"
    
    echo ""
    echo "👉 Steps:"
    echo "   1. Paste address (Cmd+V)"
    echo "   2. Click 'Request Airdrop'"
    echo "   3. Wait for confirmation (~30 seconds)"
    echo ""
    
    read -p "Press Enter when funded (or 's' to skip)... " response
    
    if [[ "$response" == "s" ]]; then
        echo "⏭️  Skipped $name"
    else
        echo "✅ $name funded!"
    fi
done

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ Funding Complete!                                ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "📊 Check balances: npm run check:balances"
echo "🚀 Test transactions: node test-hybrid-chain.js"
echo ""


