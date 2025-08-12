import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { SolanaService } from '../solana.service';

describe('SolanaService', () => {
  let service: SolanaService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SolanaService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<SolanaService>(SolanaService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    mockConfigService.get.mockReturnValue('https://api.mainnet-beta.solana.com');
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBlock', () => {
    const slot = 123456;
    const mockBlockData = {
      blockTime: 1691764800,
      blockhash: 'test-hash',
      parentSlot: 123455,
      transactions: [{ signatures: ['sig1'] }, { signatures: ['sig2'] }],
    };

    it('should return block data for valid slot', async () => {
      const mockResponse = {
        data: {
          result: mockBlockData,
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.getBlock(slot);

      expect(result).toEqual({
        blockHeight: slot,
        blockTime: mockBlockData.blockTime,
        blockhash: mockBlockData.blockhash,
        parentSlot: mockBlockData.parentSlot,
        transactions: mockBlockData.transactions,
      });
    });

    it('should throw NOT_FOUND when block does not exist', async () => {
      const mockResponse = {
        data: {
          result: null,
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await expect(service.getBlock(slot)).rejects.toThrow(
        new HttpException(`Block ${slot} not found`, HttpStatus.NOT_FOUND),
      );
    });

    it('should throw NOT_FOUND when RPC returns error', async () => {
      const mockResponse = {
        data: {
          error: {
            message: 'Block not found',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await expect(service.getBlock(slot)).rejects.toThrow(HttpException);
    });

    it('should throw SERVICE_UNAVAILABLE on network error', async () => {
      mockHttpService.post.mockReturnValue(throwError(() => new Error('Network error')));

      await expect(service.getBlock(slot)).rejects.toThrow(
        new HttpException('Failed to communicate with Solana network', HttpStatus.SERVICE_UNAVAILABLE),
      );
    });
  });

  describe('getCurrentSlot', () => {
    it('should return current slot', async () => {
      const currentSlot = 123456789;
      const mockResponse = {
        data: {
          result: currentSlot,
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      const result = await service.getCurrentSlot();

      expect(result).toBe(currentSlot);
    });

    it('should throw SERVICE_UNAVAILABLE on RPC error', async () => {
      const mockResponse = {
        data: {
          error: {
            message: 'RPC error',
          },
        },
      };

      mockHttpService.post.mockReturnValue(of(mockResponse));

      await expect(service.getCurrentSlot()).rejects.toThrow(HttpException);
    });
  });
});
