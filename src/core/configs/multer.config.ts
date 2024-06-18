import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuid } from 'uuid';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const multerOptions: MulterOptions = {
  preservePath: true,
  storage: diskStorage({
    destination: path.join(__dirname, '../../../files/'),
    filename(req, file, callback) {
      const filename = `${uuid()}_${file.originalname}`;
      callback(null, filename);
    },
  }),
};
