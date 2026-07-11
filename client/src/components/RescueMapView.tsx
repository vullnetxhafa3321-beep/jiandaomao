import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { MapMarkers, ForumPost } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { formatDistance, formatTimeAgo } from '../utils/helpers';
import { amapNavUrl } from '../utils/community';
import { Icon, mapPinHtml, type IconName } from './Icon';

const DEFAULT: [number, number] = [39.785, 116.362];

type MapCategory = 'all' | 'forum' | 'hospital' | 'shelter';

export type MapListItem = {
  id: string;
  category: 'forum' | 'hospital' | 'shelter';
  name: string;
  address?: string;
  description?: string;
  lat: number;
  lng: number;
  distance_km?: number;
  phone?: string;
  status?: string;
  forumId?: string;
  hours?: string;
  discount_note?: string;
  created_at?: string;
  user_name?: string;
};

const TABS: { key: MapCategory; label: string; icon: IconName }[] = [
  { key: 'all', label: '全部', icon: 'map-pin' },
  { key: 'forum', label: '求助', icon: 'megaphone' },
  { key: 'hospital', label: '医院', icon: 'hospital' },
  { key: 'shelter', label: '救助站', icon: 'shelter' },
];

function makeCatPin(kind: 'forum' | 'hospital' | 'shelter' | 'user') {
  return L.divIcon({
    className: 'map-emoji-pin-wrap',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    popupAnchor: [0, -22],
    html: mapPinHtml(kind),
  });
}

const ICONS = {
  hospital: makeCatPin('hospital'),
  shelter: makeCatPin('shelter'),
  forum: makeCatPin('forum'),
  user: makeCatPin('user'),
};

function iconFor(it: MapListItem) {
  if (it.category === 'hospital') return ICONS.hospital;
  if (it.category === 'shelter') return ICONS.shelter;
  return ICONS.forum;
}

function listIconFor(it: MapListItem): IconName {
  if (it.category === 'hospital') return 'hospital';
  if (it.category === 'shelter') return 'shelter';
  return 'megaphone';
}

function badgeFor(it: MapListItem) {
  if (it.category === 'hospital') return { text: '医院', cls: 'badge-hospital' };
  if (it.category === 'shelter') return { text: '救助站', cls: 'badge-shelter' };
  if (it.status === 'rescued' || it.status === 'adopted') return { text: '已救助', cls: 'badge-rescued' };
  return { text: '待救助', cls: 'badge-found' };
}

