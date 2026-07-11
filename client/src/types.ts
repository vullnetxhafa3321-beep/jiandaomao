export type RescueStatus =
  | 'discovered'
  | 'saved'
  | 'hospital'
  | 'treated'
  | 'adoption'
  | 'homeward'
  | 'closed';

export interface User {
  id: string;
  phone?: string;
  nickname: string;
  avatar_url: string;
  created_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  tags: string[];
  discount_note: string;
  hours: string;
  distance_km?: number;
}

export interface Rescue {
  id: string;
  user_id: string;
  status: RescueStatus;
  title: string;
  content: string;
  cover_url: string;
  images: string[];
  tags: string[];
  lat: number;
  lng: number;
  address_display: string;
  hospital_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  hospital?: Hospital;
  distance_km?: number;
}

export interface RescueEvent {
  id: string;
  rescue_id: string;
  from_status: RescueStatus | null;
  to_status: RescueStatus;
  note?: string;
  image_url?: string;
  created_at: string;
}

export interface ReportImage {
  id: string;
  rescue_id: string;
  url: string;
  created_at: string;
}
