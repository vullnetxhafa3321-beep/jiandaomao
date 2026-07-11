import { useEffect, useState } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { location, loading };
}
