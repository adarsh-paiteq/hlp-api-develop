import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const OAuth = (): CustomDecorator<string> =>
  SetMetadata('isOauth', true);
