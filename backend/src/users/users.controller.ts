import { Controller, Post, Body, Get, Param, Put, Patch, Headers, UnauthorizedException, ConflictException, BadRequestException, InternalServerErrorException, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Post('register')
  async register(@Body() userData: any) {
    try {
      const user = await this.usersService.create(userData);
      return {
        access_token: 'dev-token-' + user.id,
        user
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw new InternalServerErrorException(error.message || 'Registration failed');
    }
  }

  @Post('login')
  async login(@Body() loginData: any) {
    const user = await this.usersService.findByEmail(loginData.email);
    if (!user || user.password !== loginData.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      access_token: 'dev-token-' + user.id,
      user
    };
  }

  @Post('google-login')
  async googleLogin(@Body('idToken') idToken: string) {
    if (!idToken) throw new BadRequestException('ID Token is required');
    const user = await this.usersService.findOrCreateByGoogle(idToken);
    return {
      access_token: 'dev-token-' + user.id,
      user
    };
  }

  @Put('change-password')
  async changePassword(
    @Headers() headers: Record<string, string>,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    const userId = this.getUserId(headers);
    return this.usersService.changePassword(userId, body.oldPassword, body.newPassword);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.usersService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    if (!body.token || !body.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    return this.usersService.resetPassword(body.token, body.newPassword);
  }

  @Get('dashboard/:id')
  async getDashboard(@Param('id') id: string) {
    return this.usersService.getDashboardData(id);
  }

  @Get('admin/nurses')
  async findAllNurses() {
    return this.usersService.findAllNurses();
  }

  @Get('admin/admins')
  async findAllAdmins() {
    return this.usersService.findAllAdmins();
  }

  @Get(':email')
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post('admin/:id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: any) {
    return this.usersService.updateRole(id, role);
  }

  @Post('admin/:id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.usersService.updateStatus(id, status);
  }

  @Patch(':id/employer-profile')
  async updateEmployerProfile(@Param('id') id: string, @Body() data: any) {
    return this.usersService.updateEmployerProfile(id, data);
  }

  @Post('delete')
  async deleteUser(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.usersService.deleteUser(userId);
  }

  @Delete('admin/:id')
  async deleteUserByAdmin(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
