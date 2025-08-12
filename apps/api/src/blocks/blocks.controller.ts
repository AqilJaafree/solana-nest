import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { BlocksService } from './blocks.service';
import { BlockNumberDto } from './dto/block-number.dto';
import { TransactionCountResponse, BlockResponse } from './interfaces/block.interface';

@Controller('blocks')
@UseGuards(ThrottlerGuard)
@UseInterceptors(CacheInterceptor)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get('current')
  async getCurrentSlot() {
    try {
      return await this.blocksService.getCurrentSlot();
    } catch (error) {
      throw new HttpException(
        'Failed to fetch current slot',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  @Get(':blockNumber/transactions')
  async getTransactionCount(
    @Param() params: BlockNumberDto,
  ): Promise<TransactionCountResponse> {
    try {
      const result = await this.blocksService.getTransactionCount(params.blockNumber);
      return result;
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          `Block ${params.blockNumber} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to fetch block transaction count',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':blockNumber')
  async getBlock(@Param() params: BlockNumberDto): Promise<BlockResponse> {
    try {
      return await this.blocksService.getBlockInfo(params.blockNumber);
    } catch (error) {
      if (error.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(
          `Block ${params.blockNumber} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new HttpException(
        'Failed to fetch block data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
