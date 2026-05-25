import { storage } from '@/src/utils/storage';

const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
const TOKEN_KEY = 'cb_auth_token';

export async function saveToken(token: string) {
  await storage.setItem(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  const t = await storage.getItem<string>(TOKEN_KEY, '');
  return t || null;
}

export async function clearToken() {
  await storage.removeItem(TOKEN_KEY);
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  auth?: boolean;
}

async function request<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;
  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };
  if (auth) {
    const token = await getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}/api${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    const detail = (data && (data as any).detail) || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return data as T;
}

export const api = {
  get: <T = any>(path: string, opts?: ApiOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T = any>(path: string, body?: any, opts?: ApiOptions) => request<T>(path, { ...opts, method: 'POST', body }),
  put: <T = any>(path: string, body?: any, opts?: ApiOptions) => request<T>(path, { ...opts, method: 'PUT', body }),
  del: <T = any>(path: string, opts?: ApiOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};
