import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'jiandaomao.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT,
      nickname TEXT NOT NULL,
      avatar_url TEXT DEFAULT '👤',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rescues (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'discovered',
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      cover_url TEXT,
      images TEXT DEFAULT '[]',
      tags TEXT DEFAULT '[]',
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      address_display TEXT NOT NULL,
      hospital_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS rescue_events (
      id TEXT PRIMARY KEY,
      rescue_id TEXT NOT NULL REFERENCES rescues(id),
      from_status TEXT,
      to_status TEXT NOT NULL,
      note TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS report_images (
      id TEXT PRIMARY KEY,
      rescue_id TEXT NOT NULL REFERENCES rescues(id),
      url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS didi_jump_logs (
      id TEXT PRIMARY KEY,
      rescue_id TEXT NOT NULL REFERENCES rescues(id),
      hospital_id TEXT NOT NULL,
      channel TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS forum_posts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      user_name TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      images TEXT DEFAULT '[]',
      breed TEXT,
      age TEXT,
      address TEXT NOT NULL,
      lat REAL,
      lng REAL,
      status TEXT NOT NULL DEFAULT 'found',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS adoption_listings (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      pet_name TEXT NOT NULL,
      pet_type TEXT NOT NULL,
      breed TEXT,
      age TEXT,
      gender TEXT NOT NULL,
      health TEXT,
      images TEXT DEFAULT '[]',
      address TEXT,
      requirements TEXT,
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'available',
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  try { db.exec('ALTER TABLE forum_posts ADD COLUMN breed TEXT'); } catch { /* exists */ }
  try { db.exec('ALTER TABLE forum_posts ADD COLUMN age TEXT'); } catch { /* exists */ }
}

export const STATUS_ORDER = [
  'discovered',
  'saved',
  'hospital',
  'treated',
  'adoption',
  'homeward',
  'closed',
];

export function getNextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx >= STATUS_ORDER.length - 1) return null;
  return STATUS_ORDER[idx + 1];
}

export function parseJson(val, fallback = []) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function fuzzyCoords(lat, lng) {
  const offsetLat = (Math.random() - 0.5) * 0.008;
  const offsetLng = (Math.random() - 0.5) * 0.008;
  return {
    lat: lat + offsetLat,
    lng: lng + offsetLng,
  };
}
