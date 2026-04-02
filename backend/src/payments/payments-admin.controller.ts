import { Controller, Get, Patch, Param, Headers, Query, UnauthorizedException, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from './payments.service';
import { Role } from '@prisma/client';

@Controller('admin/payments')
export class PaymentsAdminController {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
  ) {}

  private async validateAdmin(headers: Record<string, string>) {
    const adminId = headers['x-user-id'];
    if (!adminId) throw new UnauthorizedException('x-user-id header is missing');

    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true, name: true }
    });

    if (!admin || !([Role.SUPER_ADMIN, Role.SUPPORT_ADMIN] as any).includes(admin.role)) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return admin;
  }

  @Get()
  async getAllPayments(
    @Headers() headers: Record<string, string>,
    @Query('status') status?: string,
  ) {
    await this.validateAdmin(headers);
    const transactions = await this.paymentsService.getAdminPayments(status);
    return {
      total: transactions.length,
      data: transactions
    };
  }

  @Patch(':id/verify')
  async verifyPayment(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
    @Body() body: { note?: string }
  ) {
    const admin = await this.validateAdmin(headers);
    return this.paymentsService.verifyPayment(id, admin.name || admin.id, 'SUCCESS', body.note);
  }

  @Patch(':id/reject')
  async rejectPayment(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>,
    @Body() body: { note?: string }
  ) {
    const admin = await this.validateAdmin(headers);
    return this.paymentsService.verifyPayment(id, admin.name || admin.id, 'FAILED', body.note);
  }
}
