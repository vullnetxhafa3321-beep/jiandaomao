import type { User, Rescue, RescueEvent, ReportImage, Hospital } from '../types';

const TOKEN_KEY = 'jiandaomao_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || '请求失败');
  }

  return res.json();
}

export const api = {
  login: (body: { phone?: string; code?: string; nickname?: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () => request<{ user: User }>('/auth/me'),

  feed: (params: { tab?: string; lat?: number; lng?: number; radius?: number }) => {
    const q = new URLSearchParams();
    if (params.tab) q.set('tab', params.tab);
    if (params.lat) q.set('lat', String(params.lat));
    if (params.lng) q.set('lng', String(params.lng));
    if (params.radius) q.set('radius', String(params.radius));
    return request<{ items: Rescue[] }>(`/feed?${q}`);
  },

  createRescue: (formData: FormData) =>
    request<{ rescue: Rescue }>('/rescues', {
      method: 'POST',
      body: formData,
    }),

  getRescue: (id: string) =>
    request<{
      rescue: Rescue;
      events: RescueEvent[];
      reports: ReportImage[];
      is_owner: boolean;
    }>(`/rescues/${id}`),

  updateStatus: (id: string, status: string, note?: string) =>
    request<{ rescue: Rescue }>(`/rescues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }),

  bindHospital: (id: string, hospital_id: string) =>
    request<{ rescue: Rescue; hospital: Hospital }>(`/rescues/${id}/hospital`, {
      method: 'POST',
      body: JSON.stringify({ hospital_id }),
    }),

  uploadReports: (id: string, formData: FormData) =>
    request<{
      reports: ReportImage[];
      rescue: Rescue;
    }>(`/rescues/${id}/reports`, { method: 'POST', body: formData }),

  logDidiJump: (id: string, hospital_id: string, channel: string) =>
    request<{ ok: boolean }>(`/rescues/${id}/didi-jump`, {
      method: 'POST',
      body: JSON.stringify({ hospital_id, channel }),
    }),

  nearbyHospitals: (lat?: number, lng?: number, limit = 10) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (lat) q.set('lat', String(lat));
    if (lng) q.set('lng', String(lng));
    return request<{ items: Hospital[] }>(`/hospitals/nearby?${q}`);
  },

  myRescues: () => request<{ items: Rescue[] }>('/me/rescues'),

  og: (id: string) =>
    request<{ title: string; description: string; image?: string; url: string }>(`/og/${id}`),
};
