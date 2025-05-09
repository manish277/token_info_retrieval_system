import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AccessKeyDocument = AccessKey & Document;

export enum AccessKeyStatus {
  ACTIVE = 'active',
  DISABLED = 'disabled',
}

@Schema({ timestamps: true })
export class AccessKey {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  rateLimit: number; // requests per minute

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true, enum: AccessKeyStatus, default: AccessKeyStatus.ACTIVE })
  status: AccessKeyStatus;
}

export const AccessKeySchema = SchemaFactory.createForClass(AccessKey); 