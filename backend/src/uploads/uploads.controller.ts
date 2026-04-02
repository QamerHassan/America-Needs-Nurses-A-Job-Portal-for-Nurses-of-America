import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

@Controller('uploads')
export class UploadsController {
  @Post()
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
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|pdf|doc|docx)$/i)) {
          return cb(new BadRequestException('Only image and document files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    // Return the relative URL of the uploaded file
    return {
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
    };
  }
  @Post('receipts')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'receipts'),
        filename: (req: any, file, cb) => {
          const userId = req.headers['x-user-id']?.toString() || 'unknown';
          const timestamp = Date.now();
          cb(null, `${userId}-${timestamp}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/i)) {
          return cb(new BadRequestException('Only JPG, PNG and PDF receipts are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
    }),
  )
  async uploadReceipt(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No receipt file provided');

    // Return the relative URL of the uploaded receipt
    return {
      url: `/uploads/receipts/${file.filename}`,
      filename: file.filename,
    };
  }
}
