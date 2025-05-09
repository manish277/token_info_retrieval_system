import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { KeysService } from '../../keys/keys.service';
import { EventsService } from '../../events/events.service';

class CreateKeyDto {
  rateLimit: number;
  expiresAt: Date;
}

class UpdateKeyDto {
  rateLimit?: number;
  expiresAt?: Date;
}

@Controller('admin/keys')
export class AdminKeysController {
  constructor(
    private readonly keysService: KeysService,
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  async createKey(@Body() dto: CreateKeyDto) {
    const key = await this.keysService.createKey(dto.rateLimit, dto.expiresAt);
    await this.eventsService.publishKeyEvent('created', key);
    return key;
  }

  @Delete(':key')
  async deleteKey(@Param('key') key: string) {
    await this.keysService.deleteKey(key);
    await this.eventsService.publishKeyEvent('deleted', { key });
    return { message: 'Key deleted' };
  }

  @Get()
  async listKeys() {
    return this.keysService.listKeys();
  }

  @Patch(':key')
  async updateKey(@Param('key') key: string, @Body() dto: UpdateKeyDto) {
    const updated = await this.keysService.updateKey(key, dto);
    await this.eventsService.publishKeyEvent('updated', updated);
    return updated;
  }
}
