import { BadRequestException, Injectable } from '@nestjs/common';
import {
  IUploadFile,
  StorageService,
} from '../shared/services/storage/storage.service';
import * as fileType from 'file-type';
import ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fsp from 'fs/promises';
import { nanoid } from 'nanoid';
import { FilePath, UploadResponse, VideoUploadResponse } from './upload.dto';
import { videoFormats } from './video-formats';
import * as fs from 'fs';
import { ChatFileType } from '@chats/entities/chat-file-upload.entity';

@Injectable()
export class UploadsService {
  constructor(private readonly storageService: StorageService) {}

  async uploadAudio(file: Express.Multer.File): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException(`uploads.invalid_file_or_file_format`);
    }
    const audio = fs.createReadStream(file.path);
    const audioCopy = fs.createReadStream(file.path);
    const fileTypeResult = await fileType.fromStream(audioCopy);
    const allowedFormats = [
      'video/mp4',
      'audio/mpeg',
      'audio/MPA',
      'audio/mpa-robust',
      'audio/wave',
      'audio/wav',
      'audio/vnd.wave',
      'audio/x-wav',
    ];
    if (!fileTypeResult || !allowedFormats.includes(fileTypeResult.mime)) {
      throw new BadRequestException(`uploads.invalid_file_or_file_format`);
    }
    const options: IUploadFile = {
      body: audio,
      ext: fileTypeResult.ext,
      mime: fileTypeResult.mime,
      path: FilePath.AUDIO,
    };
    const { filePath, imageUrl, fileId } = await this.storageService.uploadFile(
      options,
    );
    await fsp.unlink(file.path);
    return { file_path: filePath, image_url: imageUrl, file_id: fileId };
  }

  private takeScreenshot(file: Express.Multer.File): Promise<string> {
    const folder = path.join(process.cwd(), './thumbnails');
    const filename = `${nanoid()}.png`;
    const thumbnailPath = `${folder}/${filename}`;
    return new Promise<string>((resolve, reject) => {
      try {
        ffmpeg(file.path)
          .screenshot({
            filename,
            folder,
            count: 1,
            timestamps: [0],
          })
          .on('end', () => {
            resolve(thumbnailPath);
          });
      } catch (error) {
        reject(error);
      }
    });
  }

  private async uploadThumbnail(
    file: Express.Multer.File,
  ): Promise<UploadResponse> {
    const thumbnailPath = await this.takeScreenshot(file);
    const thumbnail = fs.createReadStream(thumbnailPath);
    const thumbnailCopy = fs.createReadStream(thumbnailPath);
    const fileTypeResult = await fileType.fromStream(thumbnailCopy);
    if (!fileTypeResult) {
      throw new BadRequestException(`uploads.invalid_file_or_file_format`);
    }
    const options: IUploadFile = {
      body: thumbnail,
      ext: fileTypeResult.ext,
      mime: fileTypeResult.mime,
      path: FilePath.IMAGE,
    };
    const { filePath, imageUrl, fileId } = await this.storageService.uploadFile(
      options,
    );
    await fsp.unlink(thumbnailPath);
    return { file_id: fileId, file_path: filePath, image_url: imageUrl };
  }

  async uploadVideo(file: Express.Multer.File): Promise<VideoUploadResponse> {
    if (!file) {
      throw new BadRequestException(`uploads.file_required`);
    }
    const video = fs.createReadStream(file.path);
    const videoCopy = fs.createReadStream(file.path);
    const fileTypeResult = await fileType.fromStream(videoCopy);
    const allowedFormats = [
      'video/mp4',
      'video/x-matroska',
      'video/x-m4v',
    ].concat(videoFormats);
    if (!fileTypeResult || !allowedFormats.includes(fileTypeResult.mime)) {
      throw new BadRequestException(`uploads.invalid_file_or_file_format`);
    }
    const options: IUploadFile = {
      body: video,
      ext: fileTypeResult.ext,
      mime: fileTypeResult.mime,
      path: FilePath.VIDEO,
    };
    const [
      { filePath, imageUrl, fileId },
      {
        file_id: thumbnail_id,
        image_url: thumbnail_image_url,
        file_path: thumbnail_path,
      },
    ] = await Promise.all([
      this.storageService.uploadFile(options),
      this.uploadThumbnail(file),
    ]);
    await fsp.unlink(file.path);
    return {
      file_path: filePath,
      image_url: imageUrl,
      file_id: fileId,
      thumbnail_id,
      thumbnail_path,
      thumbnail_image_url,
    };
  }

  async uploadImage(file: Express.Multer.File): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException(`uploads.file_required`);
    }
    const image = fs.createReadStream(file.path);
    const imageCopy = fs.createReadStream(file.path);
    const fileTypeResult = await fileType.fromStream(imageCopy);
    const allowedFormats = [
      'image/jpeg',
      'image/gif',
      'image/png',
      'image/jpg',
    ];
    if (!fileTypeResult || !allowedFormats.includes(fileTypeResult.mime)) {
      throw new BadRequestException(`uploads.invalid_file_or_file_format`);
    }
    const options: IUploadFile = {
      body: image,
      ext: fileTypeResult.ext,
      mime: fileTypeResult.mime,
      path: FilePath.IMAGE,
    };
    const { filePath, imageUrl, fileId } = await this.storageService.uploadFile(
      options,
    );
    await fsp.unlink(file.path);
    return { file_path: filePath, image_url: imageUrl, file_id: fileId };
  }

  async uploadDocument(file: Express.Multer.File): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException(`uploads.file_required`);
    }
    const document = fs.createReadStream(file.path);
    const documentCopy = fs.createReadStream(file.path);
    let fileTypeResult;
    if (file.mimetype !== 'text/plain') {
      fileTypeResult = await fileType.fromStream(documentCopy);
      const allowedFormats = [
        'application/pdf',
        'text/plain',
        'application/vnd.ms-excel',
        'application/msword',
        'application/x-cfb',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!fileTypeResult || !allowedFormats.includes(fileTypeResult.mime)) {
        throw new BadRequestException(`uploads.invalid_file_or_file_format`);
      }
    }

    const isPlainText = file.mimetype === 'text/plain';
    const options: IUploadFile = {
      body: document,
      ext: isPlainText ? 'txt' : fileTypeResult?.ext ?? '',
      mime: isPlainText ? 'text/plain' : fileTypeResult?.mime ?? '',
      path: FilePath.DOCUMENT,
    };
    const { filePath, imageUrl, fileId } = await this.storageService.uploadFile(
      options,
    );
    await fsp.unlink(file.path);
    return { file_path: filePath, image_url: imageUrl, file_id: fileId };
  }

  async uploadChatAttachments(
    file: Express.Multer.File,
    chatFileType: ChatFileType,
  ): Promise<UploadResponse> {
    if (chatFileType === ChatFileType.IMAGE) {
      return await this.uploadImage(file);
    }
    if (chatFileType === ChatFileType.VIDEO) {
      return await this.uploadVideo(file);
    }
    if (chatFileType === ChatFileType.DOCUMENT) {
      return await this.uploadDocument(file);
    }
    throw new BadRequestException(`uploads.file_type_required`);
  }

  async base64ToFile(
    base64: string,
    filename: string,
    mimeType: string,
  ): Promise<Express.Multer.File> {
    const buffer = Buffer.from(base64, 'base64');
    const filePath = path.join(__dirname, '../../files', filename);

    // Ensure the uploads directory exists
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    // Write the buffer to a file
    fs.writeFileSync(filePath, buffer);

    // Create an Express.Multer.File object
    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: filename,
      encoding: '7bit',
      mimetype: mimeType,
      destination: path.dirname(filePath),
      filename: path.basename(filePath),
      path: filePath,
      size: buffer.length,
      buffer: buffer,
      stream: fs.createReadStream(filePath),
    };

    return file;
  }
}
