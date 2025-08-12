import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { BlocksController } from '../blocks.controller';
import { BlocksService } from '../blocks.service';

describe('BlocksController', () => {
  let controller: BlocksController;
  let service: BlocksService;

  const mockTransactionCountResponse = {
    blockNumber: 123456,
    transactionCount: 5,
    blockTime: 1691764800,
    success: true,
    cached: false,
    timestamp: '2023-08-11T12:00:00.000Z',
  };

  const mockCurrentSlotResponse = {
    currentSlot: 123456789,
    timestamp: '2023-08-11T12:00:00.000Z',
  };

  const mockBlocksService = {
    getTransactionCount: jest.fn(),
    getBlockInfo: jest.fn(),
    getCurrentSlot: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocksController],
      providers: [
        {
          provide: BlocksService,
          useValue: mockBlocksService,
        },
      ],
    })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true })
    .overrideInterceptor(CacheInterceptor)
    .useValue({ intercept: (context, next) => next.handle() })
    .compile();

    controller = module.get<BlocksController>(BlocksController);
    service = module.get<BlocksService>(BlocksService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCurrentSlot', () => {
    it('should return current slot', async () => {
      mockBlocksService.getCurrentSlot.mockResolvedValue(mockCurrentSlotResponse);

      const result = await controller.getCurrentSlot();

      expect(result).toEqual(mockCurrentSlotResponse);
      expect(service.getCurrentSlot).toHaveBeenCalled();
    });
  });

  describe('getTransactionCount', () => {
    const params = { blockNumber: 123456 };

    it('should return transaction count for valid block', async () => {
      mockBlocksService.getTransactionCount.mockResolvedValue(mockTransactionCountResponse);

      const result = await controller.getTransactionCount(params);

      expect(result).toEqual(mockTransactionCountResponse);
      expect(service.getTransactionCount).toHaveBeenCalledWith(123456);
    });
  });
});
