/* eslint-disable no-console */
import * as dotenv from 'dotenv';
dotenv.config();
import { NodeSDK, NodeSDKConfiguration } from '@opentelemetry/sdk-node';
import process from 'process';
import { Resource } from '@opentelemetry/resources';
import * as SemanticAttributes from '@opentelemetry/semantic-conventions';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';

import packageJson from '../package.json';
import { EnvVariable, Environment } from './core/configs/config';

const nodeEnv = process.env[EnvVariable.NODE_ENV];
const isLocal = String(nodeEnv) === Environment.LOCAL;
const traceUrl = process.env[EnvVariable.OTEL_TRACE_URL];
const metricUrl = process.env[EnvVariable.OTEL_METRIC_URL];
const enableOTEL = process.env[EnvVariable.ENABLE_OTEL];

const traceExporter = new OTLPTraceExporter({ url: traceUrl });
const spanProcessor = isLocal
  ? new SimpleSpanProcessor(traceExporter)
  : new BatchSpanProcessor(traceExporter);

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({ url: metricUrl }),
});

const configuration: Partial<NodeSDKConfiguration> = {
  traceExporter,
  metricReader,
  spanProcessors: [spanProcessor],
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new GraphQLInstrumentation({
      allowValues: true,
    }),
    new PgInstrumentation({
      addSqlCommenterCommentToQueries: true,
    }),
    new IORedisInstrumentation({}),
    new WinstonInstrumentation({ disableLogSending: true }),
  ],
  resource: new Resource({
    [SemanticAttributes.SEMRESATTRS_SERVICE_NAME]: packageJson.name, // update this to a more relevant name for you!
    [SemanticAttributes.SEMRESATTRS_SERVICE_VERSION]: packageJson.version,
  }),
};

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
const otelSDK = new NodeSDK(configuration);
export function start(): void {
  if (enableOTEL) {
    otelSDK.start();
    console.log(`OTEL enabled`);
  }
}

//gracefully shut down the SDK on process exit
process.on('SIGTERM', () => {
  if (enableOTEL) {
    otelSDK
      .shutdown()
      .then(
        () => console.log('SDK shut down successfully'),
        (err) => console.log('Error shutting down SDK', err),
      )
      .finally(() => process.exit(0));
  }
});
