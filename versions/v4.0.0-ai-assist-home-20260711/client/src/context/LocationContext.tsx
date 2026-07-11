import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { NearbyFriendlyHospital } from '../types';
import { formatDistance } from '../utils/helpers';

interface LocationContextValue {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  nearest: NearbyFriendlyHospital | null;
  hospitals: NearbyFriendlyHospital[];
  regionLabel: string;
  refresh: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);
const DEFAULT = { lat: 39.785, lng: 116.362 };

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<NearbyFriendlyHospital[]>([]);

  const load = (latitude: number, longitude: number) =>
    api.nearbyFriendlyHospitals(latitude, longitude, 12).then((r) => r.items);

  const refresh = () => {
    setLoading(true);
    const apply = (latitude: number, longitude: number) => {
      setLat(latitude);
      setLng(longitude);
      load(latitude, longitude)
        .then(setHospitals)
        .catch(() => setHospitals([]))
        .finally(() => setLoading(false));
    };

    if (!navigator.geolocation) {
      apply(DEFAULT.lat, DEFAULT.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => apply(pos.coords.latitude, pos.coords.longitude),
      () => apply(DEFAULT.lat, DEFAULT.lng),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  useEffect(() => { refresh(); }, []);

  const nearest = hospitals[0] ?? null;
  const regionLabel = useMemo(() => {
    if (loading) return '定位中…';
    if (nearest?.distance_km != null) return `最近 ${nearest.name} · ${formatDistance(nearest.distance_km)}`;
    return '附近友好医院已就绪';
  }, [loading, nearest]);

  return (
    <LocationContext.Provider value={{ lat, lng, loading, nearest, hospitals, regionLabel, refresh }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
}
