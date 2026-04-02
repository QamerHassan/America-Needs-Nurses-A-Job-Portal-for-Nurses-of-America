import { Controller, Get, Post, Body, Delete, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Post()
  async applyToJob(
    @Headers() headers: Record<string, string>,
    @Body() body: { jobId: string; coverLetter?: string; resumeUrl?: string; experience?: any }
  ) {
    const userId = this.getUserId(headers);
    return this.applicationsService.applyToJob(
      userId,
      body.jobId,
      body.coverLetter,
      body.resumeUrl,
      body.experience
    );
  }

  @Get('me')
  async getMyApplications(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.applicationsService.getMyApplications(userId);
  }

  @Delete(':id')
  async deleteApplication(
    @Headers() headers: Record<string, string>,
    @Param('id') applicationId: string,
  ) {
    const userId = this.getUserId(headers);
    return this.applicationsService.deleteApplication(userId, applicationId);
  }

  @Get('employer')
  async getEmployerApplications(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.applicationsService.getEmployerApplications(userId);
  }

  @Post(':id/status')
  async updateStatus(
    @Headers() headers: Record<string, string>,
    @Param('id') applicationId: string,
    @Body('status') status: any,
  ) {
    const userId = this.getUserId(headers);
    return this.applicationsService.updateStatus(applicationId, status, userId);
  }
}
