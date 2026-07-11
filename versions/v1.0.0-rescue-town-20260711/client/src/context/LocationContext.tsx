import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { Hospital, PricedHospital } from '../types';
import { formatDistance } from '../utils/helpers';

export type NearbyHospital = (Hospital | PricedHospital) & { distance_km?: number };

interface LocationContextValue {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  nearest: NearbyHospital | null;
  hospitals: NearbyHospital[];
  regionLabel: string;
  refresh: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);
const DEFAULT = { lat: 39.785, lng: 116.362 };

function mergeHospitals(sh: Hospital[], bj: PricedHospital[]) {
  return [...sh, ...bj].sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);

  const load = (latitude?: number, longitude?: number) =>
    Promise.all([
      api.nearbyHospitals(latitude, longitude, 10),
      api.pricedHospitals(latitude, longitude),
    ]).then(([sh, bj]) => mergeHospitals(sh.items, bj.items));

  const refresh = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setLat(DEFAULT.lat);
      setLng(DEFAULT.lng);
      load(DEFAULT.lat, DEFAULT.lng).then(setHospitals).finally(() => setLoading(false));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        load(pos.coords.latitude, pos.coords.longitude).then(setHospitals).finally(() => setLoading(false));
      },
      () => {
        setLat(DEFAULT.lat);
        setLng(DEFAULT.lng);
        load(DEFAULT.lat, DEFAULT.lng).then(setHospitals).finally(() => setLoading(false));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  useEffect(() => { refresh(); }, []);

  const nearest = hospitals[0] ?? null;
  const regionLabel = useMemo(() => {
    if (loading) return '定位中…';
    if (nearest?.distance_km != null) return `最近 ${nearest.name} · ${formatDistance(nearest.distance_km)}`;
    return '北京市大兴区西红门';
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
