import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Post()
  async createReport(
    @Headers() headers: Record<string, string>,
    @Body() body: {
      category: string;
      message: string;
      reportedUserId?: string;
      jobId?: string;
      companyId?: string;
      postId?: string;
    }
  ) {
    if (!body.category || !body.message) {
      throw new Error('Category and message are required');
    }
    
    // Some reports may be anonymous if x-user-id is not provided, 
    // but the schema requires reportedById, so we enforce it here:
    const reporterId = this.getUserId(headers);

    return this.reportsService.createReport({
      ...body,
      reportedById: reporterId,
    });
  }
}
