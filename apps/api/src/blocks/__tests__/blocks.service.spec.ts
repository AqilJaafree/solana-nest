import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BlocksService } from '../blocks.service';
import { SolanaService } from '../../solana/solana.service';

describe('BlocksService', () => {
  let service: BlocksService;
  let solanaService: SolanaService;
  let cacheManager: any;

  const mockSolanaBlock = {
    blockHeight: 123456,
    blockTime: 1691764800,
    blockhash: 'test-hash',
    parentSlot: 123455,
    transactions: [
      { signatures: ['sig1'] },
      { signatures: ['sig2'] },
      { signatures: ['sig3'] },
    ],
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockSolanaService = {
    getBlock: jest.fn(),
    getCurrentSlot: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlocksService,
        {
          provide: SolanaService,
          useValue: mockSolanaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BlocksService>(BlocksService);
    solanaService = module.get<SolanaService>(SolanaService);
    cacheManager = module.get(CACHE_MANAGER);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTransactionCount', () => {
    const blockNumber = 123456;

    it('should return cached result when available', async () => {
      const cachedResult = {
        blockNumber,
        transactionCount: 3,
        blockTime: 1691764800,
        success: true,
        cached: false,
        timestamp: '2023-08-11T12:00:00.000Z',
      };

      mockCacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.getTransactionCount(blockNumber);

      expect(result).toEqual({ ...cachedResult, cached: true });
      expect(mockCacheManager.get).toHaveBeenCalledWith(`block-tx-count-${blockNumber}`);
      expect(mockSolanaService.getBlock).not.toHaveBeenCalled();
    });

    it('should fetch from Solana and cache when not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockSolanaService.getBlock.mockResolvedValue(mockSolanaBlock);

      const result = await service.getTransactionCount(blockNumber);

      expect(result).toEqual({
        blockNumber,
        transactionCount: 3,
        blockTime: 1691764800,
        success: true,
        cached: false,
        timestamp: expect.any(String),
      });

      expect(mockSolanaService.getBlock).toHaveBeenCalledWith(blockNumber);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `block-tx-count-${blockNumber}`,
        expect.any(Object),
        300000,
      );
    });

    it('should return correct transaction count', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockSolanaService.getBlock.mockResolvedValue(mockSolanaBlock);

      const result = await service.getTransactionCount(blockNumber);

      expect(result.transactionCount).toBe(3);
      expect(result.blockNumber).toBe(blockNumber);
      expect(result.success).toBe(true);
    });
  });

  describe('getCurrentSlot', () => {
    it('should return current slot from Solana service', async () => {
      const currentSlot = 123456789;
      mockSolanaService.getCurrentSlot.mockResolvedValue(currentSlot);

      const result = await service.getCurrentSlot();

      expect(result).toEqual({
        currentSlot,
        timestamp: expect.any(String),
      });
      expect(mockSolanaService.getCurrentSlot).toHaveBeenCalled();
    });
  });
});
