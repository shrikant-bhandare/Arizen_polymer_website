import pino from 'pino';
import { config } from './config';

export const logger = pino({
  level: config.isTest ? 'silent' : config.LOG_LEVEL,
  redact: { paths: ['req.headers.cookie', 'req.headers.authorization', 'password', '*.password', '*.passwordHash'], censor: '[redacted]' },
});
