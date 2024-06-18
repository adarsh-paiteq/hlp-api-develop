import { ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions } from '@nestjs/throttler';

const options: ThrottlerAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    ttl: config.get('THROTTLE_TTL'),
    limit: config.get('THROTTLE_LIMIT'),
  }),
};

export default options;
