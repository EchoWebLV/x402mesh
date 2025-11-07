import { describe, it, expect } from 'vitest';
import {
  createPaymentRequirements,
  encodePaymentRequirements,
  parseXPaymentHeader,
  createXPaymentResponse,
  create402Response,
  hasXPaymentHeader,
  getXPaymentHeader
} from './x402-utils';

describe('x402 Protocol Utilities', () => {
  describe('createPaymentRequirements', () => {
    it('should create valid SOL payment requirements', () => {
      const requirements = createPaymentRequirements(
        '7xHK9m2QZNx8Ab9cPqr3ijwbc6Yg4JmpKiU5WPzbmN1',
        0.01,
        'SOL',
        'devnet'
      );

      expect(requirements).toEqual({
        x402Version: 1,
        scheme: 'exact',
        network: 'solana-devnet',
        recipient: '7xHK9m2QZNx8Ab9cPqr3ijwbc6Yg4JmpKiU5WPzbmN1',
        amount: 10_000_000, // 0.01 SOL in lamports
        token: undefined,
        memo: 'Payment for service'
      });
    });

    it('should create valid USDC payment requirements', () => {
      const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const requirements = createPaymentRequirements(
        '7xHK9m2QZNx8Ab9cPqr3ijwbc6Yg4JmpKiU5WPzbmN1',
        5.00,
        'USDC',
        'mainnet',
        usdcMint
      );

      expect(requirements).toEqual({
        x402Version: 1,
        scheme: 'exact',
        network: 'solana-mainnet',
        recipient: '7xHK9m2QZNx8Ab9cPqr3ijwbc6Yg4JmpKiU5WPzbmN1',
        amount: 5_000_000, // 5 USDC in microUSDC
        token: usdcMint,
        memo: 'Payment for service'
      });
    });

    it('should convert amounts to smallest units correctly', () => {
      // SOL: 1 SOL = 1_000_000_000 lamports
      const sol1 = createPaymentRequirements('wallet', 1, 'SOL');
      expect(sol1.amount).toBe(1_000_000_000);

      const sol0001 = createPaymentRequirements('wallet', 0.001, 'SOL');
      expect(sol0001.amount).toBe(1_000_000);

      // USDC: 1 USDC = 1_000_000 microUSDC (6 decimals)
      const usdc1 = createPaymentRequirements('wallet', 1, 'USDC');
      expect(usdc1.amount).toBe(1_000_000);

      const usdc0001 = createPaymentRequirements('wallet', 0.001, 'USDC');
      expect(usdc0001.amount).toBe(1_000);
    });
  });

  describe('encodePaymentRequirements', () => {
    it('should encode requirements as base64', () => {
      const requirements = createPaymentRequirements('wallet', 0.01, 'SOL');
      const encoded = encodePaymentRequirements(requirements);
      
      // Should be valid base64
      expect(encoded).toMatch(/^[A-Za-z0-9+/]+=*$/);
      
      // Should decode back to JSON
      const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString());
      expect(decoded).toEqual(requirements);
    });
  });

  describe('parseXPaymentHeader', () => {
    it('should parse valid base64-encoded payment proof', () => {
      const proof = {
        x402Version: 1,
        scheme: 'exact',
        network: 'solana-devnet',
        payload: {
          serializedTransaction: 'base64TransactionData=='
        }
      };
      
      const encoded = Buffer.from(JSON.stringify(proof)).toString('base64');
      const parsed = parseXPaymentHeader(encoded);
      
      expect(parsed).toEqual(proof);
    });

    it('should throw error for invalid base64', () => {
      expect(() => parseXPaymentHeader('not-valid-base64!!!')).toThrow('Invalid X-PAYMENT header format');
    });

    it('should throw error for invalid JSON', () => {
      const invalidJson = Buffer.from('not json').toString('base64');
      expect(() => parseXPaymentHeader(invalidJson)).toThrow();
    });
  });

  describe('createXPaymentResponse', () => {
    it('should create valid base64-encoded response header', () => {
      const signature = '5KJj8yQm2qZNx8Ab9cPqr3ijwbc6Yg4JmpKiU5WPzbmN1';
      const explorerUrl = 'https://explorer.solana.com/tx/' + signature;
      
      const header = createXPaymentResponse(signature, true, explorerUrl);
      
      // Should be base64
      expect(header).toMatch(/^[A-Za-z0-9+/]+=*$/);
      
      // Decode and verify
      const decoded = JSON.parse(Buffer.from(header, 'base64').toString());
      expect(decoded.x402Version).toBe(1);
      expect(decoded.verified).toBe(true);
      expect(decoded.signature).toBe(signature);
      expect(decoded.explorerUrl).toBe(explorerUrl);
      expect(decoded.timestamp).toBeDefined();
    });
  });

  describe('create402Response', () => {
    it('should create standard 402 error response', () => {
      const response = create402Response(
        'recipientWallet',
        0.05,
        'SOL'
      );

      expect(response.statusCode).toBe(402);
      expect(response.headers['Content-Type']).toBe('application/json');
      expect(response.headers['X-Payment-Required']).toBe('true');
      expect(response.body.error).toBe('Payment Required');
      expect(response.body.payment.x402Version).toBe(1);
      expect(response.body.payment.recipient).toBe('recipientWallet');
      expect(response.body.payment.amount).toBe(50_000_000); // lamports
    });
  });

  describe('hasXPaymentHeader & getXPaymentHeader', () => {
    it('should detect X-PAYMENT header (lowercase)', () => {
      const headers = { 'x-payment': 'somevalue' };
      expect(hasXPaymentHeader(headers)).toBe(true);
      expect(getXPaymentHeader(headers)).toBe('somevalue');
    });

    it('should detect X-PAYMENT header (uppercase)', () => {
      const headers = { 'X-Payment': 'somevalue' };
      expect(hasXPaymentHeader(headers)).toBe(true);
      expect(getXPaymentHeader(headers)).toBe('somevalue');
    });

    it('should return false when header is missing', () => {
      const headers = { 'other-header': 'value' };
      expect(hasXPaymentHeader(headers)).toBe(false);
      expect(getXPaymentHeader(headers)).toBeUndefined();
    });
  });
});

