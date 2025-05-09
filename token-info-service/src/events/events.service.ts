import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { KeysCacheService, CachedKey } from '../keys/keys.service';

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private redisSubscriber: Redis;
  private readonly channel = 'access-key-events';

  constructor(private readonly keysCacheService: KeysCacheService) {}

  onModuleInit() {
    this.redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.redisSubscriber.subscribe(this.channel, (err) => {
      if (err) {
        console.error('Failed to subscribe to Redis channel', err);
      }
    });
    this.redisSubscriber.on('message', async (channel, message) => {
      if (channel === this.channel) {
        try {
          const { event, payload } = JSON.parse(message);
          if (event === 'created' || event === 'updated') {
            await this.keysCacheService.setKey(payload as CachedKey);
          } else if (event === 'deleted') {
            await this.keysCacheService.deleteKey(payload.key);
          }
        } catch (e) {
          console.error('Error processing key event:', e);
        }
      }
    });
  }

  onModuleDestroy() {
    if (this.redisSubscriber) {
      this.redisSubscriber.disconnect();
    }
  }
}
