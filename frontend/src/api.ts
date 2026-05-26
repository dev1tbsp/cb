import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = (process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
const API = `${BASE}/api`;

const TOKEN_KEY = 'cosmic_admin_token';

export const tokenStore = {
  async get(): Promise<string | null> {
    try { return await AsyncStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  async set(t: string) { try { await AsyncStorage.setItem(TOKEN_KEY, t); } catch {} },
  async clear() { try { await AsyncStorage.removeItem(TOKEN_KEY); } catch {} },
};

async function request(method: string, path: string, body?: any, auth: boolean = false) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const tok = await tokenStore.get();
    if (tok) headers.Authorization = `Bearer ${tok}`;
  }
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let detail: any = `HTTP ${res.status}`;
    try { const j = await res.json(); detail = j.detail || detail; } catch {}
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (p: string, auth = false) => request('GET', p, undefined, auth),
  post: (p: string, body?: any, auth = false) => request('POST', p, body, auth),
  put: (p: string, body?: any, auth = false) => request('PUT', p, body, auth),
  del: (p: string, auth = false) => request('DELETE', p, undefined, auth),
};

export const BACKEND_URL = BASE;
