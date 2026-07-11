import type { CatProfile } from '../components/CatCarousel';

export interface CatCatalogEntry {
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
}

const CARD_COLORS = [
  '#a8d8ea',
  '#7ec8b8',
  '#e8c547',
  '#f8b4c4',
  '#c9b8e8',
  '#ffd4a3',
  '#b8e0d2',
];

export function catalogToCatProfile(entry: CatCatalogEntry, index: number, rescueId?: string): CatProfile {
  return {
    id: entry.slug,
    rescueId: rescueId || entry.slug,
    name: entry.name,
    breed: entry.breed,
    gender: entry.gender,
    age: entry.age,
    location: entry.location,
    image: entry.image,
    color: CARD_COLORS[index % CARD_COLORS.length],
    status: entry.status,
    story: entry.content,
  };
}
