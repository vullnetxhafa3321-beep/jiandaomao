import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { Hospital, PricedHospital } from '../types';
import { formatDistance } from '../utils/helpers';

export type NearbyHospital = (Hospital | PricedHospital) & { distance_km?: number };

interface LocationContextValue {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  locationError: boolean;
  nearest: NearbyHospital | null;
  hospitals: NearbyHospital[];
  regionLabel: string;
  addressLabel: string;
  refresh: () => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

function mergeHospitals(sh: Hospital[], bj: PricedHospital[]): NearbyHospital[] {
  const all: NearbyHospital[] = [...sh, ...bj];
  return all.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
}

function regionFromCoords(lat: number, lng: number) {
  if (lat >= 38.5 && lng >= 115.5 && lng <= 117.5) return '北京';
  if (lat >= 30.5 && lat <= 32 && lng >= 120.5 && lng <= 122.2) return '上海';
  if (lat >= 39.7 && lat <= 40.1 && lng >= 116.2 && lng <= 116.6) return '北京大兴';
  return '当前位置';
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);

  const loadHospitals = (latitude?: number, longitude?: number) => {
    return Promise.all([
      api.nearbyHospitals(latitude, longitude, 8),
      api.pricedHospitals(latitude, longitude),
    ]).then(([sh, bj]) => mergeHospitals(sh.items, bj.items));
  };

  const refresh = () => {
    setLoading(true);
    setLocationError(false);
    if (!navigator.geolocation) {
      setLat(39.785);
      setLng(116.362);
      loadHospitals(39.785, 116.362)
        .then(setHospitals)
        .finally(() => setLoading(false));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        loadHospitals(latitude, longitude)
          .then(setHospitals)
          .finally(() => setLoading(false));
      },
      () => {
        setLocationError(true);
        setLat(39.785);
        setLng(116.362);
        loadHospitals(39.785, 116.362)
          .then(setHospitals)
          .finally(() => setLoading(false));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  useEffect(() => {
    refresh();
  }, []);

  const nearest = hospitals[0] ?? null;

  const regionLabel = useMemo(() => {
    if (loading) return '定位中…';
    if (nearest?.distance_km !== undefined) {
      const region = lat && lng ? regionFromCoords(lat, lng) : '附近';
      return `${region} · 最近 ${nearest.name} ${formatDistance(nearest.distance_km)}`;
    }
    return lat && lng ? regionFromCoords(lat, lng) : '未获取定位';
  }, [loading, nearest, lat, lng]);

  const addressLabel = useMemo(() => {
    if (nearest) {
      return `${nearest.name} · ${nearest.address}`;
    }
    return '点击查看附近友好医院';
  }, [nearest]);

  const value: LocationContextValue = {
    lat,
    lng,
    loading,
    locationError,
    nearest,
    hospitals,
    regionLabel,
    addressLabel,
    refresh,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocationContext must be used within LocationProvider');
  return ctx;
}
