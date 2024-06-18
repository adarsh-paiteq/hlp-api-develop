import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
const jwtOptions: JwtModuleAsyncOptions = {
  useFactory: async (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
  }),
  inject: [ConfigService],
};
export default jwtOptions;
