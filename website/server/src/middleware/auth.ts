import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { CookieOptions, NextFunction, Request, RequestHandler, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '../../../shared/schemas';
import { config } from '../config';
import { AdminUser } from '../models/AdminUser';
import { HttpError } from './errors';

export const SESSION_COOKIE = 'arz_session';
export const CSRF_COOKIE = 'arz_csrf';
export const CSRF_HEADER = 'x-csrf-token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

interface SessionClaims {
  sub: string;
  v: number;
}

const baseCookie: CookieOptions = { sameSite: 'strict', secure: config.isProd };

export function startSession(res: Response, userId: string, tokenVersion: number): string {
  const maxAge = config.SESSION_HOURS * 3600 * 1000;
  const token = jwt.sign({ sub: userId, v: tokenVersion } satisfies SessionClaims, config.JWT_SECRET, {
    expiresIn: `${config.SESSION_HOURS}h`,
    algorithm: 'HS256',
  });
  const csrf = randomBytes(32).toString('hex');
  // The session token is unreadable from JavaScript; the CSRF token is readable so the
  // dashboard can echo it in a header that a cross-site attacker cannot set.
  res.cookie(SESSION_COOKIE, token, { ...baseCookie, httpOnly: true, path: '/api', maxAge });
  res.cookie(CSRF_COOKIE, csrf, { ...baseCookie, httpOnly: false, path: '/', maxAge });
  return csrf;
}

export function endSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, { ...baseCookie, httpOnly: true, path: '/api' });
  res.clearCookie(CSRF_COOKIE, { ...baseCookie, path: '/' });
}

/** The signed-in user for this request, or null: checks the token, that the account is active and not revoked. */
export async function sessionUser(req: Request): Promise<AuthUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== 'string' || !token) return null;
  let claims: SessionClaims;
  try {
    claims = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] }) as unknown as SessionClaims;
  } catch {
    return null;
  }
  const user = await AdminUser.findById(claims.sub).lean();
  if (!user || !user.isActive || user.tokenVersion !== claims.v) return null;
  return { id: String(user._id), name: user.name, email: user.email, role: user.role as Role };
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const user = await sessionUser(req);
  if (!user) return next(new HttpError(401, 'Please sign in.'));
  req.user = user;
  next();
};

export const requireRole =
  (...allowed: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) return next(new HttpError(403, 'You do not have permission to do that.'));
    next();
  };

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** Double-submit CSRF check for every state-changing admin request. */
export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method)) return next();
  const cookie = req.cookies?.[CSRF_COOKIE];
  const header = req.get(CSRF_HEADER);
  if (typeof cookie !== 'string' || !header || cookie.length !== header.length || !timingSafeEqual(Buffer.from(cookie), Buffer.from(header))) {
    return next(new HttpError(403, 'Security check failed. Please refresh the page and try again.'));
  }
  next();
}
