import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import { KeysCacheService, CachedKey } from '../keys/keys.service';

const mockKey: CachedKey = {
  key: 'test-key',
  rateLimit: 2,
  expiresAt: new Date(Date.now() + 100000).toISOString(),
  status: 'active',
};

describe('TokensService', () => {
  let service: TokensService;
  let keysCache: KeysCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokensService,
        {
          provide: KeysCacheService,
          useValue: {
            getKey: jest.fn().mockResolvedValue(mockKey),
          },
        },
      ],
    }).compile();

    service = module.get<TokensService>(TokensService);
    keysCache = module.get<KeysCacheService>(KeysCacheService);
    // Mock Redis methods
    (service as any).redis = {
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn(),
      lpush: jest.fn(),
      ltrim: jest.fn(),
    };
  });

  it('should validate a valid key', async () => {
    await expect(service.validateKeyOrThrow('test-key')).resolves.toEqual(mockKey);
  });

  it('should throw for invalid key', async () => {
    (keysCache.getKey as jest.Mock).mockResolvedValue(null);
    await expect(service.validateKeyOrThrow('bad-key')).rejects.toThrow(ForbiddenException);
  });

  it('should throw for expired key', async () => {
    (keysCache.getKey as jest.Mock).mockResolvedValue({ ...mockKey, expiresAt: new Date(Date.now() - 1000).toISOString() });
    await expect(service.validateKeyOrThrow('test-key')).rejects.toThrow(ForbiddenException);
  });

  it('should throw for inactive key', async () => {
    (keysCache.getKey as jest.Mock).mockResolvedValue({ ...mockKey, status: 'disabled' });
    await expect(service.validateKeyOrThrow('test-key')).rejects.toThrow(ForbiddenException);
  });

  it('should enforce rate limit', async () => {
    (service as any).redis.incr = jest.fn().mockResolvedValue(3);
    await expect(service.checkRateLimitOrThrow('test-key', 2)).rejects.toThrow();
  });

  it('should return token info for valid request', async () => {
    await expect(service.getTokenInfo('eth', 'test-key')).resolves.toEqual({ id: 'eth', name: 'Ethereum', price: 3500 });
  });

  it('should throw NotFoundException for unknown token', async () => {
    await expect(service.getTokenInfo('unknown', 'test-key')).rejects.toThrow(NotFoundException);
  });
});
