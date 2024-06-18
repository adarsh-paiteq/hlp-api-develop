import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  UseGuards,
} from '@nestjs/common';
import { DigidService } from './digid.service';
import { Public } from '@shared/decorators/public.decorator';
import {
  GetAccessTokenBody,
  GetAccessTokenResponse,
} from './dto/get-accesstoken.dto';
import {
  HandleCallbackQuery,
  HandleCallbackResponse,
} from './dto/callback.query.dto';
import { GetUser } from '@shared/decorators/user.decorator';
import { LoggedInUser } from '@shared/auth/jwt.strategy';
import { DigidAuthGuard } from '@shared/guards/digid-auth.guard';

@Controller('digid')
export class DigidController {
  constructor(private readonly digidService: DigidService) {}

  @Get('/verify')
  @UseGuards(DigidAuthGuard)
  @Public()
  @Redirect()
  async verify(@GetUser() user: LoggedInUser): Promise<{ url: string }> {
    return this.digidService.verify(user.id);
  }

  @Post('/token')
  async getAccessToken(
    @Body() body: GetAccessTokenBody,
  ): Promise<GetAccessTokenResponse> {
    return this.digidService.getAccessToken(body);
  }

  @Get('/callback')
  @Public()
  async handleCallback(
    @Query() query: HandleCallbackQuery,
  ): Promise<HandleCallbackResponse | string> {
    return this.digidService.handleCallback(query);
  }
}
