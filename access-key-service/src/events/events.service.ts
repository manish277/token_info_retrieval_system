import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class EventsService implements OnModuleInit, OnModuleDestroy {
  private redisPublisher: Redis;
  private readonly channel = 'access-key-events';

  onModuleInit() {
    this.redisPublisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  onModuleDestroy() {
    if (this.redisPublisher) {
      this.redisPublisher.disconnect();
    }
  }

  async publishKeyEvent(event: 'created' | 'updated' | 'deleted', payload: any) {
    await this.redisPublisher.publish(this.channel, JSON.stringify({ event, payload }));
  }
}
