import Database from 'better-sqlite3';
import path from 'path';
import { GameServer } from './types';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const DB_PATH = path.join(__dirname, '..', 'data', 'svnhost.db');

let db: Database.Database;

export function initDatabase(): void {
  const fs = require('fs');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL DEFAULT 'admin',
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'fivem',
      status TEXT NOT NULL DEFAULT 'stopped',
      port INTEGER NOT NULL,
      maxPlayers INTEGER DEFAULT 64,
      ip TEXT DEFAULT '0.0.0.0',
      createdAt TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      pid INTEGER,

      -- FiveM specific
      txAdminPort INTEGER,
      gameBuild TEXT DEFAULT '3095',
      oneSync TEXT DEFAULT 'on',
      licenseKey TEXT DEFAULT '',
      txAdminToken TEXT DEFAULT '',

      -- Minecraft specific
      mcVersion TEXT DEFAULT '1.21.4',
      mcFlavor TEXT DEFAULT 'paper',
      mcJarFile TEXT DEFAULT 'server.jar',
      ramMb INTEGER DEFAULT 2048,
      javaPath TEXT,

      -- VPS specific
      os TEXT DEFAULT 'ubuntu-24.04',
      cpuCores INTEGER DEFAULT 2,
      diskGb INTEGER DEFAULT 30,
      sshPort INTEGER,
      sshUser TEXT,
      sshPassword TEXT,

      -- Bot specific
      botRuntime TEXT,
      botToken TEXT
    );
  `);

  // Add columns that may be missing from older schema (migration)
  const columns = db.prepare("PRAGMA table_info(servers)").all().map((c: any) => c.name);
  const migrations: [string, string][] = [
    ['mcVersion',  "ALTER TABLE servers ADD COLUMN mcVersion TEXT DEFAULT '1.21.4'"],
    ['mcFlavor',   "ALTER TABLE servers ADD COLUMN mcFlavor TEXT DEFAULT 'paper'"],
    ['mcJarFile',  "ALTER TABLE servers ADD COLUMN mcJarFile TEXT DEFAULT 'server.jar'"],
    ['ramMb',      "ALTER TABLE servers ADD COLUMN ramMb INTEGER DEFAULT 2048"],
    ['javaPath',   "ALTER TABLE servers ADD COLUMN javaPath TEXT"],
    ['os',         "ALTER TABLE servers ADD COLUMN os TEXT DEFAULT 'windows'"],
    ['cpuCores',   "ALTER TABLE servers ADD COLUMN cpuCores INTEGER DEFAULT 2"],
    ['diskGb',     "ALTER TABLE servers ADD COLUMN diskGb INTEGER DEFAULT 30"],
    ['sshPort',    "ALTER TABLE servers ADD COLUMN sshPort INTEGER"],
    ['sshUser',    "ALTER TABLE servers ADD COLUMN sshUser TEXT"],
    ['sshPassword',"ALTER TABLE servers ADD COLUMN sshPassword TEXT"],
    ['botRuntime', "ALTER TABLE servers ADD COLUMN botRuntime TEXT"],
    ['botToken',   "ALTER TABLE servers ADD COLUMN botToken TEXT"],
  ];
  for (const [col, sql] of migrations) {
    if (!columns.includes(col)) {
      try { db.exec(sql); } catch { /* already exists */ }
    }
  }

  // Reset any servers that were 'running' when backend crashed
  db.prepare(`UPDATE servers SET status = 'stopped', pid = NULL WHERE status IN ('running', 'starting', 'stopping')`).run();

  // ── Users table ──────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      balance REAL NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      avatar TEXT,
      fullName TEXT,
      bio TEXT,
      phone TEXT,
      language TEXT DEFAULT 'pl',
      timezone TEXT DEFAULT 'Europe/Warsaw',
      twoFa INTEGER DEFAULT 0,
      loginAlerts INTEGER DEFAULT 0
    );
  `);

  // ── Sessions table ───────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      device TEXT,
      browser TEXT,
      ip TEXT,
      location TEXT,
      createdAt TEXT NOT NULL,
      lastActive TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // ── Settings table ───────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default settings
  const settingsDefaults: [string, string][] = [
    ['loginEnabled', 'true'],
    ['registerEnabled', 'true'],
  ];
  for (const [key, value] of settingsDefaults) {
    db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, value);
  }

  // ── Seed admin if no users ───────────────────────────
  const userCount = (db.prepare('SELECT COUNT(*) as cnt FROM users').get() as any).cnt;
  if (userCount === 0) {
    const adminId = crypto.randomUUID();
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (id, email, username, passwordHash, role, balance, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(adminId, 'admin@svnhost.pl', 'Admin', hash, 'admin', 0, new Date().toISOString());
    console.log('  [DB] Admin account seeded: admin@svnhost.pl / admin123');
  }
}

