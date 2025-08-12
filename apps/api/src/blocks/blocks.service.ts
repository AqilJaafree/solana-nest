import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SolanaService } from '../solana/solana.service';
import { TransactionCountResponse, BlockResponse } from './interfaces/block.interface';

@Injectable()
export class BlocksService {
  private readonly logger = new Logger(BlocksService.name);

  constructor(
    private readonly solanaService: SolanaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTransactionCount(blockNumber: number): Promise<TransactionCountResponse> {
    const cacheKey = `block-tx-count-${blockNumber}`;
    
    const cachedResult = await this.cacheManager.get<TransactionCountResponse>(cacheKey);
    if (cachedResult) {
      this.logger.log(`Cache hit for block ${blockNumber}`);
      return { ...cachedResult, cached: true };
    }

    this.logger.log(`Fetching transaction count for block ${blockNumber}`);
    const block = await this.solanaService.getBlock(blockNumber);
    
    const result: TransactionCountResponse = {
      blockNumber,
      transactionCount: block.transactions.length,
      blockTime: block.blockTime,
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    await this.cacheManager.set(cacheKey, result, 300000);
    this.logger.log(`Cached result for block ${blockNumber} - ${result.transactionCount} transactions`);

    return result;
  }

  async getBlockInfo(blockNumber: number): Promise<BlockResponse> {
    const cacheKey = `block-info-${blockNumber}`;
    
    const cachedResult = await this.cacheManager.get<BlockResponse>(cacheKey);
    if (cachedResult) {
      this.logger.log(`Cache hit for block info ${blockNumber}`);
      return { ...cachedResult, cached: true };
    }

    this.logger.log(`Fetching block info for block ${blockNumber}`);
    const block = await this.solanaService.getBlock(blockNumber);
    
    const result: BlockResponse = {
      blockNumber,
      blockTime: block.blockTime,
      blockhash: block.blockhash,
      parentSlot: block.parentSlot,
      transactionCount: block.transactions.length,
      success: true,
      cached: false,
      timestamp: new Date().toISOString(),
    };

    await this.cacheManager.set(cacheKey, result, 300000);
    this.logger.log(`Cached block info for block ${blockNumber}`);

    return result;
  }

  async getCurrentSlot(): Promise<{ currentSlot: number; timestamp: string }> {
    const currentSlot = await this.solanaService.getCurrentSlot();
    return {
      currentSlot,
      timestamp: new Date().toISOString(),
    };
  }
}
