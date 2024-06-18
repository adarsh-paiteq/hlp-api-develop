import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../shared/guards/auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';

import { UserRoles } from '../users/users.dto';
import {
  UploadChatAttachmentsDTO,
  UploadResponse,
  VideoUploadResponse,
} from './upload.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('/audio')
  @Roles(UserRoles.ADMIN, UserRoles.CONTENT_EDITOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    return this.uploadsService.uploadAudio(file);
  }

  @Post('/video')
  @Roles(UserRoles.ADMIN, UserRoles.USER, UserRoles.CONTENT_EDITOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(
    @UploadedFile()
    file: Express.Multer.File,
  ): Promise<VideoUploadResponse> {
    return this.uploadsService.uploadVideo(file);
  }

  @Post('/image')
  @Roles(UserRoles.ADMIN, UserRoles.USER, UserRoles.CONTENT_EDITOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    return this.uploadsService.uploadImage(file);
  }

  @Post('/profile/pic')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfilePic(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    return this.uploadsService.uploadImage(file);
  }

  @Post('/upload/chat/attachments')
  @Roles(UserRoles.DOCTOR, UserRoles.USER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadChatAttachments(
    @UploadedFile()
    file: Express.Multer.File,
    @Body() uploadChatAttachmentsDTO: UploadChatAttachmentsDTO,
  ): Promise<UploadResponse> {
    return await this.uploadsService.uploadChatAttachments(
      file,
      uploadChatAttachmentsDTO.chatFileType,
    );
  }
}
