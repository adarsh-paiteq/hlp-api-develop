import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3ClientConfig, S3, PutObjectCommandInput } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';

export interface IUploadFile {
  body: Readable | Buffer;
  ext: string;
  mime: string;
  path?: string;
}
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3;
  constructor(private readonly configService: ConfigService) {
    this.init();
  }

  private getKeys(): {
    secretAccessKey: string;
    accessKeyId: string;
    region: string;
  } {
    const secretAccessKey: string = this.configService.get<string>(
      'AWS_SECRET',
    ) as string;
    const accessKeyId = this.configService.get<string>(
      'AWS_ACCESS_KEY',
    ) as string;
    const region = this.configService.get<string>('AWS_REGION') as string;
    return { secretAccessKey, accessKeyId, region };
  }

  private init(): void {
    const { region, secretAccessKey, accessKeyId } = this.getKeys();
    const config: S3ClientConfig = {
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };
    const s3 = new S3(config);
    this.s3 = s3;
  }

  async uploadFile(options: IUploadFile): Promise<{
    imageUrl: string;
    filePath: string;
    fileId: string;
  }> {
    const { filePath, fileId } = await this.upload(options);
    const baseUrl = this.configService.get<string>(
      'IMAGEKIT_BASE_URL',
    ) as string;
    const imageUrl = `${baseUrl}${filePath}`;
    return { imageUrl, filePath, fileId };
  }

  private async upload(options: IUploadFile): Promise<{
    filePath: string;
    fileId: string;
  }> {
    const bucket: string = this.configService.get<string>(
      'AWS_S3_BUCKET',
    ) as string;
    const fileId = nanoid(36);
    const { ext, mime, body, path } = options;
    let finalKey = '';
    if (path) {
      finalKey = path;
    }
    finalKey += `${fileId}.${ext}`;
    const putObject: PutObjectCommandInput = {
      Key: finalKey,
      Bucket: bucket,
      Body: body,
      ContentType: mime,
    };
    const upload = new Upload({
      client: this.s3,
      params: putObject,
      queueSize: 4, // optional concurrency configuration
      partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
      leavePartsOnError: false,
    });
    await upload.done();
    return { filePath: finalKey, fileId };
  }
}