/** Offset points around user for demo nearby markers */
function nearPoint(lat: number, lng: number, index: number, ringKm = 0.35) {
  const angle = ((index * 137.5) % 360) * (Math.PI / 180);
  const r = ringKm + (index % 3) * 0.22;
  const dLat = (r / 111) * Math.cos(angle);
  const dLng = (r / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(angle);
  return { lat: lat + dLat, lng: lng + dLng };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildNearbyFake(
  lat: number,
  lng: number,
  forumPool: ForumPost[]
): MapListItem[] {
  const fakeHospitals = [
    { name: '暖爪宠物医院（附近店）', phone: '010-88880001', address: '当前位置附近 · 模拟合作医院' },
    { name: '宠安心动物诊所', phone: '010-88880002', address: '当前位置附近 · 流浪猫友好' },
    { name: '街猫友好医院', phone: '010-88880003', address: '当前位置附近 · 绝育优惠' },
  ];
  const fakeShelters = [
    { name: '同城流浪猫中转站', address: '当前位置附近 · 临时安置' },
    { name: '爱心救助驿站', address: '当前位置附近 · 可咨询领养' },
    { name: '社区猫咪之家', address: '当前位置附近 · 志愿者值守' },
  ];
  const fakeForumTitles = [
    { title: '小区门口捡到一只幼猫，求附近医院', content: '刚发现，有点害怕人，求同城支招。' },
    { title: '路边橘猫疑似受伤，求救援', content: '后腿不太敢着地，求附近救助站信息。' },
    { title: '要不起，求姐妹帮忙接力', content: '航空箱已备好，等附近医院推荐。' },
  ];

  const items: MapListItem[] = [];
  let i = 0;

  fakeHospitals.forEach((h, idx) => {
    const p = nearPoint(lat, lng, i++, 0.4);
    items.push({
      id: `fake-h-${idx}`,
      category: 'hospital',
      name: h.name,
      address: h.address,
      phone: h.phone,
      lat: p.lat,
      lng: p.lng,
      distance_km: haversineKm(lat, lng, p.lat, p.lng),
      hours: '09:00–21:00',
      discount_note: '流浪猫首诊优惠（演示数据）',
    });
  });

  fakeShelters.forEach((s, idx) => {
    const p = nearPoint(lat, lng, i++, 0.55);
    items.push({
      id: `fake-s-${idx}`,
      category: 'shelter',
      name: s.name,
      address: s.address,
      lat: p.lat,
      lng: p.lng,
      distance_km: haversineKm(lat, lng, p.lat, p.lng),
    });
  });

  fakeForumTitles.forEach((f, idx) => {
    const p = nearPoint(lat, lng, i++, 0.28);
    const linked = forumPool[idx % Math.max(forumPool.length, 1)];
    items.push({
      id: `fake-f-${idx}`,
      category: 'forum',
      name: f.title,
      description: f.content,
      address: '当前位置附近 · 模拟求助',
      lat: p.lat,
      lng: p.lng,
      distance_km: haversineKm(lat, lng, p.lat, p.lng),
      status: 'found',
      forumId: linked?.id,
      created_at: new Date(Date.now() - (idx + 1) * 3600_000).toISOString(),
      user_name: linked?.user_name || '路过好心人',
    });
  });

  return items;
}

function Recenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
}

function FlyTo({ item }: { item: MapListItem | null }) {
  const map = useMap();
  useEffect(() => {
    if (item) map.setView([item.lat, item.lng], 16, { animate: true });
  }, [item, map]);
  return null;
}

export function RescueMapView({
  className = '',
  mapOverlay,
}: {
  className?: string;
  mapOverlay?: ReactNode;
}) {
  const navigate = useNavigate();
  const { lat, lng, loading: locLoading, regionLabel } = useLocationContext();
  const [markers, setMarkers] = useState<MapMarkers | null>(null);
  const [tab, setTab] = useState<MapCategory>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const center = useMemo<[number, number]>(
    () => (lat != null && lng != null ? [lat, lng] : DEFAULT),
    [lat, lng]
  );

  useEffect(() => {
    api
      .mapMarkers(lat ?? undefined, lng ?? undefined)
      .then(setMarkers)
      .catch(() => setMarkers(null));
  }, [lat, lng]);

  const allItems = useMemo(() => {
    const baseLat = lat ?? DEFAULT[0];
    const baseLng = lng ?? DEFAULT[1];
    const fromApi: MapListItem[] = [];

    markers?.hospitals.forEach((h) => {
      fromApi.push({
        id: h.id,
        category: 'hospital',
        name: h.name,
        address: h.address,
        lat: h.lat,
        lng: h.lng,
        distance_km: h.distance_km,
        phone: h.phone,
        hours: h.hours,
        discount_note: h.discount_note,
      });
    });

    markers?.shelters.forEach((s) => {
      fromApi.push({
        id: s.id,
        category: 'shelter',
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        distance_km: s.distance_km,
        phone: s.phone,
      });
    });

    markers?.forum.forEach((p) => {
      if (p.lat == null || p.lng == null) return;
      fromApi.push({
        id: p.id,
        category: 'forum',
        name: p.title,
        description: p.content,
        address: p.address,
        lat: p.lat,
        lng: p.lng,
        distance_km: p.distance_km,
        status: p.status,
        forumId: p.id,
        created_at: p.created_at,
        user_name: p.user_name,
      });
    });

    // Prefer nearby fake demo points around user location (reference v1.1 UX)
    const nearby = buildNearbyFake(baseLat, baseLng, markers?.forum ?? []);
    const merged = [...nearby, ...fromApi];
    merged.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
    return merged;
  }, [markers, lat, lng]);

  const filtered = useMemo(() => {
    if (tab === 'all') return allItems;
    return allItems.filter((it) => it.category === tab);
  }, [allItems, tab]);

  const nearestThree = useMemo(() => filtered.slice(0, 3), [filtered]);

  const selected = useMemo(
    () => allItems.find((it) => it.id === selectedId) || null,
    [allItems, selectedId]
  );

  const tileUrl =
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';

  const openForum = (it: MapListItem) => {
    if (it.forumId) navigate(`/forum/${it.forumId}`);
    else navigate('/forum');
  };

  return (
    <div className={`map-shell ${className}`}>
      <div className="map-filter-bar">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`map-filter-chip ${tab === t.key ? 'active' : ''}`}
            onClick={() => {
              setTab(t.key);
              setSelectedId(null);
            }}
            aria-pressed={tab === t.key}
          >
            <Icon name={t.icon} size={22} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="frog-map-half map-canvas-wrap">
        {(locLoading || !markers) && <div className="frog-map-loading">地图加载中…</div>}
        {mapOverlay}
        <MapContainer
          center={center}
          zoom={14}
          className="frog-map-canvas"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={tileUrl} subdomains={['1', '2', '3', '4']} />
          <Recenter center={center} />
          <FlyTo item={selected} />
          {lat != null && lng != null && (
            <Marker position={[lat, lng]} icon={ICONS.user}>
              <Popup>
                <span className="text-xs font-bold">我的位置</span>
              </Popup>
            </Marker>
          )}
          {filtered.map((it) => (
            <Marker
              key={it.id}
              position={[it.lat, it.lng]}
              icon={iconFor(it)}
              eventHandlers={{ click: () => setSelectedId(it.id) }}
            >
              <Popup>
                <div className="frog-map-popup">
                  <p className="font-bold text-xs">{it.name}</p>
                  <p className="text-[10px] text-gray-500">{it.address}</p>
                  {it.distance_km != null && (
                    <p className="text-[10px] font-bold text-[var(--sky-500)] mt-0.5">
                      {formatDistance(it.distance_km)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="frog-map-legend-compact">
          <span className="flex items-center gap-1">
            <span className="legend-dot legend-coral" /> 求助
          </span>
          <span className="flex items-center gap-1">
            <span className="legend-dot legend-sky" /> 医院
          </span>
          <span className="flex items-center gap-1">
            <span className="legend-dot legend-grass" /> 救助站
          </span>
          {regionLabel && <span className="opacity-70">· {regionLabel}</span>}
        </div>
      </div>

      {/* Nearest 3 below map */}
      <div className="map-nearest-panel">
        <div className="map-nearest-head">
          <span className="font-bold text-sm text-[var(--ink-900)]">
            最近 {nearestThree.length} 个
            {tab === 'all' ? '地点' : TABS.find((t) => t.key === tab)?.label}
          </span>
          <span className="text-[10px] text-[var(--ink-muted)]">点击展开 · 求助进流浪发现</span>
        </div>

        {nearestThree.length === 0 && (
          <p className="text-center text-[var(--ink-muted)] text-sm py-4">暂无附近点位</p>
        )}

        <div className="space-y-2">
          {nearestThree.map((it) => {
            const badge = badgeFor(it);
            const open = selectedId === it.id;
            return (
              <div key={it.id} className={`map-list-card ${open ? 'open' : ''}`}>
                <button type="button" className="map-list-row" onClick={() => setSelectedId(open ? null : it.id)}>
                    <span className={`map-list-emoji ${it.category}`}>
                      <Icon name={listIconFor(it)} size={28} />
                    </span>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm truncate text-[var(--ink-900)]">{it.name}</span>
                      <span className={`map-badge ${badge.cls}`}>{badge.text}</span>
                    </div>
                    <p className="text-[11px] text-[var(--ink-muted)] truncate mt-0.5">{it.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {it.distance_km != null && (
                      <div className="text-sm font-bold text-[var(--sky-500)]">{formatDistance(it.distance_km)}</div>
                    )}
                    <div className="text-[10px] text-[var(--ink-muted)]">{open ? '收起' : '展开'}</div>
                  </div>
                </button>

                {open && (
                  <div className="map-list-detail">
                    {it.category === 'forum' && (
                      <>
                        <p className="text-sm leading-relaxed text-[var(--ink-700)] whitespace-pre-line">
                          {it.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--ink-muted)] mt-2">
                          <span>👤 {it.user_name || '匿名'}</span>
                          {it.created_at && (
                            <>
                              <span>·</span>
                              <span>{formatTimeAgo(it.created_at)}</span>
                            </>
                          )}
                        </div>
                        <button type="button" className="map-detail-link" onClick={() => openForum(it)}>
                          去流浪发现查看详情 →
                        </button>
                      </>
                    )}
                    {it.category === 'hospital' && (
                      <>
                        {it.discount_note && (
                          <p className="text-xs text-[var(--sky-deep)] font-semibold mb-1">{it.discount_note}</p>
                        )}
                        {it.hours && <p className="text-[11px] text-[var(--ink-muted)] mb-2">营业：{it.hours}</p>}
                        <div className="flex gap-2">
                          <a
                            className="map-action-btn primary"
                            href={amapNavUrl(it.lng, it.lat, it.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🧭 导航
                          </a>
                          {it.phone && (
                            <a className="map-action-btn secondary" href={`tel:${it.phone}`}>
                              📞 电话
                            </a>
                          )}
                          <button type="button" className="map-action-btn ghost" onClick={() => navigate('/hospitals')}>
                            更多医院
                          </button>
                        </div>
                      </>
                    )}
                    {it.category === 'shelter' && (
                      <>
                        <p className="text-xs text-[var(--ink-muted)] mb-2">{it.address}</p>
                        <div className="flex gap-2">
                          <a
                            className="map-action-btn primary"
                            href={amapNavUrl(it.lng, it.lat, it.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            🧭 导航
                          </a>
                          {it.phone && (
                            <a className="map-action-btn secondary" href={`tel:${it.phone}`}>
                              📞 电话
                            </a>
                          )}
                          <button type="button" className="map-action-btn ghost" onClick={() => navigate('/shelters')}>
                            更多救助站
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