export function getDb(): Database.Database {
  return db;
}

// ── Server CRUD ────────────────────────────────────

export function getAllServers(): GameServer[] {
  return db.prepare('SELECT * FROM servers').all() as GameServer[];
}

export function getServerById(id: string): GameServer | undefined {
  return db.prepare('SELECT * FROM servers WHERE id = ?').get(id) as GameServer | undefined;
}

export function createServerRecord(server: GameServer): void {
  db.prepare(`
    INSERT INTO servers (
      id, userId, name, type, status, port, maxPlayers, ip, createdAt, expiresAt,
      txAdminPort, gameBuild, oneSync, licenseKey, txAdminToken,
      mcVersion, mcFlavor, mcJarFile, ramMb, javaPath,
      os, cpuCores, diskGb, sshPort, sshUser, sshPassword,
      botRuntime, botToken
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?
    )
  `).run(
    server.id, server.userId, server.name, server.type, server.status,
    server.port, server.maxPlayers, server.ip, server.createdAt, server.expiresAt,
    server.txAdminPort || null, server.gameBuild || '3095', server.oneSync || 'on',
    server.licensKey || '', server.txAdminToken || '',
    server.mcVersion || null, server.mcFlavor || null, server.mcJarFile || null,
    server.ramMb || null, server.javaPath || null,
    server.os || null, server.cpuCores || null, server.diskGb || null,
    server.sshPort || null, server.sshUser || null, server.sshPassword || null,
    server.botRuntime || null, server.botToken || null
  );
}

export function updateServerStatus(id: string, status: string, pid?: number | null): void {
  if (pid !== undefined) {
    db.prepare('UPDATE servers SET status = ?, pid = ? WHERE id = ?').run(status, pid, id);
  } else {
    db.prepare('UPDATE servers SET status = ? WHERE id = ?').run(status, id);
  }
}

export function updateServerField(id: string, field: string, value: string | number | null): void {
  // Only allow safe fields
  const allowed = [
    'name', 'maxPlayers', 'status', 'pid', 'port',
    // FiveM
    'gameBuild', 'oneSync', 'licenseKey', 'txAdminToken', 'txAdminPort',
    // Minecraft
    'mcVersion', 'mcFlavor', 'mcJarFile', 'ramMb', 'javaPath',
    // Bot
    'botRuntime', 'botToken',
    // VPS
    'os', 'cpuCores', 'diskGb', 'sshPort', 'sshUser', 'sshPassword',
  ];
  if (!allowed.includes(field)) return;
  db.prepare(`UPDATE servers SET ${field} = ? WHERE id = ?`).run(value, id);
}

export function deleteServerRecord(id: string): void {
  db.prepare('DELETE FROM servers WHERE id = ?').run(id);
}

export function getNextAvailablePort(basePort: number = 30120): number {
  const usedPorts = db.prepare('SELECT port FROM servers').all().map((r: any) => r.port);
  let port = basePort;
  while (usedPorts.includes(port)) port++;
  return port;
}

export function getNextAvailableTxPort(basePort: number = 40120): number {
  const usedPorts = db.prepare('SELECT txAdminPort FROM servers WHERE txAdminPort IS NOT NULL').all().map((r: any) => r.txAdminPort);
  let port = basePort;
  while (usedPorts.includes(port)) port++;
  return port;
}

// ═══════════════════════════════════════════════════════
//  AUTH / USERS
// ═══════════════════════════════════════════════════════

