import { Injectable, Inject, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { KeysCacheService, CachedKey } from '../keys/keys.service';
import Redis from 'ioredis';

@Injectable()
export class TokensService {
  private redis: Redis;
  constructor(private readonly keysCache: KeysCacheService) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async validateKeyOrThrow(key: string): Promise<CachedKey> {
    const cached = await this.keysCache.getKey(key);
    if (!cached) throw new ForbiddenException('Invalid API key');
    if (cached.status !== 'active') throw new ForbiddenException('Key is not active');
    if (new Date(cached.expiresAt) < new Date()) throw new ForbiddenException('Key expired');
    return cached;
  }

  async checkRateLimitOrThrow(key: string, rateLimit: number) {
    const rlKey = `ratelimit:${key}`;
    const count = await this.redis.incr(rlKey);
    if (count === 1) {
      await this.redis.expire(rlKey, 60);
    }
    if (count > rateLimit) {
      throw new BadRequestException('Rate limit exceeded');
    }
  }

  async logRequest(key: string, tokenId: string, success: boolean) {
    const logKey = `log:${key}`;
    const entry = JSON.stringify({ tokenId, timestamp: new Date().toISOString(), success });
    await this.redis.lpush(logKey, entry);
    await this.redis.ltrim(logKey, 0, 99); // keep last 100
  }

  async getTokenInfo(tokenId: string, apiKey: string) {
    const key = await this.validateKeyOrThrow(apiKey);
    await this.checkRateLimitOrThrow(apiKey, key.rateLimit);
    // Mock token info
    const token = this.mockToken(tokenId);
    const success = !!token;
    await this.logRequest(apiKey, tokenId, success);
    if (!token) throw new NotFoundException('Token not found');
    return token;
  }

  mockToken(tokenId: string) {
    // Mock some tokens
    const tokens = {
      'eth': { id: 'eth', name: 'Ethereum', price: 3500 },
      'btc': { id: 'btc', name: 'Bitcoin', price: 65000 },
      'usdt': { id: 'usdt', name: 'Tether', price: 1 },
    };
    return tokens[tokenId] || null;
  }
}
