import { Test, TestingModule } from '@nestjs/testing';
import { AdminKeysController } from './keys.controller';

describe('AdminKeysController', () => {
  let controller: AdminKeysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminKeysController],
    }).compile();

    controller = module.get<AdminKeysController>(AdminKeysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
