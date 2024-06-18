import { Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadsController } from './uploads.controller';
import { StorageService } from '../shared/services/storage/storage.service';
import { AuthModule } from '../shared/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerOptions } from '../core/configs/multer.config';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, StorageService],
  imports: [AuthModule, MulterModule.register(multerOptions)],
  exports: [UploadsService, StorageService],
})
export class UploadsModule {}
