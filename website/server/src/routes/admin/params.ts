import { z } from 'zod';
import { HttpError } from '../../middleware/errors';

const objectId = z.string().regex(/^[a-f0-9]{24}$/i);

/** Validates a route id so malformed values never reach a query. */
export function idParam(value: unknown, what = 'Resource'): string {
  const parsed = objectId.safeParse(value);
  if (!parsed.success) throw new HttpError(404, `${what} not found`);
  return parsed.data;
}

const pageQuery = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export function pagination(query: unknown) {
  const { page, limit } = pageQuery.parse(query);
  return { page, limit, skip: (page - 1) * limit };
}

/** Escapes user text for safe use inside a RegExp search. */
export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
