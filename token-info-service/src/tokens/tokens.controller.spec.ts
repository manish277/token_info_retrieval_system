import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as request from 'supertest';
import { TokensController } from './tokens.controller';
import { TokensService } from './tokens.service';

describe('TokensController (e2e)', () => {
  let app: INestApplication;
  let tokensService: TokensService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TokensController],
      providers: [
        {
          provide: TokensService,
          useValue: {
            getTokenInfo: jest.fn().mockImplementation((tokenId, apiKey) => {
              if (!apiKey) throw new ForbiddenException('Invalid API key');
              if (tokenId === 'eth') return { id: 'eth', name: 'Ethereum', price: 3500 };
              throw new NotFoundException('Token not found');
            }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    tokensService = moduleRef.get<TokensService>(TokensService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /tokens/:tokenId returns token info for valid key', async () => {
    return request(app.getHttpServer())
      .get('/tokens/eth')
      .set('x-api-key', 'test-key')
      .expect(200)
      .expect({ id: 'eth', name: 'Ethereum', price: 3500 });
  });

  it('GET /tokens/:tokenId returns 403 for missing API key', async () => {
    return request(app.getHttpServer())
      .get('/tokens/eth')
      .expect(403);
  });

  it('GET /tokens/:tokenId returns 404 for unknown token', async () => {
    return request(app.getHttpServer())
      .get('/tokens/unknown')
      .set('x-api-key', 'test-key')
      .expect(404);
  });
});
