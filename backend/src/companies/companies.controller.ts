import { Controller, Get, Post, Body, Param, Delete, Headers, UnauthorizedException, Res } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @Get('saved')
  getSavedCompanies(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.companiesService.getSavedCompanies(userId);
  }

  @Delete('saved/:id')
  deleteSavedCompany(
    @Headers() headers: Record<string, string>,
    @Param('id') savedCompanyId: string
  ) {
    const userId = this.getUserId(headers);
    return this.companiesService.deleteSavedCompany(userId, savedCompanyId);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.companiesService.findOne(slug);
  }

  @Post()
  create(@Body() createCompanyDto: any) {
    return this.companiesService.create(createCompanyDto);
  }

  @Post(':id/reviews')
  addReview(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
    @Body() reviewData: any
  ) {
    const userId = this.getUserId(headers);
    return this.companiesService.addReview(id, userId, reviewData);
  }
  @Get('admin/list')
  findAllAdmin() {
    return this.companiesService.findAllAdmin();
  }

  @Get('admin/:id')
  async getAdminCompany(@Param('id') id: string, @Res() res: any) {
    const company = await this.companiesService.findOneAdmin(id);
    return res.json(company ?? null);
  }

  @Post('admin/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string
  ) {
    return this.companiesService.updateStatus(id, status);
  }

  @Post('admin/:id/toggle-featured')
  toggleFeatured(@Param('id') id: string) {
    return this.companiesService.toggleFeatured(id);
  }

  @Delete('admin/:id')
  deleteAdminCompany(@Param('id') id: string) {
    return this.companiesService.deleteCompanyAdmin(id);
  }
}
