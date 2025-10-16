// Simple runtime diagnostics for API config
import { API_BASE_URL } from './api';

const API_PATH_PREFIX = (process.env.NEXT_PUBLIC_API_PATH_PREFIX || '').replace(/\/$/, '');

export function logApiDiagnostics() {
  if (typeof window === 'undefined') return;
  console.table({
    API_BASE_URL,
    API_PATH_PREFIX: API_PATH_PREFIX || '(none)',
    locationOrigin: window.location.origin,
    sameOrigin: window.location.origin.startsWith(API_BASE_URL)
  });
  console.info('[diagnostics] If sameOrigin=false you need proper CORS configuration.');
}
