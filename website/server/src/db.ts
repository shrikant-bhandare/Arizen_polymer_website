import mongoose from 'mongoose';
import { config } from './config';
import { logger } from './logger';

// Strip $-operators from query filters built from user input (NoSQL injection guard),
// and reject filter fields that are not in the schema.
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

let memoryServer: { stop: () => Promise<boolean> } | undefined;

/**
 * Connects to MongoDB. MONGODB_URI=memory starts a throwaway in-process
 * database (development and tests only); anything else is a normal URI.
 */
export async function connectDatabase(uri = config.MONGODB_URI): Promise<void> {
  if (uri === 'memory') {
    if (config.isProd) throw new Error('MONGODB_URI=memory is not allowed in production.');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const server = await MongoMemoryServer.create();
    memoryServer = server;
    uri = server.getUri('arizen');
  }
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, autoIndex: !config.isProd });
  logger.info({ db: mongoose.connection.name }, 'database connected');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  await memoryServer?.stop();
  memoryServer = undefined;
}
