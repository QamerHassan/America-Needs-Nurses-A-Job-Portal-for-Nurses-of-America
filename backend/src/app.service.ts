import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Welcome to ANN API';
  }

  async getStats() {
    const [nurseCount, jobCount, companyCount] = await Promise.all([
      this.prisma.user.count({ where: { role: 'NURSE' } }),
      this.prisma.job.count({ where: { status: { in: ['APPROVED', 'PENDING'] } } }),
      this.prisma.company.count({ where: { status: 'APPROVED' } }),
    ]);

    return {
      nurses: nurseCount,
      jobs: jobCount,
      companies: companyCount,
    };
  }
}
