import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import type { ParsedInstruction, ParsedTransactionWithMeta, PartiallyDecodedInstruction } from '@solana/web3.js';
import { initializeUSDCMint, getUSDCMint } from './usdc-utils.js';

interface PaymentRequest {
  from: string;
  to: string;
  amount: number;
  currency: 'USDC' | 'SOL';
  serviceId: string;
  metadata?: any;
  transactionSignature?: string;
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
        const signature = request.transactionSignature;
        if (!signature) {
          throw new Error('transactionSignature is required when REAL_TRANSACTIONS=true');
        }

        this.validateAddress(request.from, 'from');
        this.validateAddress(request.to, 'to');

        await this.verifyOnChainPayment(request, signature);

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
      throw error; // Re-throw so caller knows payment failed
    }

    this.payments.set(transactionId, payment);
    return payment;
  }

  async refundPayment(transactionId: string, reason: string): Promise<PaymentResponse> {
    const originalPayment = this.getPayment(transactionId);
    
    if (originalPayment.status !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    if (this.useRealTransactions) {
      throw new Error('Refunds require a new on-chain transaction when REAL_TRANSACTIONS=true');
    }

    // Create reverse payment
    const refund = await this.processPayment({
      from: originalPayment.to!,
      to: originalPayment.from!,
      amount: originalPayment.amount,
      currency: originalPayment.currency as 'USDC' | 'SOL',
      serviceId: `refund-${originalPayment.serviceId}`,
      metadata: { 
        refund: true, 
        originalTransaction: transactionId,
        reason 
      },
    });

    console.log(`🔄 Refunded ${originalPayment.amount} ${originalPayment.currency} (${reason})`);
    
    return refund;
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
    if (this.useRealTransactions) {
      throw new Error('Split payments require manual settlement when REAL_TRANSACTIONS=true');
    }

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

  isRealTransactionsEnabled(): boolean {
    return this.useRealTransactions;
  }

  private async verifyOnChainPayment(request: PaymentRequest, signature: string): Promise<void> {
    try {
      const transaction = await this.connection.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction || !transaction.meta) {
        throw new Error('Transaction not found or not yet confirmed on-chain');
      }

      if (transaction.meta.err) {
        throw new Error('Transaction execution failed on-chain');
      }

      if (request.currency === 'SOL') {
        this.verifySolTransfer(request, transaction);
      } else {
        this.verifyUSDCPayment(request, transaction);
      }
    } catch (error: any) {
      throw new Error(`Failed to verify on-chain payment: ${error.message}`);
    }
  }

  private verifySolTransfer(request: PaymentRequest, tx: ParsedTransactionWithMeta): void {
    const lamportsExpected = Math.floor(request.amount * LAMPORTS_PER_SOL);
    const instructions = tx.transaction.message.instructions;

    const transferInstruction = instructions.find((ix): ix is ParsedInstruction =>
      this.isParsedInstruction(ix) && ix.program === 'system' && ix.parsed?.type === 'transfer'
    );

    if (!transferInstruction || !transferInstruction.parsed) {
      throw new Error('No SOL transfer instruction found in transaction');
    }

    const info: any = transferInstruction.parsed.info;

    if (info.source !== request.from) {
      throw new Error('SOL transfer source does not match payment request');
    }

    if (info.destination !== request.to) {
      throw new Error('SOL transfer destination does not match payment request');
    }

    const lamportsActual = typeof info.lamports === 'string'
      ? parseInt(info.lamports, 10)
      : info.lamports;

    if (lamportsActual !== lamportsExpected) {
      throw new Error('SOL transfer amount does not match payment request');
    }
  }

  private verifyUSDCPayment(request: PaymentRequest, tx: ParsedTransactionWithMeta): void {
    const usdcMint = getUSDCMint();
    if (!usdcMint) {
      throw new Error('USDC mint not initialized');
    }

    const mintAddress = usdcMint.toBase58();
    const preBalances = (tx.meta?.preTokenBalances || []).filter((balance) => balance.mint === mintAddress);
    const postBalances = (tx.meta?.postTokenBalances || []).filter((balance) => balance.mint === mintAddress);

    const senderPre = preBalances.find((balance) => balance.owner === request.from);
    const senderPost = postBalances.find((balance) => balance.owner === request.from);
    const recipientPre = preBalances.find((balance) => balance.owner === request.to);
    const recipientPost = postBalances.find((balance) => balance.owner === request.to);

    if (!senderPre || !senderPost) {
      throw new Error('Sender USDC balance not found in transaction metadata');
    }

    if (!recipientPost) {
      throw new Error('Recipient USDC balance not found in transaction metadata');
    }

    const amountUnits = BigInt(Math.round(request.amount * 1_000_000));
    const senderDelta = BigInt(senderPre.uiTokenAmount.amount) - BigInt(senderPost.uiTokenAmount.amount);

    if (senderDelta !== amountUnits) {
      throw new Error('USDC amount debited from sender does not match payment request');
    }

    const recipientPreAmount = recipientPre ? BigInt(recipientPre.uiTokenAmount.amount) : BigInt(0);
    const recipientPostAmount = BigInt(recipientPost.uiTokenAmount.amount);
    const recipientDelta = recipientPostAmount - recipientPreAmount;

    if (recipientDelta !== amountUnits) {
      throw new Error('USDC amount credited to recipient does not match payment request');
    }
  }

  private validateAddress(address: string, field: 'from' | 'to'): void {
    try {
      new PublicKey(address);
    } catch (error) {
      throw new Error(`Invalid ${field} address: ${address}`);
    }
  }

  private isParsedInstruction(
    instruction: ParsedInstruction | PartiallyDecodedInstruction
  ): instruction is ParsedInstruction {
    return 'parsed' in instruction;
  }
}

