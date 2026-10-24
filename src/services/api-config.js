export function resolveApiBaseUrl({ production, configuredUrl } = {}) {
  // Use Vercel's same-origin proxy so browser privacy settings cannot block
  // sign-in as a third-party cookie between separate vercel.app domains.
  if (production) return '/api';
  const url = configuredUrl?.trim().replace(/\/+$/, '');
  if (!url) return '/api';
  return url.endsWith('/api') ? url : `${url}/api`;
}

export function describeApiError(error) {
  if (typeof error.response?.data?.message === 'string') return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'The server took too long. Please try again.';
  const status = error.response?.status;
  if (status >= 500) return 'The backend is unavailable. Please retry shortly; the server deployment needs attention.';
  if (status === 404) return 'The API route was not found. Check the frontend deployment’s /api proxy.';
  if (status) return 'The request could not be completed. Please try again.';
  return 'Cannot reach the API. Check your connection and the backend deployment.';
}
