import { Body, Controller, Post } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { UserChannelDto } from './dto/chats.dto';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('/test-create-chat')
  async addUserChatRecord(@Body() body: UserChannelDto): Promise<void> {
    return await this.chatsService.addUserChatRecord(body);
  }
}
