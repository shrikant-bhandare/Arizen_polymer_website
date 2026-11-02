/** Thin fetch wrapper: JSON in and out, CSRF header on writes, readable errors. */

export interface ApiIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues: ApiIssue[] = [],
    public details?: unknown,
  ) {
    super(message);
  }
}

function csrfToken(): string {
  return document.cookie.match(/(?:^|;\s*)arz_csrf=([^;]+)/)?.[1] ?? '';
}

async function request<T>(method: string, url: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const isForm = body instanceof FormData;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['x-csrf-token'] = csrfToken();

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : isForm ? body : JSON.stringify(body), credentials: 'same-origin', signal });
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    throw new ApiError(0, 'Could not reach the server. Please check your connection and try again.');
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const issues: ApiIssue[] = data.issues ?? data.details?.issues ?? [];
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, issues, data.details);
  }
  return data as T;
}

export const api = {
  get: <T>(url: string, signal?: AbortSignal) => request<T>('GET', url, undefined, signal),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
  patch: <T>(url: string, body?: unknown) => request<T>('PATCH', url, body),
  delete: <T = void>(url: string) => request<T>('DELETE', url),
};

/** Maps server validation issues onto a path → message lookup. */
export function issueMap(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError)) return {};
  return Object.fromEntries(err.issues.map((i) => [i.path, i.message]));
}
