// Simple API helper with mock fallback
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Support either NEXT_PUBLIC_API_BASE_URL or legacy NEXT_PUBLIC_API_URL env var
const _rawBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
export const API_BASE_URL = _rawBase.replace(/\/$/, '');
const API_PATH_PREFIX = (process.env.NEXT_PUBLIC_API_PATH_PREFIX || '').replace(/\/$/, '').replace(/^\/+/, '');

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: any;
  query?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  // allow opting out of automatic JSON content-type
  rawBody?: boolean;
}

export class ApiError extends Error {
  status: number;
  details?: any;
  code?: string;
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    if (details && typeof details === 'object') {
      if ('error' in details && typeof details.error === 'string') this.code = details.error;
      else if ('code' in details && typeof (details as any).code === 'string') this.code = (details as any).code;
    }
  }
}

function buildQuery(query?: Record<string, any>) {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    params.append(k, String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  // Ensure path begins with single leading slash
  let cleaned = path.startsWith('/') ? path : `/${path}`;
  // Optionally inject prefix (e.g. /api/v1)
  if (API_PATH_PREFIX) {
    cleaned = `/${API_PATH_PREFIX}${cleaned}`.replace(/\/+/g, '/');
  }
  const qs = buildQuery(options.query);
  const url = `${API_BASE_URL}${cleaned}${qs}`;

  const headers: Record<string, string> = options.headers ? { ...options.headers } : {};
  if (!options.rawBody) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    body = options.rawBody ? options.body : JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body,
    cache: 'no-store',
    credentials: 'include', // send cookies for session auth
    signal: options.signal,
  });

  // Try to parse JSON (even on error) but fall back gracefully
  let parsed: any = null;
  const text = await response.text().catch(() => '');
  if (text) {
    try { parsed = JSON.parse(text); } catch { parsed = text; }
  }

  if (!response.ok) {
    // If 404 and we used a prefix, attempt one retry without prefix (maybe misconfigured)
    if (response.status === 404 && API_PATH_PREFIX) {
      console.warn('[apiRequest] 404 with prefix, retrying without prefix', { url });
      try {
        const retryUrl = `${API_BASE_URL}${path.startsWith('/') ? path : '/' + path}${qs}`;
        const retryResp = await fetch(retryUrl, {
          method: options.method || 'GET',
          headers,
          body,
          cache: 'no-store',
          credentials: 'include',
          signal: options.signal,
        });
        let retryParsed: any = null;
        const retryText = await retryResp.text().catch(() => '');
        if (retryText) { try { retryParsed = JSON.parse(retryText); } catch { retryParsed = retryText; } }
        if (retryResp.ok) {
          if (retryParsed && typeof retryParsed === 'object' && 'data' in retryParsed) {
            return retryParsed.data as T;
          }
          return (retryParsed as T) ?? (undefined as unknown as T);
        } else {
          // Replace parsed/response with retry for error context
          parsed = retryParsed;
        }
      } catch (e) {
        // swallow; will fall through to regular error construction
      }
    }
    if (response.status === 404) {
      console.warn('[apiRequest] 404 Not Found', { url, method: options.method || 'GET' });
    } else if (response.status >= 500) {
      console.error('[apiRequest] Server error', { status: response.status, url });
    }
    let message: string | undefined;
    if (parsed && typeof parsed === 'object') {
      message = (parsed.message as string) || (parsed.error as string);
      if (!message && (parsed.error === 'VALIDATION_ERROR' || parsed.code === 'VALIDATION_ERROR')) {
        message = 'Some fields are invalid. Please review and correct highlighted inputs.';
      }
    }
    if (!message) {
      if (response.status === 404) {
        message = 'API endpoint not found';
      } else {
        message = `Request failed (${response.status})`;
      }
    }
    throw new ApiError(message, response.status, parsed);
  }

  // unwrap { data } envelope if present
  if (parsed && typeof parsed === 'object' && 'data' in parsed) {
    return parsed.data as T;
  }
  return (parsed as T) ?? (undefined as unknown as T);
}

// Helpers with mock fallbacks
export async function getWithMock<T>(path: string, mock: T, query?: Record<string, any>): Promise<T> {
  try { return await apiRequest<T>(path, { query }); } catch { return mock; }
}

export async function postWithMock<T>(path: string, body: any, mock: T): Promise<T> {
  try { return await apiRequest<T>(path, { method: 'POST', body }); } catch { return mock; }
}


