import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('file')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Request() body: { post_id?: number },
  ) {
    return this.uploadService.uploadFile(file, req.user.id, body.post_id);
  }

  @Get('file/:id')
  @ApiOperation({ summary: 'Get attachment info' })
  async getAttachment(@Param('id', ParseIntPipe) id: number) {
    const attachment = await this.uploadService.getAttachment(id);
    const url = await this.uploadService.getFileUrl(attachment.file_path);
    return { ...attachment, url };
  }

  @Get('file/:id/download')
  @ApiOperation({ summary: 'Download attachment' })
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const attachment = await this.uploadService.getAttachment(id);
    const url = await this.uploadService.getFileUrl(attachment.file_path);
    res.redirect(url);
  }

  @Delete('file/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete attachment' })
  async deleteFile(@Param('id', ParseIntPipe) id: number, @Request() req) {
    await this.uploadService.deleteFile(id, req.user.id);
    return { success: true };
  }
}
