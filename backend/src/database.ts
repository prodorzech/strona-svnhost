import Database from 'better-sqlite3';
import path from 'path';
import { GameServer } from './types';

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

export function getNextAvailableMcPort(basePort: number = 25565): number {
  const usedPorts = db.prepare('SELECT port FROM servers WHERE type = ?').all('minecraft').map((r: any) => r.port);
  let port = basePort;
  while (usedPorts.includes(port)) port++;
  return port;
}
