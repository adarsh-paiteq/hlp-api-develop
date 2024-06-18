import { Injectable } from '@nestjs/common';
import { StorageService } from './shared/services/storage/storage.service';

@Injectable()
export class AppService {
  constructor(private readonly storageService: StorageService) {}
  getHello(): string {
    return 'Hello World!';
  }
}
