import { resolveCorsOrigins } from './runtime-config';

describe('resolveCorsOrigins', () => {
  it('fails closed when production has no allowlist', () => {
    expect(() => resolveCorsOrigins(undefined, 'production')).toThrow(
      'CORS_ORIGIN is required in production',
    );
  });

  it('rejects a production wildcard', () => {
    expect(() => resolveCorsOrigins('*', 'production')).toThrow(
      'CORS_ORIGIN cannot contain "*" in production',
    );
  });

  it('normalizes an explicit comma-separated allowlist', () => {
    expect(
      resolveCorsOrigins(' https://dashboard.example.com/,http://localhost:5173 ', 'production'),
    ).toEqual(['https://dashboard.example.com', 'http://localhost:5173']);
  });
});
