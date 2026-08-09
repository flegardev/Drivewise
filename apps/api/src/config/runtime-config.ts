export function resolveCorsOrigins(
  configuredOrigins: string | undefined,
  nodeEnv: string | undefined,
): string[] | '*' {
  const origins = (configuredOrigins ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    if (nodeEnv === 'production') {
      throw new Error('CORS_ORIGIN is required in production.');
    }
    return '*';
  }

  if (nodeEnv === 'production' && origins.includes('*')) {
    throw new Error('CORS_ORIGIN cannot contain "*" in production.');
  }

  return origins.map((origin) => {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new Error(`Invalid CORS origin: ${origin}`);
    }
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
      throw new Error(`Invalid CORS origin: ${origin}`);
    }
    return parsed.origin;
  });
}
