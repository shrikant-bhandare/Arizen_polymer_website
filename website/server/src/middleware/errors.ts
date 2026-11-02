import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { logger } from '../logger';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export const notFound = (what = 'Resource') => new HttpError(404, `${what} not found`);

export const apiNotFound: RequestHandler = (_req, _res, next) => next(new HttpError(404, 'Endpoint not found'));

/**
 * One place that turns every failure into a safe JSON response. Validation
 * problems are explained field by field; unexpected errors never leak internals.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Please check the highlighted fields.',
      issues: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
    return;
  }
  if (err instanceof multer.MulterError) {
    const tooLarge = err.code === 'LIMIT_FILE_SIZE';
    res.status(tooLarge ? 413 : 400).json({ error: tooLarge ? 'The file is too large.' : 'The upload could not be processed.' });
    return;
  }
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'value';
    res.status(409).json({ error: `That ${field} is already in use.`, issues: [{ path: field, message: 'Already in use' }] });
    return;
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: 'Invalid identifier.' });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Malformed JSON body.' });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body is too large.' });
    return;
  }
  if (typeof err?.status === 'number' && err.status >= 400 && err.status < 500) {
    res.status(err.status).json({ error: err.status === 404 ? 'Not found' : 'Request could not be processed.' });
    return;
  }
  logger.error({ err, path: req.path }, 'unhandled error');
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};
