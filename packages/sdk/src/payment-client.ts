import axios from 'axios';
import { PaymentRequest, PaymentResponse, ChainedRequest, ChainedResponse } from './types.js';

export class PaymentClient {
  private baseUrl: string;

  constructor(routerUrl: string = 'http://localhost:3002') {
    this.baseUrl = routerUrl;
  }

  async processPayment(payment: PaymentRequest): Promise<PaymentResponse> {
    const response = await axios.post(`${this.baseUrl}/payments/process`, payment);
    return response.data;
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentResponse> {
    const response = await axios.get(`${this.baseUrl}/payments/${transactionId}`);
    return response.data;
  }

  async executeChain(chainRequest: ChainedRequest): Promise<ChainedResponse> {
    const response = await axios.post(`${this.baseUrl}/payments/chain`, chainRequest);
    return response.data;
  }

  async splitPayment(payment: PaymentRequest, splits: { agentId: string; percentage: number }[]): Promise<PaymentResponse[]> {
    const response = await axios.post(`${this.baseUrl}/payments/split`, { payment, splits });
    return response.data;
  }
}

