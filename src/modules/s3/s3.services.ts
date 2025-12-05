import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    } as S3ClientConfig);
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET') ?? '';
  }

  async uploadBuffer(
    fileName: string,
    file: Express.Multer.File,
  ): Promise<boolean> {
    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(putObjectCommand);
    return true;
  }

  async getSignedUrl(fileName: string): Promise<string> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    });

    return await getSignedUrl(this.s3, getObjectCommand, {
      expiresIn: 3600,
    });
  }

  async getFileWithMetadata(fileName: string): Promise<{
    buffer: Buffer;
  } | null> {
    const getObjectCommand = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileName,
    });

    const response = await this.s3.send(getObjectCommand);
    if (!response.Body) return null;

    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    return { buffer };
  }
}
