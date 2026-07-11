import type {
  User, Rescue, RescueEvent, ReportImage, Hospital,
  Shelter, PricedHospital, GuideStep, ForumPost, AdoptionListing, ForumComment,
  MapMarkers, NearbyFriendlyHospital,
} from '../types';

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
    return request<{ items: NearbyFriendlyHospital[] }>(`/hospitals/nearby?${q}`);
  },

  nearbyFriendlyHospitals: (lat?: number, lng?: number, limit = 12) => {
    const q = new URLSearchParams({ limit: String(Math.max(10, limit)) });
    if (lat != null) q.set('lat', String(lat));
    if (lng != null) q.set('lng', String(lng));
    // 使用 /nearby（与 nearby-friendly 同源），避免被 /hospitals/:id 误伤
    return request<{ items: NearbyFriendlyHospital[]; center?: { lat: number; lng: number } }>(
      `/hospitals/nearby?${q}`
    );
  },

  myRescues: () => request<{ items: Rescue[] }>('/me/rescues'),

  catCatalog: () =>
    request<{
      items: Array<{
        slug: string;
        name: string;
        breed: string;
        gender: string;
        age: string;
        location: string;
        address: string;
        image: string;
        tags: string[];
        status: string;
        content: string;
        celebration: string;
        source?: string;
        rescue_id: string | null;
      }>;
    }>('/cat-catalog'),

  og: (id: string) =>
    request<{ title: string; description: string; image?: string; url: string }>(`/og/${id}`),

  shelters: (lat?: number, lng?: number) => {
    const q = new URLSearchParams();
    if (lat) q.set('lat', String(lat));
    if (lng) q.set('lng', String(lng));
    const qs = q.toString();
    return request<{ items: Shelter[] }>(`/shelters${qs ? `?${qs}` : ''}`);
  },

  pricedHospitals: (lat?: number, lng?: number) => {
    const q = new URLSearchParams();
    if (lat) q.set('lat', String(lat));
    if (lng) q.set('lng', String(lng));
    const qs = q.toString();
    return request<{ items: PricedHospital[] }>(`/hospitals/priced${qs ? `?${qs}` : ''}`);
  },

  guideSteps: () => request<{ items: GuideStep[] }>('/guide/steps'),

  mapMarkers: (lat?: number, lng?: number) => {
    const q = new URLSearchParams();
    if (lat != null) q.set('lat', String(lat));
    if (lng != null) q.set('lng', String(lng));
    const qs = q.toString();
    return request<MapMarkers>(`/map/markers${qs ? `?${qs}` : ''}`);
  },

  forumPosts: () => request<{ items: ForumPost[] }>('/forum/posts'),

  forumPost: (id: string) => request<{ post: ForumPost }>(`/forum/posts/${id}`),

  createForumPost: (body: {
    title: string;
    content?: string;
    address: string;
    lat?: number;
    lng?: number;
    status?: string;
    breed?: string;
    age?: string;
    contact: string;
  }) =>
    request<{ post: ForumPost }>('/forum/posts', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateForumStatus: (id: string, body: { status: string; rescuer_name?: string }) =>
    request<{ post: ForumPost }>(`/forum/posts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  celebrations: () => request<{ items: string[] }>('/celebrations'),

  adoptions: (pet_type?: string) => {
    const q = new URLSearchParams();
    if (pet_type && pet_type !== 'all') q.set('pet_type', pet_type);
    const qs = q.toString();
    return request<{ items: AdoptionListing[] }>(`/adoptions${qs ? `?${qs}` : ''}`);
  },

  adoption: (id: string) => request<{ listing: AdoptionListing }>(`/adoptions/${id}`),

  createAdoption: (formData: FormData) =>
    request<{ listing: AdoptionListing }>('/adoptions', {
      method: 'POST',
      body: formData,
    }),

  forumComments: (postId: string) =>
    request<{ items: ForumComment[] }>(`/forum/posts/${postId}/comments`),

  createForumComment: (postId: string, formData: FormData) =>
    request<{ comment: ForumComment }>(`/forum/posts/${postId}/comments`, {
      method: 'POST',
      body: formData,
    }),
};
