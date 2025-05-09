import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessKey, AccessKeyDocument, AccessKeyStatus } from './key.schema';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KeysService {
  constructor(
    @InjectModel(AccessKey.name) private accessKeyModel: Model<AccessKeyDocument>,
  ) {}

  async createKey(rateLimit: number, expiresAt: Date): Promise<AccessKey> {
    const key = uuidv4();
    const created = new this.accessKeyModel({
      key,
      rateLimit,
      expiresAt,
      status: AccessKeyStatus.ACTIVE,
    });
    return created.save();
  }

  async deleteKey(key: string): Promise<void> {
    const result = await this.accessKeyModel.deleteOne({ key });
    if (result.deletedCount === 0) {
      throw new NotFoundException('Key not found');
    }
  }

  async listKeys(): Promise<AccessKey[]> {
    return this.accessKeyModel.find().exec();
  }

  async updateKey(key: string, update: Partial<{ rateLimit: number; expiresAt: Date }>): Promise<AccessKey> {
    const updated = await this.accessKeyModel.findOneAndUpdate(
      { key },
      { $set: update },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Key not found');
    }
    return updated;
  }

  async getKey(key: string): Promise<AccessKey> {
    const found = await this.accessKeyModel.findOne({ key });
    if (!found) {
      throw new NotFoundException('Key not found');
    }
    return found;
  }

  async disableKey(key: string): Promise<AccessKey> {
    const updated = await this.accessKeyModel.findOneAndUpdate(
      { key },
      { $set: { status: AccessKeyStatus.DISABLED } },
      { new: true },
    );
    if (!updated) {
      throw new NotFoundException('Key not found');
    }
    return updated;
  }
}
