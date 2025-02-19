import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('upload')
export class UploadController {
  @Post('single')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now();
          const ext = extname(file.originalname);
          const filename = `${file.originalname?.replace(ext, '')}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file, 'file');

    return {
      message: 'File uploaded successfully',
      file: `${file.filename}`,
    };
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now();
          const ext = extname(file.originalname);
          const filename = `${file.originalname?.replace(ext, '')}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  uploadMultipleFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    return {
      message: 'Files uploaded successfully',
      files: files?.map((file) => {
        return file.filename;
      }),
    };
  }
}
