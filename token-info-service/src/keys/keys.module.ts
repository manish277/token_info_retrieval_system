import { Module } from '@nestjs/common';
import { KeysCacheService } from './keys.service';

@Module({
  providers: [KeysCacheService],
  exports: [KeysCacheService],
})
export class KeysModule {}
