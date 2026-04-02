import {
  Controller, Get, Put, Post, Body, Headers, Param,
  UnauthorizedException, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { NurseService } from './nurse.service';


@Controller('nurse')
export class NurseController {
  constructor(private readonly nurseService: NurseService) {}

  // Helper to extract userId from headers since auth isn't fully set up yet
  private getUserId(headers: Record<string, string>): string {
    const userId = headers['x-user-id'];
    if (!userId) {
      throw new UnauthorizedException('x-user-id header is missing');
    }
    return userId;
  }

  @Get('profile')
  async getProfile(@Headers() headers: Record<string, string>) {
    const userId = this.getUserId(headers);
    return this.nurseService.getProfile(userId);
  }

  @Get('profile/:id')
  async getPublicProfile(
    @Param('id') id: string,
    @Headers() headers: Record<string, string>
  ) {
    const viewerId = headers['x-user-id'];
    return this.nurseService.getPublicProfile(id, viewerId);
  }

  @Put('profile')
  async updateProfile(
    @Headers() headers: Record<string, string>,
    @Body() updateData: any,
  ) {
    const userId = this.getUserId(headers);
    return this.nurseService.updateProfile(userId, updateData);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx'];
        if (allowed.includes(extname(file.originalname).toLowerCase())) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF and Word documents are allowed!'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  async uploadResume(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = this.getUserId(headers);
    if (!file) throw new Error('No file provided');

    const fileRecord = {
      id: Date.now(),
      name: file.originalname,
      type: extname(file.originalname).slice(1).toUpperCase(),
      url: `/uploads/${file.filename}`,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    return this.nurseService.addDocument(userId, fileRecord);
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  async uploadAvatar(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = this.getUserId(headers);
    if (!file) throw new Error('No image provided');

    // Use absolute URL since backend is on 3001
    const imageUrl = `http://localhost:3001/uploads/${file.filename}`;
    
    return this.nurseService.updateAvatar(userId, imageUrl);
  }
}
