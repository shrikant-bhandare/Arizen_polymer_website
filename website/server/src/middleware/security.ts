import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { config } from '../config';
import { HttpError } from './errors';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      // Animation libraries set inline style attributes; no inline <style> or scripts are used.
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'media-src': ["'self'"],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-src': ['https://www.google.com', 'https://maps.google.com'],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'upgrade-insecure-requests': config.isProd ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  strictTransportSecurity: config.isProd ? { maxAge: 31536000, includeSubDomains: true } : false,
});

const json = (message: string) => ({ error: message });

/** Broad ceiling for every API call from one address. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: json('Too many requests. Please slow down and try again shortly.'),
});

/** Inquiry submissions: generous for real buyers, tight for bots. */
export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: config.INQUIRY_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: json('Too many inquiries from this connection. Please try again later or contact us by phone or email.'),
});

/** Sign-in attempts per address, to slow password guessing. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.LOGIN_RATE_LIMIT,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: json('Too many sign-in attempts. Please wait 15 minutes and try again.'),
});

/** JSON endpoints only accept JSON, which also blocks simple cross-site form posts. */
export const requireJson: RequestHandler = (req, _res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.is('application/json')) {
    return next(new HttpError(415, 'Content-Type must be application/json.'));
  }
  next();
};
