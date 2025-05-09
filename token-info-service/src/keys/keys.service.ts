import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

export interface CachedKey {
  key: string;
  rateLimit: number;
  expiresAt: string;
  status: string;
}

@Injectable()
export class KeysCacheService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;
  private readonly prefix = 'api-key:';

  onModuleInit() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  onModuleDestroy() {
    if (this.redis) {
      this.redis.disconnect();
    }
  }

  async setKey(key: CachedKey) {
    await this.redis.set(this.prefix + key.key, JSON.stringify(key));
  }

  async updateKey(key: CachedKey) {
    await this.setKey(key);
  }

  async deleteKey(key: string) {
    await this.redis.del(this.prefix + key);
  }

  async getKey(key: string): Promise<CachedKey | null> {
    const data = await this.redis.get(this.prefix + key);
    return data ? JSON.parse(data) : null;
  }
}
