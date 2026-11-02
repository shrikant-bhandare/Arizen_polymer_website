import mongoose from 'mongoose';
import { createApp } from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './db';
import { logger } from './logger';

async function main() {
  await connectDatabase();
  // In production autoIndex is off; build the declared indexes once at startup instead.
  if (config.isProd) await Promise.all(Object.values(mongoose.models).map((m) => m.createIndexes()));

  const server = createApp().listen(config.PORT, () => {
    logger.info(`Arizen Polymers server listening on http://localhost:${config.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'shutting down');
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal({ err }, 'server failed to start');
  process.exit(1);
});
