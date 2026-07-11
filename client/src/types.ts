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
  discount_note?: string;
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

export interface Shelter {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  description: string;
  tags: string[];
  distance_km?: number;
}

export interface HospitalPrice {
  item: string;
  price: number;
  unit: string;
  note: string;
  free: boolean;
}

export interface PricedHospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  isPartner: boolean;
  partnerDiscount?: string;
  prices: HospitalPrice[];
  priceUpdatedAt: string;
  distance_km?: number;
}

export interface GuideStep {
  step: number;
  title: string;
  icon: string;
  content: string;
  dos: string[];
  donts: string[];
}

export type ForumStatus = 'found' | 'rescued' | 'adopted';

export interface ForumPost {
  id: string;
  user_id?: string;
  user_name: string;
  title: string;
  content: string;
  images: string[];
  breed?: string;
  /** AI 识别 top-N 置信度 */
  breed_scores?: Array<{ name: string; score: number; petType?: string; keyword?: string }>;
  age?: string;
  address: string;
  lat?: number;
  lng?: number;
  status: ForumStatus;
  created_at: string;
  comment_count?: number;
  distance_km?: number;
  /** 联系方式：询问模糊定位的具体地址 */
  contact?: string;
  /** 标记已救助的网名 */
  rescuer_name?: string | null;
  location_fuzzy?: boolean;
}

export interface NearbyFriendlyHospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  isPartner: boolean;
  discount_note?: string;
  partnerDiscount?: string;
  friendly_note?: string;
  tags: string[];
  prices: HospitalPrice[];
  distance_km?: number;
  priceUpdatedAt?: string;
}

export interface MapHospitalMarker {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
  isPartner?: boolean;
  discount_note?: string;
  friendly_note?: string;
  prices?: HospitalPrice[];
  distance_km?: number;
}

export interface MapMarkers {
  center: { lat: number; lng: number };
  forum: (ForumPost & { distance_km?: number })[];
  shelters: (Shelter & { distance_km?: number })[];
  hospitals: MapHospitalMarker[];
}

export interface ForumNotification {
  id: string;
  post_id: string;
  post_title: string;
  user_name: string;
  content: string;
  created_at: string;
}

export type AdoptionStatus = 'available' | 'pending' | 'adopted';
export type PetType = 'cat' | 'dog' | 'other';

export interface AdoptionListing {
  id: string;
  user_id?: string;
  pet_name: string;
  pet_type: PetType;
  breed?: string;
  breed_scores?: Array<{ name: string; score: number; petType?: string; keyword?: string }>;
  age?: string;
  gender: 'male' | 'female' | 'unknown';
  health?: string;
  sterilized?: 'yes' | 'no' | null;
  vaccinated?: 'yes' | 'no' | null;
  images: string[];
  address?: string;
  requirements?: string;
  contact: string;
  status: AdoptionStatus;
  description?: string;
  rescue_id?: string;
  created_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id?: string;
  user_name: string;
  content: string;
  images?: string[];
  created_at: string;
}