export interface DbUser {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: string;
  balance: number;
  createdAt: string;
  avatar: string | null;
  fullName: string | null;
  bio: string | null;
  phone: string | null;
  language: string;
  timezone: string;
  twoFa: number;
  loginAlerts: number;
}

/** Safe user object (no passwordHash) */
export type SafeUser = Omit<DbUser, 'passwordHash'>;

function toSafeUser(u: DbUser): SafeUser {
  const { passwordHash, ...safe } = u;
  return safe;
}

export function findUserByEmail(email: string): DbUser | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DbUser | undefined;
}

export function findUserByUsername(username: string): DbUser | undefined {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username) as DbUser | undefined;
}

export function getUserById(id: string): DbUser | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as DbUser | undefined;
}

export function getSafeUserById(id: string): SafeUser | undefined {
  const u = getUserById(id);
  return u ? toSafeUser(u) : undefined;
}

export function createUser(email: string, username: string, password: string, role = 'user'): SafeUser {
  const id = crypto.randomUUID();
  const passwordHash = bcrypt.hashSync(password, 10);
  const createdAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO users (id, email, username, passwordHash, role, balance, createdAt)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(id, email, username, passwordHash, role, createdAt);
  return getSafeUserById(id)!;
}

export function verifyPassword(user: DbUser, password: string): boolean {
  return bcrypt.compareSync(password, user.passwordHash);
}

export function updateUser(id: string, fields: Partial<Pick<DbUser, 'username' | 'avatar' | 'fullName' | 'bio' | 'phone' | 'language' | 'timezone' | 'twoFa' | 'loginAlerts' | 'balance' | 'role'>>): SafeUser | undefined {
  const allowed = ['username', 'avatar', 'fullName', 'bio', 'phone', 'language', 'timezone', 'twoFa', 'loginAlerts', 'balance', 'role'] as const;
  const sets: string[] = [];
  const vals: any[] = [];
  for (const key of allowed) {
    if (key in fields) {
      sets.push(`${key} = ?`);
      vals.push((fields as any)[key]);
    }
  }
  if (sets.length === 0) return getSafeUserById(id);
  vals.push(id);
  db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
  return getSafeUserById(id);
}

export function changePassword(id: string, newPassword: string): void {
  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET passwordHash = ? WHERE id = ?').run(hash, id);
}

export function getAllUsers(): SafeUser[] {
  const rows = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all() as DbUser[];
  return rows.map(toSafeUser);
}

export function deleteUser(id: string): void {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}

// ── Sessions ─────────────────────────────────────────

export interface DbSession {
  token: string;
  userId: string;
  device: string | null;
  browser: string | null;
  ip: string | null;
  location: string | null;
  createdAt: string;
  lastActive: string;
}

export function createSession(userId: string, meta?: { device?: string; browser?: string; ip?: string; location?: string }): string {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO sessions (token, userId, device, browser, ip, location, createdAt, lastActive)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(token, userId, meta?.device || null, meta?.browser || null, meta?.ip || null, meta?.location || null, now, now);
  return token;
}

export function findSession(token: string): DbSession | undefined {
  return db.prepare('SELECT * FROM sessions WHERE token = ?').get(token) as DbSession | undefined;
}

export function touchSession(token: string): void {
  db.prepare('UPDATE sessions SET lastActive = ? WHERE token = ?').run(new Date().toISOString(), token);
}

export function deleteSession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function deleteUserSessions(userId: string): void {
  db.prepare('DELETE FROM sessions WHERE userId = ?').run(userId);
}

export function getUserSessions(userId: string): DbSession[] {
  return db.prepare('SELECT * FROM sessions WHERE userId = ? ORDER BY lastActive DESC').all(userId) as DbSession[];
}

// ── Settings CRUD ──────────────────────────────────

export function getSetting(key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

export function getAllSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}

export function getNextAvailableMcPort(basePort: number = 25565): number {
  const usedPorts = db.prepare('SELECT port FROM servers WHERE type = ?').all('minecraft').map((r: any) => r.port);
  let port = basePort;
  while (usedPorts.includes(port)) port++;
  return port;
}
