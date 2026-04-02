import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException, Delete } from '@nestjs/common';
import { ConversationsService } from './conversations.service';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Get('unread-count')
  getUnreadCount(@Headers() headers: Record<string, string>) {
    return this.conversationsService.getUnreadCount(this.getUserId(headers));
  }

  @Get()
  getConversations(@Headers() headers: Record<string, string>) {
    return this.conversationsService.getConversations(this.getUserId(headers));
  }

  @Get(':id/messages')
  getMessages(
    @Headers() headers: Record<string, string>,
    @Param('id') conversationId: string,
  ) {
    return this.conversationsService.getMessages(this.getUserId(headers), conversationId);
  }

  @Post(':id/messages')
  sendMessage(
    @Headers() headers: Record<string, string>,
    @Param('id') conversationId: string,
    @Body('content') content: string,
  ) {
    return this.conversationsService.sendMessage(this.getUserId(headers), conversationId, content);
  }

  @Post('private')
  getOrCreatePrivateConversation(
    @Headers() headers: Record<string, string>,
    @Body('targetUserId') targetUserId: string,
  ) {
    return this.conversationsService.getOrCreatePrivateConversation(
      this.getUserId(headers),
      targetUserId,
    );
  }

  @Delete(':id')
  remove(
    @Headers() headers: Record<string, string>,
    @Param('id') conversationId: string,
  ) {
    return this.conversationsService.deleteConversation(this.getUserId(headers), conversationId);
  }
}
