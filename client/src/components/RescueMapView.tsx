import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { MapMarkers } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { formatDistance } from '../utils/helpers';
import { amapNavUrl } from '../utils/community';
import { jumpToDidiPetTrip } from '../config/didi';

const DEFAULT_CENTER: [number, number] = [39.785, 116.362];

function createPin(emoji: string, bg: string) {
  return L.divIcon({
    className: 'frog-map-pin-wrap',
    html: `<div class="frog-map-pin" style="background:${bg}">${emoji}</div>`,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -40],
  });
}

const ICONS = {
  forum: createPin('🐱', '#8CB866'),
  hospital: createPin('🏥', '#C2A88D'),
  shelter: createPin('📍', '#A0C68C'),
  user: createPin('📌', '#EAE3D3'),
};

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom() < 13 ? 14 : map.getZoom());
  }, [center, map]);
  return null;
}

interface RescueMapViewProps {
  className?: string;
  height?: string;
}

export function RescueMapView({ className = '', height = 'calc(100vh - 5.5rem)' }: RescueMapViewProps) {
  const navigate = useNavigate();
  const { lat, lng, loading: locLoading } = useLocationContext();
  const [markers, setMarkers] = useState<MapMarkers | null>(null);
  const [loadErr, setLoadErr] = useState('');

  const center = useMemo<[number, number]>(() => {
    if (lat != null && lng != null) return [lat, lng];
    return DEFAULT_CENTER;
  }, [lat, lng]);

  useEffect(() => {
    setLoadErr('');
    api
      .mapMarkers(lat ?? undefined, lng ?? undefined)
      .then(setMarkers)
      .catch(() => setLoadErr('地图数据加载失败'));
  }, [lat, lng]);

  const tileUrl = import.meta.env.VITE_AMAP_TILE_URL
    || 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';

  return (
    <div className={`frog-map-shell ${className}`} style={{ height }}>
      {(locLoading || !markers) && !loadErr && (
        <div className="frog-map-loading">地图加载中…</div>
      )}
      {loadErr && <div className="frog-map-loading">{loadErr}</div>}

      <MapContainer
        center={center}
        zoom={14}
        className="frog-map-canvas"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={tileUrl} subdomains={['1', '2', '3', '4']} />
        <Recenter center={center} />

        {lat != null && lng != null && (
          <Marker position={[lat, lng]} icon={ICONS.user}>
            <Popup>
              <div className="frog-map-popup">
                <p className="font-bold">📌 我的位置</p>
              </div>
            </Popup>
          </Marker>
        )}

        {markers?.forum.map((post) => (
          <Marker
            key={`f-${post.id}`}
            position={[post.lat!, post.lng!]}
            icon={ICONS.forum}
            eventHandlers={{
              click: () => navigate(`/forum/${post.id}`),
            }}
          >
            <Popup>
              <div className="frog-map-popup">
                <p className="font-bold text-sm">{post.title}</p>
                <p className="text-xs text-[var(--frog-stone)]">{post.breed} · {post.status}</p>
                <p className="text-[10px]">{formatDistance(post.distance_km)}</p>
                <button
                  type="button"
                  className="frog-btn text-xs mt-2 w-full py-1"
                  onClick={() => navigate(`/forum/${post.id}`)}
                >
                  查看流浪发现 →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {markers?.hospitals.slice(0, 12).map((h) => (
          <Marker key={`h-${h.id}`} position={[h.lat, h.lng]} icon={ICONS.hospital}>
            <Popup>
              <div className="frog-map-popup">
                <p className="font-bold text-sm">{h.name}</p>
                <p className="text-[10px] text-[var(--frog-stone)]">{h.address}</p>
                <p className="text-xs font-bold text-[var(--frog-green)]">{formatDistance(h.distance_km)}</p>
                {h.discount_note && <p className="text-[10px] mt-1">{h.discount_note}</p>}
                <div className="flex gap-1 mt-2">
                  <button
                    type="button"
                    className="frog-btn text-[10px] flex-1 py-1"
                    onClick={() =>
                      jumpToDidiPetTrip(
                        {
                          id: h.id,
                          name: h.name,
                          lat: h.lat,
                          lng: h.lng,
                          address: h.address,
                          phone: h.phone || '',
                          tags: [],
                          discount_note: h.discount_note || '',
                          hours: h.hours || '',
                        },
                        () => {}
                      )
                    }
                  >
                    🚗 打车
                  </button>
                  <a
                    className="frog-btn-green text-[10px] flex-1 py-1 text-center"
                    href={amapNavUrl(h.lng, h.lat, h.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    导航
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {markers?.shelters.slice(0, 8).map((s) => (
          <Marker key={`s-${s.id}`} position={[s.lat, s.lng]} icon={ICONS.shelter}>
            <Popup>
              <div className="frog-map-popup">
                <p className="font-bold text-sm">{s.name}</p>
                <p className="text-[10px]">{s.address}</p>
                <p className="text-xs">{formatDistance(s.distance_km)}</p>
                <a className="text-xs font-bold text-[var(--frog-green)]" href={`tel:${s.phone}`}>📞 {s.phone}</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="frog-map-legend">
        <span>🐱 求助</span>
        <span>🏥 医院</span>
        <span>📍 救助站</span>
      </div>
    </div>
  );
}
