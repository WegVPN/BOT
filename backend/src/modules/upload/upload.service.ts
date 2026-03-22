import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { Attachment } from '../../entities/attachment.entity';

@Injectable()
export class UploadService {
  private minioClient: Minio.Client;
  private bucket: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Attachment)
    private attachmentsRepository: Repository<Attachment>,
  ) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: parseInt(this.configService.get('MINIO_PORT') || '9000'),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });

    this.bucket = this.configService.get('MINIO_BUCKET') || 'forum-uploads';
    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucket);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucket);
      }
    } catch (error) {
      console.error('Error initializing MinIO bucket:', error);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId: number,
    postId?: number,
  ): Promise<Attachment> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${new Date().toISOString().split('T')[0]}/${fileName}`;

    try {
      await this.minioClient.putObject(this.bucket, filePath, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });

      const attachment = this.attachmentsRepository.create({
        file_path: filePath,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size: file.size,
        user_id: userId,
        post_id: postId,
      });

      return this.attachmentsRepository.save(attachment);
    } catch (error) {
      throw new BadRequestException('Failed to upload file');
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucket, filePath, 60 * 60 * 24); // 24 hours
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  async deleteFile(attachmentId: number, userId: number): Promise<void> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id: attachmentId, user_id: userId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    try {
      await this.minioClient.removeObject(this.bucket, attachment.file_path);
      await this.attachmentsRepository.delete(attachmentId);
    } catch (error) {
      throw new BadRequestException('Failed to delete file');
    }
  }

  async getAttachment(id: number): Promise<Attachment> {
    const attachment = await this.attachmentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async getAttachmentsByPost(postId: number): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      where: { post_id: postId },
    });
  }
}
