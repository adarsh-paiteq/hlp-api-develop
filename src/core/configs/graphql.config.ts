import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigService } from '@nestjs/config';
import { GqlModuleAsyncOptions } from '@nestjs/graphql';
import { join } from 'path';
import { Environment, EnvVariable } from './config';

export const graphqlConfig: GqlModuleAsyncOptions = {
  driver: ApolloDriver,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const nodeEnv = configService.get(EnvVariable.NODE_ENV);
    const isDev =
      nodeEnv === Environment.LOCAL || nodeEnv === Environment.DEVELOPMENT;
    const autoSchema = isDev ? join(process.cwd(), 'src/schema.graphql') : true;
    const options: ApolloDriverConfig = {
      path: '/v1/graphql',
      autoSchemaFile: autoSchema,
      debug: isDev,
      sortSchema: true,
      playground: isDev,
      csrfPrevention: true,
      persistedQueries: false,
      cache: 'bounded',
      cors: {
        origin: '*',
      },
      introspection: true,
      context: ({ req, res }) => ({ req, res }),
      subscriptions: {
        'graphql-ws': true,
      },
      buildSchemaOptions: {
        dateScalarMode: 'isoDate',
      },
    };
    return options;
  },
};
