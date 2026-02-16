// ── SVNHost Backend API Client ──────────────────────────
// Connects the frontend to the real backend for server management

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

// ── Types ───────────────────────────────────────────────
export interface BackendServer {
  id: string;
  userId: string;
  name: string;
  type: string;
  status: string;
  port: number;
  txAdminPort?: number;
  maxPlayers: number;
  ip: string;
  gameBuild?: string;
  oneSync?: string;
  licenseKey?: string;
  running?: boolean;
  pid?: number;
  cpuUsage?: number;
  ramUsageMb?: number;
  ramMb?: number;
  createdAt: string;
  expiresAt: string;
}

export interface ConsoleLog {
  timestamp: string;
  message: string;
  type: 'stdout' | 'stderr' | 'system';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── API Calls ───────────────────────────────────────────
async function apiCall<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection failed' };
  }
}

export const backendApi = {
  // Health check
  health: () => apiCall<{ status: string; fxServerInstalled: boolean }>('/health'),

  // Servers
  getServers: () => apiCall<BackendServer[]>('/servers'),
  getServer: (id: string) => apiCall<BackendServer>(`/servers/${id}`),
  createServer: (data: {
    id?: string; name: string; type?: string; maxPlayers?: number;
    // FiveM
    gameBuild?: string; oneSync?: string; licenseKey?: string; txAdminPort?: number;
    // Minecraft
    mcVersion?: string; mcFlavor?: string; ramMb?: number; javaPath?: string;
    // VPS
    os?: string; cpuCores?: number; diskGb?: number;
    port?: number;
  }) =>
    apiCall<BackendServer>('/servers', { method: 'POST', body: JSON.stringify(data) }),
  deleteServer: (id: string) => apiCall(`/servers/${id}`, { method: 'DELETE' }),

  // Server actions
  startServer: (id: string) => apiCall(`/servers/${id}/start`, { method: 'POST' }),
  stopServer: (id: string) => apiCall(`/servers/${id}/stop`, { method: 'POST' }),
  restartServer: (id: string) => apiCall(`/servers/${id}/restart`, { method: 'POST' }),
  reinstallServer: (id: string, os: string) =>
    apiCall(`/servers/${id}/reinstall`, { method: 'POST', body: JSON.stringify({ os }) }),

  // Console
  sendCommand: (id: string, command: string) =>
    apiCall(`/servers/${id}/command`, { method: 'POST', body: JSON.stringify({ command }) }),
  getConsoleLogs: (id: string) => apiCall<ConsoleLog[]>(`/servers/${id}/console`),
  clearConsole: (id: string) => apiCall(`/servers/${id}/console/clear`, { method: 'POST' }),

  // Files
  getFiles: (id: string, path?: string) => apiCall<{ name: string; type: string; size?: number }[]>(`/servers/${id}/files?path=${encodeURIComponent(path || '')}`),
  readFile: (id: string, path: string) => apiCall<{ content: string }>(`/servers/${id}/files/read?path=${encodeURIComponent(path)}`),
  writeFile: (id: string, path: string, content: string) =>
    apiCall(`/servers/${id}/files/write`, { method: 'POST', body: JSON.stringify({ path, content }) }),

  // Config
  updateConfig: (id: string, config: { licenseKey?: string; maxPlayers?: number; gameBuild?: string; oneSync?: string; hostname?: string }) =>
    apiCall(`/servers/${id}/config`, { method: 'PUT', body: JSON.stringify(config) }),

  // Databases (real MySQL)
  createDatabase: (dbName: string, username: string, password: string) =>
    apiCall('/databases', { method: 'POST', body: JSON.stringify({ dbName, username, password }) }),
  deleteDatabase: (dbName: string, username: string) =>
    apiCall('/databases', { method: 'DELETE', body: JSON.stringify({ dbName, username }) }),
};

// ── WebSocket (Socket.IO) ───────────────────────────────
let socket: any = null;
let socketReady = false;

export async function connectWebSocket(): Promise<void> {
  if (socket) return;
  try {
    const { io } = await import('socket.io-client');
    socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socket.on('connect', () => {
      socketReady = true;
      console.log('[WS] Connected to backend');
    });
    socket.on('disconnect', () => {
      socketReady = false;
      console.log('[WS] Disconnected from backend');
    });
  } catch {
    console.warn('[WS] Socket.IO client not available');
  }
}

export function joinServerRoom(serverId: string): void {
  if (socket && socketReady) socket.emit('server:join', serverId);
}

export function leaveServerRoom(serverId: string): void {
  if (socket && socketReady) socket.emit('server:leave', serverId);
}

export function onConsoleLine(callback: (log: ConsoleLog) => void): () => void {
  if (!socket) return () => {};
  socket.on('console:line', callback);
  return () => socket.off('console:line', callback);
}

export function onServerStatus(callback: (data: { id: string; status: string; pid?: number }) => void): () => void {
  if (!socket) return () => {};
  socket.on('server:status', callback);
  return () => socket.off('server:status', callback);
}

export function sendCommandViaWs(serverId: string, command: string): void {
  if (socket && socketReady) {
    socket.emit('server:command', { serverId, command });
  }
}

export function isBackendConnected(): boolean {
  return socketReady;
}
