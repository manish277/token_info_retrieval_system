import { Controller, Get, Param, Headers } from '@nestjs/common';
import { TokensService } from './tokens.service';

@Controller('tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Get(':tokenId')
  async getToken(
    @Param('tokenId') tokenId: string,
    @Headers('x-api-key') apiKey: string,
  ) {
    return this.tokensService.getTokenInfo(tokenId, apiKey);
  }
}
