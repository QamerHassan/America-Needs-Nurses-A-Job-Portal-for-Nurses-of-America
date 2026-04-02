import { Controller, Get, Post, Patch, Body, Param, Delete, Headers, UnauthorizedException, Query, BadRequestException } from '@nestjs/common';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Get()
  findAll(@Query() query: any) {
    return this.jobsService.findAll(query);
  }

  @Get('saved')
  getSavedJobs(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.jobsService.getSavedJobs(userId);
  }

  @Post('saved/:jobId')
  saveJob(
    @Headers() headers: Record<string, string>,
    @Param('jobId') jobId: string
  ) {
    const userId = this.getUserId(headers);
    return this.jobsService.saveJob(userId, jobId);
  }

  @Delete('saved/:id')
  deleteSavedJob(
    @Headers() headers: Record<string, string>,
    @Param('id') savedJobId: string
  ) {
    const userId = this.getUserId(headers);
    return this.jobsService.deleteSavedJob(userId, savedJobId);
  }

  @Get('recommended')
  getRecommendedJobs(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.jobsService.getRecommendedJobs(userId);
  }

  @Get('employer')
  async getEmployerJobs(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.jobsService.findAll({ ownerId: userId });
  }

  @Get('admin/list')
  findAllAdmin() {
    return this.jobsService.findAllAdmin();
  }

  @Post('admin/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.jobsService.updateStatus(id, status);
  }

  // ⚠️ WILDCARD — must be LAST among all @Get routes
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.jobsService.findOne(slug);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.jobsService.remove(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateJobDto: any
  ) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Post()
  async create(@Body() createJobDto: any) {
    try {
      return await this.jobsService.create(createJobDto);
    } catch (error: any) {
      console.error('Job Creation Controller Error:', error);
      throw new BadRequestException(error.message || 'Failed to create job');
    }
  }
}
