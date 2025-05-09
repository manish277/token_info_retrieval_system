import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { KeysModule } from '../keys/keys.module';

@Module({
  imports: [KeysModule],
  providers: [EventsService]
})
export class EventsModule {}
