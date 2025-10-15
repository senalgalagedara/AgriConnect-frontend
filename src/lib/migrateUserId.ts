// Utility to migrate any persisted user object with string id -> numeric id
// Invoke early in app (e.g., in a client layout) if you previously cached user data in localStorage.
// Safe to run multiple times.

export function migratePersistedUserId(storageKey = 'auth:user') {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === 'string') {
      const numeric = parseInt(parsed.id, 10);
      if (!Number.isNaN(numeric)) {
        parsed.id = numeric;
        localStorage.setItem(storageKey, JSON.stringify(parsed));
        if (process.env.NODE_ENV !== 'production') {
          console.info('[migratePersistedUserId] converted string id to number');
        }
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[migratePersistedUserId] failed', e);
    }
  }
}
