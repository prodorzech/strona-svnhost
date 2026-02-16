// ── Server Types ────────────────────────────────────────

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'installing' | 'error';
export type ServerType = 'fivem' | 'minecraft' | 'vps' | 'vds' | 'bot';
export type MinecraftFlavor = 'paper' | 'vanilla' | 'spigot' | 'forge' | 'fabric';

export interface GameServer {
  id: string;
  userId: string;
  name: string;
  type: ServerType;
  status: ServerStatus;
  port: number;
  maxPlayers: number;
  ip: string;
  createdAt: string;
  expiresAt: string;

  // FiveM specific
  txAdminPort?: number;
  serverCfgPath?: string;
  gameBuild?: string;
  oneSync?: string;
  licensKey?: string;
  txAdminToken?: string;

  // Minecraft specific
  mcVersion?: string;          // e.g. "1.21.4"
  mcFlavor?: MinecraftFlavor;  // paper, vanilla, spigot, etc.
  mcJarFile?: string;          // filename of the server jar
  ramMb?: number;              // allocated RAM in MB
  javaPath?: string;           // path to java binary

  // VPS specific
  os?: string;                 // e.g. "ubuntu-24.04"
  cpuCores?: number;
  diskGb?: number;
  sshPort?: number;
  sshUser?: string;
  sshPassword?: string;

  // Bot specific
  botRuntime?: 'nodejs' | 'python';
  botToken?: string;

  // Runtime
  pid?: number;
  cpuUsage?: number;
  ramUsage?: number;
  currentPlayers?: number;
}

export interface ConsoleLog {
  timestamp: string;
  message: string;
  type: 'stdout' | 'stderr' | 'system';
}

export interface ServerConfig {
  serverName: string;
  maxPlayers: number;
  gameBuild: string;
  oneSync: string;
  licenseKey: string;
  port: number;
  txAdminPort: number;
  resources: string[];
  locale: string;
  tags: string;
}

export interface CreateServerRequest {
  id?: string;           // Optional: use this ID instead of generating a new one (for frontend sync)
  name: string;
  type: ServerType;
  maxPlayers?: number;
  port?: number;

  // FiveM specific
  gameBuild?: string;
  oneSync?: string;
  licenseKey?: string;
  txAdminPort?: number;

  // Minecraft specific
  mcVersion?: string;
  mcFlavor?: MinecraftFlavor;
  ramMb?: number;
  javaPath?: string;

  // VPS specific
  os?: string;
  cpuCores?: number;
  diskGb?: number;
  sshPort?: number;

  // Bot specific
  botRuntime?: 'nodejs' | 'python';
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
