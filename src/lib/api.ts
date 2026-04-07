export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Module-level fallback getter — the auth store will register itself here
let _liveTokenGetter: (() => string | null) | null = null;
export function registerTokenGetter(fn: () => string | null) {
  _liveTokenGetter = fn;
}

// Get token: first from localStorage (fast), then from live Zustand state
function getToken(): string | null {
  try {
    const stored = localStorage.getItem('lms_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.token) return parsed.state.token;
    }
  } catch {
    // fall through
  }
  // Fallback: use live store state (covers the brief gap after set() before persist flushes)
  return _liveTokenGetter?.() ?? null;
}

async function request<T = any>(
  method: string,
  path: string,
  body?: any,
  options: { isFormData?: boolean } = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!options.isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = options.isFormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, config);

  if (response.status === 401) {
    const data = await response.json().catch(() => ({}));
    if (data.code === 'TOKEN_EXPIRED') {
      // Try refresh
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${getToken()}`;
        const retryConfig = { ...config, headers };
        const retryResponse = await fetch(`${BASE_URL}${path}`, retryConfig);
        if (!retryResponse.ok) {
          const retryData = await retryResponse.json().catch(() => ({ error: 'Request failed' }));
          throw { status: retryResponse.status, message: retryData.error || 'Request failed', ...retryData };
        }
        // Handle CSV/text responses
        const ct = retryResponse.headers.get('Content-Type') || '';
        if (ct.includes('text/csv')) return (await retryResponse.text()) as unknown as T;
        return retryResponse.json();
      }
    }
    // Only hard-redirect for non-auth endpoints.
    // Login/refresh don't need auth, so a 401 there means wrong credentials, not expired session.
    if (!path.startsWith('/auth/')) {
      localStorage.removeItem('lms_auth');
      window.location.href = '/login';
    }
    throw { status: 401, message: data.error || 'Unauthorized' };
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Request failed' }));
    throw { status: response.status, message: data.error || 'Request failed', ...data };
  }

  // Handle CSV/text responses
  const contentType = response.headers.get('Content-Type') || '';
  if (contentType.includes('text/csv')) {
    return (await response.text()) as unknown as T;
  }

  // Handle empty responses (204, etc.)
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

async function tryRefreshToken(): Promise<boolean> {
  try {
    const stored = localStorage.getItem('lms_auth');
    if (!stored) return false;
    const parsed = JSON.parse(stored);
    const refreshToken = parsed?.state?.refreshToken;
    if (!refreshToken) return false;

    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    parsed.state.token = data.data.accessToken;
    parsed.state.refreshToken = data.data.refreshToken;
    localStorage.setItem('lms_auth', JSON.stringify(parsed));
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T = any>(path: string) => request<T>('GET', path),
  post: <T = any>(path: string, body?: any) => request<T>('POST', path, body),
  put: <T = any>(path: string, body?: any) => request<T>('PUT', path, body),
  patch: <T = any>(path: string, body?: any) => request<T>('PATCH', path, body),
  delete: <T = any>(path: string) => request<T>('DELETE', path),
  upload: <T = any>(path: string, formData: FormData) =>
    request<T>('POST', path, formData, { isFormData: true }),
};
