import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { api } from '../api/client';
import type { MapMarkers } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { formatDistance } from '../utils/helpers';
import { amapNavUrl } from '../utils/community';
import { jumpToDidiPetTrip } from '../config/didi';
import { Icon, type IconName } from './Icon';

const DEFAULT: [number, number] = [39.785, 116.362];

function pin(name: IconName, tone: 'coral' | 'sky' | 'grass' | 'cream') {
  const svg = renderToStaticMarkup(<Icon name={name} size={16} strokeWidth={2.2} />);
  return L.divIcon({
    className: 'frog-map-pin-wrap',
    html: `<div class="frog-map-pin pin-${tone}">${svg}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 34],
    popupAnchor: [0, -32],
  });
}

const ICONS = {
  forum: pin('paw', 'coral'),
  hospital: pin('hospital', 'sky'),
  shelter: pin('shelter', 'grass'),
  user: pin('map-pin', 'cream'),
};

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

export function RescueMapView({ className = '' }: { className?: string }) {
  const navigate = useNavigate();
  const { lat, lng, loading: locLoading } = useLocationContext();
  const [markers, setMarkers] = useState<MapMarkers | null>(null);

  const center = useMemo<[number, number]>(() => (
    lat != null && lng != null ? [lat, lng] : DEFAULT
  ), [lat, lng]);

  useEffect(() => {
    api.mapMarkers(lat ?? undefined, lng ?? undefined).then(setMarkers).catch(() => setMarkers(null));
  }, [lat, lng]);

  const tileUrl = 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';

  return (
    <div className={`frog-map-half ${className}`}>
      {(locLoading || !markers) && <div className="frog-map-loading">地图加载中…</div>}
      <MapContainer center={center} zoom={14} className="frog-map-canvas" zoomControl={false} attributionControl={false}>
        <TileLayer url={tileUrl} subdomains={['1', '2', '3', '4']} />
        <Recenter center={center} />
        {lat != null && lng != null && (
          <Marker position={[lat, lng]} icon={ICONS.user}>
            <Popup><span className="text-xs font-bold">我的位置</span></Popup>
          </Marker>
        )}
        {markers?.forum.map((post) => (
          <Marker
            key={post.id}
            position={[post.lat!, post.lng!]}
            icon={ICONS.forum}
            eventHandlers={{ click: () => navigate(`/forum/${post.id}`) }}
          >
            <Popup>
              <div className="frog-map-popup">
                <p className="font-bold text-xs">{post.title}</p>
                <button type="button" className="frog-btn text-[10px] mt-1 w-full py-1 flex items-center justify-center gap-1" onClick={() => navigate(`/forum/${post.id}`)}>
                  流浪发现 <Icon name="chevron-right" size={10} />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        {markers?.hospitals.slice(0, 8).map((h) => (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={ICONS.hospital}>
            <Popup>
              <div className="frog-map-popup">
                <p className="font-bold text-xs">{h.name}</p>
                <p className="text-[10px]">{formatDistance(h.distance_km)}</p>
                <div className="flex gap-1 mt-1">
                  <button
                    type="button"
                    className="frog-btn text-[10px] flex-1 py-0.5 flex items-center justify-center gap-1"
                    onClick={() => jumpToDidiPetTrip({
                      id: h.id, name: h.name, lat: h.lat, lng: h.lng, address: h.address,
                      phone: h.phone || '', tags: [], discount_note: h.discount_note || '', hours: h.hours || '',
                    }, () => {})}
                  >
                    <Icon name="car" size={11} /> 打车
                  </button>
                  <a className="frog-btn-green text-[10px] flex-1 py-0.5 text-center flex items-center justify-center gap-1" href={amapNavUrl(h.lng, h.lat, h.name)} target="_blank" rel="noopener noreferrer">
                    <Icon name="map-pin" size={11} /> 导航
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {markers?.shelters.slice(0, 6).map((s) => (
          <Marker key={s.id} position={[s.lat, s.lng]} icon={ICONS.shelter}>
            <Popup>
              <div className="frog-map-popup">
                <p className="font-bold text-xs">{s.name}</p>
                <p className="text-[10px]">{s.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="frog-map-legend-compact">
        <span className="flex items-center gap-1"><span className="legend-dot legend-coral" /> 求助</span>
        <span className="flex items-center gap-1"><span className="legend-dot legend-sky" /> 医院</span>
        <span className="flex items-center gap-1"><span className="legend-dot legend-grass" /> 救助站</span>
      </div>
    </div>
  );
}
