import { Controller, Get, Post, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { CommunityService } from './community.service';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  /**
   * Get the global nurse chat (creates if doesn't exist)
   */
  @Get('chat/global')
  async getGlobalChat(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    // Ensure the nurse is part of the chat
    return this.communityService.joinGlobalChat(userId);
  }

  /**
   * Get all community posts
   */
  @Get('posts')
  async getPosts(@Headers() headers: Record<string, string>) {
    this.getUserId(headers); // Validate user session
    return this.communityService.getCommunityPosts();
  }

  /**
   * Create a new community post
   */
  @Post('posts')
  async createPost(
    @Headers() headers: Record<string, string>,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const userId = this.getUserId(headers);
    return this.communityService.createPost(userId, title, content);
  }

  /**
   * Get post details including comments
   */
  @Get('posts/:id')
  async getPostDetails(
    @Headers() headers: Record<string, string>,
    @Param('id') id: string,
  ) {
    this.getUserId(headers); // Validate user session
    return this.communityService.getPostDetails(id);
  }
}
