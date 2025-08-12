import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface SolanaBlock {
  blockHeight: number;
  blockTime: number;
  blockhash: string;
  parentSlot: number;
  transactions: SolanaTransaction[];
}

export interface SolanaTransaction {
  signatures: string[];
}

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  private readonly rpcUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.rpcUrl = this.configService.get<string>('SOLANA_RPC_URL') || 'https://solana-mainnet.g.alchemy.com/v2/demo';
    this.logger.log(`Solana RPC URL: ${this.rpcUrl}`);
  }

  async getBlock(slot: number): Promise<SolanaBlock> {
    try {
      this.logger.log(`Fetching block ${slot} from Solana RPC`);
      
      const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getBlock',
        params: [
          slot,
          {
            encoding: 'json',
            transactionDetails: 'full', // Changed from 'signatures' to 'full'
            rewards: false,
            maxSupportedTransactionVersion: 0,
            commitment: 'finalized',
          },
        ],
      };

      this.logger.debug(`Sending payload: ${JSON.stringify(payload)}`);

      const response = await firstValueFrom(
        this.httpService.post(this.rpcUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }),
      );

      this.logger.debug(`Raw response for block ${slot}: ${JSON.stringify(response.data)}`);

      if (response.data.error) {
        this.logger.error(`Solana RPC error: ${JSON.stringify(response.data.error)}`);
        throw new HttpException(
          `Block ${slot} not found: ${response.data.error.message}`,
          HttpStatus.NOT_FOUND,
        );
      }

      const blockData = response.data.result;
      if (!blockData) {
        throw new HttpException(`Block ${slot} not found`, HttpStatus.NOT_FOUND);
      }

      // Log block details for debugging
      this.logger.log(`Block ${slot} details:`);
      this.logger.log(`- Block height: ${blockData.blockHeight}`);
      this.logger.log(`- Block time: ${blockData.blockTime}`);
      this.logger.log(`- Transactions array length: ${blockData.transactions?.length || 0}`);
      this.logger.log(`- Raw transactions: ${JSON.stringify(blockData.transactions?.slice(0, 2) || [])}`);

      const transactions = blockData.transactions || [];

      this.logger.log(`Successfully fetched block ${slot} with ${transactions.length} transactions`);

      return {
        blockHeight: slot,
        blockTime: blockData.blockTime,
        blockhash: blockData.blockhash,
        parentSlot: blockData.parentSlot,
        transactions: transactions,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch block ${slot}: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new HttpException(
          'Request timed out - Solana network may be slow',
          HttpStatus.REQUEST_TIMEOUT,
        );
      }
      
      throw new HttpException(
        'Failed to communicate with Solana network',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async getCurrentSlot(): Promise<number> {
    try {
      this.logger.log('Fetching current slot from Solana RPC');
      
      const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot',
      };

      const response = await firstValueFrom(
        this.httpService.post(this.rpcUrl, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }),
      );

      if (response.data.error) {
        throw new HttpException(
          `Failed to get current slot: ${response.data.error.message}`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const currentSlot = response.data.result;
      this.logger.log(`Current slot: ${currentSlot}`);
      return currentSlot;
    } catch (error) {
      this.logger.error(`Failed to get current slot: ${error.message}`);
      
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new HttpException(
          'Request timed out - Solana network may be slow',
          HttpStatus.REQUEST_TIMEOUT,
        );
      }
      
      throw new HttpException(
        'Failed to communicate with Solana network',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  // New method to find a block with transactions
  async findActiveBlock(): Promise<{ slot: number; transactionCount: number }> {
    this.logger.log('Searching for a block with transactions...');
    
    // Get current slot
    const currentSlot = await this.getCurrentSlot();
    
    // Search backwards from current slot
    for (let slot = currentSlot - 1; slot > currentSlot - 1000; slot--) {
      try {
        const block = await this.getBlock(slot);
        if (block.transactions.length > 0) {
          this.logger.log(`Found active block ${slot} with ${block.transactions.length} transactions`);
          return { slot, transactionCount: block.transactions.length };
        }
      } catch (error) {
        // Skip failed blocks and continue searching
        continue;
      }
    }
    
    throw new HttpException('No active blocks found in recent range', HttpStatus.NOT_FOUND);
  }
}
