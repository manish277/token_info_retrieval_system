import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { KeysModule } from '../keys/keys.module';

@Module({
  imports: [KeysModule],
  providers: [TokensService],
  controllers: [TokensController]
})
export class TokensModule {}
