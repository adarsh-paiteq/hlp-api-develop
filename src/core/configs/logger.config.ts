import * as winston from 'winston';
import { WinstonModule, utilities } from 'nest-winston';
import packageJson from '../../../package.json';
import { Environment } from './config';

function isDevelopment(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const isProd = String(nodeEnv) === Environment.LOCAL;
  return isProd;
}

function getTransports(): winston.transports.ConsoleTransportInstance[] {
  const appName = 'Hlp';
  const isDev = isDevelopment();
  const transports = [];
  const formats = [
    // tracingFormat(),
    winston.format.timestamp(),
    winston.format.ms(),
    utilities.format.nestLike(appName, {
      prettyPrint: isDev,
      colors: isDev,
    }),
  ];
  if (!isDev) {
    formats.push(winston.format.json());
  }
  const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(...formats),
  });
  transports.push(consoleTransport);
  return transports;
}

export const getLogger = () => {
  const transports = getTransports();
  return WinstonModule.createLogger({
    transports,
    defaultMeta: { service: packageJson.name, version: packageJson.version },
  });
};
