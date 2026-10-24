import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveApiBaseUrl, describeApiError } from '../src/services/api-config.js';

test('production uses the same-origin proxy even with a stale Vercel API variable', () => {
  for (const configuredUrl of [undefined, '', 'https://hcm-api.vercel.app/', 'https://hcm-api.vercel.app/api']) {
    assert.equal(resolveApiBaseUrl({ production: true, configuredUrl }), '/api');
  }
});
test('development accepts a backend origin or canonical API URL without duplicate api segments', () => {
  assert.equal(resolveApiBaseUrl({}), '/api');
  assert.equal(resolveApiBaseUrl({ configuredUrl: ' https://hcm-api.vercel.app/ ' }), 'https://hcm-api.vercel.app/api');
  assert.equal(resolveApiBaseUrl({ configuredUrl: 'https://hcm-api.vercel.app/api/' }), 'https://hcm-api.vercel.app/api');
  assert.equal(resolveApiBaseUrl({ configuredUrl: '/api' }), '/api');
});
test('Vercel sends API requests to Express before applying the SPA fallback', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
  assert.deepEqual(config.rewrites[0], { source: '/api/:path*', destination: 'https://hcm-api.vercel.app/api/:path*' });
  assert.equal(config.rewrites.at(-1).destination, '/index.html');
});
test('server failures are distinguished from connectivity and timeout errors', () => {
  assert.match(describeApiError({ response: { status: 500, data: 'FUNCTION_INVOCATION_FAILED' } }), /backend is unavailable/);
  assert.match(describeApiError({ code: 'ERR_NETWORK' }), /Cannot reach the API/);
  assert.match(describeApiError({ code: 'ECONNABORTED' }), /too long/);
  assert.match(describeApiError({ response: { status: 404 } }), /route was not found/);
  assert.equal(describeApiError({ response: { status: 503, data: { message: 'Set MONGODB_URI' } } }), 'Set MONGODB_URI');
});
