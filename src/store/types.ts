export type UserRole = 'user' | 'admin';
export type ServerStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'installing';
export type ServerType = 'vps' | 'vds' | 'fivem' | 'minecraft' | 'bot';
export type TransactionType = 'topup' | 'purchase' | 'refund' | 'admin_add' | 'admin_remove' | 'promo_code';

export interface UserSettings {
  emailNotifs: boolean;
  serverAlerts: boolean;
  billingNotifs: boolean;
  newsNotifs: boolean;
  ticketNotifs: boolean;
  maintenanceNotifs: boolean;
  compactMode: boolean;
  animationsEnabled: boolean;
  showServerIp: boolean;
  theme: 'dark' | 'light';
  accentColor: string;
}

export interface UserBilling {
  companyName: string;
  nip: string;
  address: string;
  city: string;
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

export interface User {
  id: string;
  email: string;
  password?: string; // Not used with backend auth
  username: string;
  role: UserRole;
  balance: number;
  createdAt: string;
  avatar?: string;
  fullName?: string;
  bio?: string;
  phone?: string;
  language?: string;
  timezone?: string;
  twoFa?: boolean;
  loginAlerts?: boolean;
  settings?: UserSettings;
  billing?: UserBilling;
  sessions?: UserSession[];
}

export interface Server {
  id: string;
  userId: string;
  name: string;
  type: ServerType;
  status: ServerStatus;
  plan: string;
  ip: string;
  port: number;
  // Resources
  cpuCores: number;
  ramMb: number;
  diskGb: number;
  // Usage (simulated)
  cpuUsage: number;
  ramUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  // VPS/VDS specific
  os?: string;
  sshPort?: number;
  sshUser?: string;
  sshPassword?: string;
  // Game specific
  maxPlayers?: number;
  currentPlayers?: number;
  gameVersion?: string;
  modpack?: string;
  // Bot specific
  botRuntime?: 'nodejs' | 'python';
  botToken?: string;
  // Dates
  createdAt: string;
  expiresAt: string;
  // Console logs
  consoleLogs: string[];
  // Files (simplified)
  files: FileNode[];
  // Auto restart
  autoRestart: boolean;
  // Backups
  backups: Backup[];
  // FiveM startup config
  startupConfig?: StartupConfig;
  // Databases
  databases: Database[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  content?: string;
  children?: FileNode[];
}

export interface Backup {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  locked?: boolean;
}

export interface StartupConfig {
  steamWebApiKey?: string;
  serverLicenseKey?: string;
  serverTags?: string;
  gameBuild?: string;
  svMaxClients?: number;
  oneSync?: 'on' | 'off' | 'legacy';
  txAdminPort?: number;
  // txAdmin state
  txAdminData?: TxAdminData;
}

export interface TxAdminPlayer {
  id: number;
  name: string;
  identifiers: string[];
  ping: number;
  joinedAt: string;
}

export interface TxAdminBan {
  id: string;
  playerName: string;
  identifier: string;
  reason: string;
  bannedBy: string;
  bannedAt: string;
  expiresAt?: string; // undefined = permanent
}

export interface TxAdminResource {
  name: string;
  status: 'started' | 'stopped';
  description?: string;
  version?: string;
  author?: string;
}

export interface TxAdminSchedule {
  id: string;
  time: string; // HH:MM
  days: string[]; // mon, tue, wed...
  action: 'restart' | 'stop' | 'backup';
  enabled: boolean;
}

export interface TxAdminData {
  players: TxAdminPlayer[];
  bans: TxAdminBan[];
  resources: TxAdminResource[];
  schedules: TxAdminSchedule[];
  announcements: string[];
  whitelist: boolean;
  whitelistIds: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
}

export interface PromoCode {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  currentUses: number;
  usedBy: string[];
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'general' | 'technical' | 'billing' | 'abuse' | 'other';

export interface Ticket {
  id: string;
  userId: string;
  subject: string;
  description?: string;
  status: 'open' | 'answered' | 'closed';
  priority: TicketPriority;
  category: TicketCategory;
  adminLabel?: string;
  messages: TicketMessage[];
  createdAt: string;
  closedAt?: string;
}

export interface TicketMessage {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface ServicePlan {
  id: string;
  type: ServerType;
  name: string;
  price: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  cpuCores: number;
  ramMb: number;
  diskGb: number;
  features: string[];
  popular?: boolean;
  active?: boolean;
}

export interface Database {
  id: string;
  name: string;
  username: string;
  password: string;
  host: string;
  port: number;
  sizeUsedMb: number;
  maxSizeMb: number;
  createdAt: string;
}

export interface HostingNode {
  id: string;
  name: string;
  ip: string;
  location: string;
  totalCpu: number;
  totalRamMb: number;
  totalDiskGb: number;
  usedCpu: number;
  usedRamMb: number;
  usedDiskGb: number;
  maxServers: number; // 0 = unlimited
  status: 'online' | 'offline' | 'maintenance';
  createdAt: string;
}

export interface AdminSettings {
  stripePublicKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeEnabled: boolean;
  phpMyAdminUrl: string;
  phpMyAdminEnabled: boolean;
  disabledOffers: ServerType[];
  loginEnabled: boolean;
}

// ── Custom configurator pricing & limits per server type ───
export interface CustomConfigLimits {
  // Price per unit (monthly, in zł)
  pricePerCore: number;
  pricePerGbRam: number;
  pricePerGbDisk: number;
  // Min / Max
  minCpu: number;
  maxCpu: number;
  minRamGb: number;
  maxRamGb: number;
  minDiskGb: number;
  maxDiskGb: number;
  diskStep: number;        // step for disk slider (e.g. 10)
  enabled: boolean;        // whether custom config is available for this type
}

export type CustomConfigByType = Record<ServerType, CustomConfigLimits>;

export interface StoreState {
  users: User[];
  servers: Server[];
  transactions: Transaction[];
  promoCodes: PromoCode[];
  tickets: Ticket[];
  servicePlans: ServicePlan[];
  nodes: HostingNode[];
  adminSettings: AdminSettings;
  customConfig: CustomConfigByType;
  currentUserId: string | null;
}
