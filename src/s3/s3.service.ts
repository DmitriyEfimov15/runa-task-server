import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { S3_ACCESS_KEY, S3_BUCKET_NAME, S3_SECRET_KEY, S3_URL } from 'src/constants/env';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;
  private baseUrl: string;

  constructor() {
    this.bucket = S3_BUCKET_NAME ?? '';
    this.baseUrl = S3_URL ?? '';

    this.s3 = new S3Client({
      region: 'spb',
      endpoint: this.baseUrl,
      credentials: {
        accessKeyId: S3_ACCESS_KEY ?? '',
        secretAccessKey: S3_SECRET_KEY ?? '',
      },
      forcePathStyle: true,
    });
  }

  async upload(buffer: Buffer, key: string, contentType: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `${this.baseUrl}/${this.bucket}/${key}`;
  }

  async getAvatarUrl(key: string, expiresIn = 300): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }
}
