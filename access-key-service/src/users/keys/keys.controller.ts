import { Controller, Get, Param, Patch } from '@nestjs/common';
import { KeysService } from '../../keys/keys.service';
import { EventsService } from '../../events/events.service';

@Controller('users/keys')
export class UsersKeysController {
  constructor(
    private readonly keysService: KeysService,
    private readonly eventsService: EventsService,
  ) {}

  @Get(':key')
  async getKey(@Param('key') key: string) {
    return this.keysService.getKey(key);
  }

  @Patch(':key/disable')
  async disableKey(@Param('key') key: string) {
    const updated = await this.keysService.disableKey(key);
    await this.eventsService.publishKeyEvent('updated', updated);
    return updated;
  }
}
