import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
import { getOrCreateKeypair } from './wallet-utils.js';
import { transferUSDC, initializeUSDCMint } from './usdc-utils.js';

interface PaymentRequest {
  from: string;
  to: string;
  amount: number;
  currency: 'USDC' | 'SOL';
  serviceId: string;
  metadata?: any;
  fromKeypair?: Keypair; // For actual signing
}

interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  timestamp: string;
  from?: string;
  to?: string;
  serviceId?: string;
  signature?: string; // Actual Solana signature
  explorerUrl?: string;
}

export class PaymentRouter {
  private payments: Map<string, PaymentResponse> = new Map();
  private connection: Connection;
  private totalProcessed: number = 0;
  private totalVolume: number = 0;
  private useRealTransactions: boolean;

  constructor(useRealTransactions?: boolean) {
    // Connect to Solana devnet
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.useRealTransactions = useRealTransactions || false;
    
    // Initialize USDC mint if using real transactions
    if (this.useRealTransactions) {
      this.initializeUSDC();
    }
  }

  private async initializeUSDC() {
    try {
      await initializeUSDCMint();
    } catch (error) {
      console.warn('Failed to initialize USDC mint:', error);
    }
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const transactionId = this.generateTransactionId();
    
    const payment: PaymentResponse = {
      transactionId,
      status: 'pending',
      amount: request.amount,
      currency: request.currency,
      timestamp: new Date().toISOString(),
      from: request.from,
      to: request.to,
      serviceId: request.serviceId,
    };

    this.payments.set(transactionId, payment);

    try {
      if (this.useRealTransactions) {
        // REAL Solana transaction
        const signature = await this.executeRealBlockchainTransaction(request);
        payment.signature = signature;
        payment.explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      } else {
        // Simulated for demo (faster)
        await this.simulateBlockchainTransaction(request);
      }
      
      payment.status = 'completed';
      this.totalProcessed++;
      this.totalVolume += request.amount;
      
      console.log(`💰 Payment processed: ${request.amount} ${request.currency} from ${this.truncateAddress(request.from)} to ${this.truncateAddress(request.to)} for ${request.serviceId}`);
      if (payment.signature) {
        console.log(`   📝 Signature: ${payment.signature}`);
        console.log(`   🔍 Explorer: ${payment.explorerUrl}`);
      }
    } catch (error) {
      payment.status = 'failed';
      console.error('Payment failed:', error);
    }

    this.payments.set(transactionId, payment);
    return payment;
  }

  async executeRealBlockchainTransaction(request: PaymentRequest): Promise<string> {
    try {
      if (request.currency === 'USDC') {
        // USDC SPL Token transfer
        return await transferUSDC(request.from, request.to, request.amount);
      } else {
        // Native SOL transfer
        const fromKeypair = request.fromKeypair || await getOrCreateKeypair(request.from);
        const toPubkey = new PublicKey(request.to);
        
        // Convert amount to lamports (1 SOL = 1e9 lamports)
        const lamports = Math.floor(request.amount * LAMPORTS_PER_SOL);
        
        // Create transaction
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey,
            lamports,
          })
        );
        
        // Send and confirm transaction
        const signature = await sendAndConfirmTransaction(
          this.connection,
          transaction,
          [fromKeypair],
          {
            commitment: 'confirmed',
          }
        );
        
        return signature;
      }
    } catch (error: any) {
      console.error('Blockchain transaction failed:', error);
      throw new Error(`Solana transaction failed: ${error.message}`);
    }
  }

  private async simulateBlockchainTransaction(request: PaymentRequest): Promise<void> {
    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }

  private truncateAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async splitPayment(
    payment: PaymentRequest,
    splits: { agentId: string; percentage: number }[]
  ): Promise<PaymentResponse[]> {
    const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Split percentages must sum to 100');
    }

    const results: PaymentResponse[] = [];
    
    for (const split of splits) {
      const amount = (payment.amount * split.percentage) / 100;
      const result = await this.processPayment({
        ...payment,
        amount,
        metadata: { ...payment.metadata, split: true, agentId: split.agentId },
      });
      results.push(result);
    }

    return results;
  }

  getPayment(transactionId: string): PaymentResponse {
    const payment = this.payments.get(transactionId);
    if (!payment) {
      throw new Error(`Payment not found: ${transactionId}`);
    }
    return payment;
  }

  getPaymentHistory(limit: number = 100): PaymentResponse[] {
    const history = Array.from(this.payments.values());
    return history.slice(-limit);
  }

  getStats() {
    const payments = Array.from(this.payments.values());
    return {
      totalProcessed: this.totalProcessed,
      totalVolume: this.totalVolume,
      successful: payments.filter(p => p.status === 'completed').length,
      failed: payments.filter(p => p.status === 'failed').length,
      pending: payments.filter(p => p.status === 'pending').length,
    };
  }

  private generateTransactionId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

