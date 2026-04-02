import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('uploads')
export class StorageController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, cb) => {
          const unique = uuidv4();
          const ext = extname(file.originalname);
          cb(null, `${unique}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|svg|pdf)$/i;
        if (!allowed.test(file.originalname)) {
          return cb(new BadRequestException('Only image and PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
    };
  }
}
