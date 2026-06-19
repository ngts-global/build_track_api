const SENSITIVE_KEYS = new Set([
  'authorization',
  'apikey',
  'api_key',
  'password',
  'token',
  'accessToken',
  'access_token',
  'jwt',
  'secret',
]);

export function sanitizeForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForLog(item));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((accumulator, [key, entryValue]) => {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      accumulator[key] = '[REDACTED]';
      return accumulator;
    }

    accumulator[key] = sanitizeForLog(entryValue);
    return accumulator;
  }, {});
}

export function formatLogPayload(payload: Record<string, unknown>): string {
  return JSON.stringify(sanitizeForLog(payload), null, 2);
}
