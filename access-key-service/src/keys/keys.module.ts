import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KeysService } from './keys.service';
import { AccessKey, AccessKeySchema } from './key.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AccessKey.name, schema: AccessKeySchema }])],
  providers: [KeysService],
  exports: [KeysService],
})
export class KeysModule {}
