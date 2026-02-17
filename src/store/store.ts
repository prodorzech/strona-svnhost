import type {
  StoreState, User, UserRole, Server, Transaction, PromoCode, Ticket, TicketMessage,
  ServicePlan, ServerType, ServerStatus, TransactionType, FileNode, Backup, StartupConfig,
  TicketPriority, TicketCategory, Database, HostingNode, AdminSettings,
  TxAdminPlayer, TxAdminBan, TxAdminResource, TxAdminSchedule, TxAdminData,
  CustomConfigByType, CustomConfigLimits,
} from './types';

const STORE_KEY = 'svnhost_store';

// ── Default service plans ──────────────────────────────────
const defaultPlans: ServicePlan[] = [
  // VPS
  { id: 'vps-starter', type: 'vps', name: 'VPS Starter', price: 19.99, period: 'monthly', cpuCores: 2, ramMb: 4096, diskGb: 30, features: ['2 vCore CPU', '4 GB RAM DDR5', '30 GB NVMe', 'Anti-DDoS', 'IPv4', 'Backup 3-dniowy'] },
  { id: 'vps-pro', type: 'vps', name: 'VPS Professional', price: 79.99, period: 'monthly', cpuCores: 4, ramMb: 16384, diskGb: 120, features: ['4 vCore CPU', '16 GB RAM DDR5 ECC', '120 GB NVMe Enterprise', 'Advanced Anti-DDoS', 'IPv4', 'Backup codzienny'], popular: true },
  { id: 'vps-enterprise', type: 'vps', name: 'VPS Enterprise', price: 159.99, period: 'monthly', cpuCores: 8, ramMb: 32768, diskGb: 250, features: ['8 vCore CPU', '32 GB RAM DDR5 ECC', '250 GB NVMe Enterprise', 'Premium Anti-DDoS', 'IPv4 + IPv6', 'Backup codzienny + off-site'] },
  // FiveM
  { id: 'fivem-starter', type: 'fivem', name: 'FiveM Starter', price: 39.99, period: 'monthly', cpuCores: 4, ramMb: 8192, diskGb: 50, features: ['4 vCore CPU', '8 GB RAM', '50 GB SSD', 'Ochrona DDoS Gaming', 'Auto-restart', '64 sloty'] },
  { id: 'fivem-pro', type: 'fivem', name: 'FiveM Pro', price: 79.99, period: 'monthly', cpuCores: 6, ramMb: 16384, diskGb: 100, features: ['6 vCore CPU', '16 GB RAM', '100 GB SSD', 'Premium DDoS Gaming', 'Auto-restart', '128 slotów'], popular: true },
  { id: 'fivem-ultra', type: 'fivem', name: 'FiveM Ultra', price: 149.99, period: 'monthly', cpuCores: 8, ramMb: 32768, diskGb: 200, features: ['8 vCore CPU', '32 GB RAM', '200 GB SSD', 'Premium DDoS Gaming', 'Auto-restart', '256 slotów'] },
  // Minecraft
  { id: 'mc-starter', type: 'minecraft', name: 'MC Starter', price: 9.99, period: 'monthly', cpuCores: 2, ramMb: 2048, diskGb: 10, features: ['2 vCore', '2 GB RAM', '10 GB SSD', 'Anti-DDoS', '20 slotów', 'Auto-install modów'] },
  { id: 'mc-pro', type: 'minecraft', name: 'MC Pro', price: 29.99, period: 'monthly', cpuCores: 4, ramMb: 8192, diskGb: 30, features: ['4 vCore', '8 GB RAM', '30 GB SSD', 'Anti-DDoS', '60 slotów', 'Panel + mody'], popular: true },
  { id: 'mc-ultra', type: 'minecraft', name: 'MC Ultra', price: 59.99, period: 'monthly', cpuCores: 6, ramMb: 16384, diskGb: 60, features: ['6 vCore', '16 GB RAM', '60 GB SSD', 'Premium Anti-DDoS', '120 slotów', 'Panel + mody + backup'] },
  // Bot Discord
  { id: 'bot-starter', type: 'bot', name: 'Bot Starter', price: 9.99, period: 'monthly', cpuCores: 1, ramMb: 512, diskGb: 5, features: ['1 vCPU', '512 MB RAM', '5 GB SSD', 'Node.js / Python', 'Auto-restart', 'Konsola online'] },
  { id: 'bot-pro', type: 'bot', name: 'Bot Pro', price: 19.99, period: 'monthly', cpuCores: 2, ramMb: 1024, diskGb: 10, features: ['2 vCPU', '1 GB RAM', '10 GB SSD', 'Node.js / Python', 'Auto-restart', 'Konsola + pliki'], popular: true },
  { id: 'bot-ultra', type: 'bot', name: 'Bot Ultra', price: 39.99, period: 'monthly', cpuCores: 2, ramMb: 2048, diskGb: 20, features: ['2 vCPU', '2 GB RAM', '20 GB SSD', 'Node.js / Python', 'Auto-restart', 'Konsola + pliki + backup'] },
];

const defaultFiles: FileNode[] = [
  { name: 'server.cfg', type: 'file', size: 2048, modified: new Date().toISOString(), content: '# Server Configuration\nendpoint_add_tcp "0.0.0.0:30120"\nendpoint_add_udp "0.0.0.0:30120"\nsv_hostname "My Server"\nsv_maxclients 64\n' },
  { name: 'resources', type: 'folder', modified: new Date().toISOString(), children: [
    { name: '[core]', type: 'folder', modified: new Date().toISOString(), children: [
      { name: 'chat', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'fxmanifest.lua', type: 'file', size: 512, modified: new Date().toISOString(), content: 'fx_version "cerulean"\ngame "gta5"\n' },
      ]},
    ]},
  ]},
  { name: 'logs', type: 'folder', modified: new Date().toISOString(), children: [
    { name: 'server.log', type: 'file', size: 10240, modified: new Date().toISOString(), content: '[INFO] Server started\n[INFO] Listening on 0.0.0.0:30120\n' },
  ]},
];

const defaultFiveMFiles: FileNode[] = [
  { name: 'server.cfg', type: 'file', size: 3072, modified: new Date().toISOString(), content: '# FiveM Server Configuration\n# Wygenerowano automatycznie przez SVNHost\n\nendpoint_add_tcp "0.0.0.0:30120"\nendpoint_add_udp "0.0.0.0:30120"\n\nsv_hostname "Moj Serwer FiveM"\nsv_maxclients 64\nset steam_webApiKey ""\nsv_licenseKey ""\n\nsets sv_projectName "Moj Serwer"\nsets sv_projectDesc "Serwer FiveM hostowany na SVNHost"\n\n# OneSync\nset onesync on\n\n# Zasoby\nensure mapmanager\nensure chat\nensure spawnmanager\nensure sessionmanager\nensure basic-gamemode\nensure hardcap\n' },
  { name: 'server-data', type: 'folder', modified: new Date().toISOString(), children: [
    { name: 'FXServer.exe', type: 'file', size: 28672000, modified: new Date().toISOString(), content: '' },
    { name: 'run.cmd', type: 'file', size: 256, modified: new Date().toISOString(), content: '@echo off\n.\\FXServer.exe +exec server.cfg' },
  ]},
  { name: 'resources', type: 'folder', modified: new Date().toISOString(), children: [
    { name: '[system]', type: 'folder', modified: new Date().toISOString(), children: [
      { name: 'mapmanager', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'fxmanifest.lua', type: 'file', size: 1024, modified: new Date().toISOString(), content: 'fx_version "cerulean"\ngame "gta5"\nauthor "cfx"\n' },
      ]},
      { name: 'chat', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'fxmanifest.lua', type: 'file', size: 512, modified: new Date().toISOString(), content: 'fx_version "cerulean"\ngame "gta5"\n' },
        { name: 'html', type: 'folder', modified: new Date().toISOString(), children: [
          { name: 'index.html', type: 'file', size: 2048, modified: new Date().toISOString(), content: '<!DOCTYPE html>\n<html><body><div id="chat"></div></body></html>' },
        ]},
      ]},
      { name: 'spawnmanager', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'fxmanifest.lua', type: 'file', size: 512, modified: new Date().toISOString(), content: 'fx_version "cerulean"\ngame "gta5"\n' },
      ]},
      { name: 'sessionmanager', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'fxmanifest.lua', type: 'file', size: 512, modified: new Date().toISOString(), content: 'fx_version "cerulean"\ngame "gta5"\n' },
      ]},
      { name: 'hardcap', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'fxmanifest.lua', type: 'file', size: 256, modified: new Date().toISOString(), content: 'fx_version "cerulean"\ngame "gta5"\n' },
      ]},
    ]},
    { name: '[gamemodes]', type: 'folder', modified: new Date().toISOString(), children: [
      { name: 'basic-gamemode', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'fxmanifest.lua', type: 'file', size: 512, modified: new Date().toISOString(), content: 'fx_version "cerulean"\ngame "gta5"\n' },
      ]},
    ]},
    { name: '[standalone]', type: 'folder', modified: new Date().toISOString(), children: [] },
  ]},
  { name: 'txData', type: 'folder', modified: new Date().toISOString(), children: [
    { name: 'config.json', type: 'file', size: 512, modified: new Date().toISOString(), content: '{"txAdminPort": 40120}' },
  ]},
  { name: 'cache', type: 'folder', modified: new Date().toISOString(), children: [] },
  { name: 'logs', type: 'folder', modified: new Date().toISOString(), children: [
    { name: 'server.log', type: 'file', size: 10240, modified: new Date().toISOString(), content: '[INFO] FiveM Server initialized\n[INFO] Listening on 0.0.0.0:30120\n[INFO] txAdmin running on http://0.0.0.0:40120\n' },
  ]},
];

function generateBotFiles(runtime: 'nodejs' | 'python', botName: string): FileNode[] {
  const now = new Date().toISOString();
  if (runtime === 'nodejs') {
    return [
      { name: 'package.json', type: 'file', size: 512, modified: now, content: `{
  "name": "${botName.toLowerCase().replace(/\\s+/g, '-')}",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.3.1"
  }
}` },
      { name: 'index.js', type: 'file', size: 1024, modified: now, content: `const { Client, GatewayIntentBits, Events } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(\`✅ Bot zalogowany jako \${c.user.tag}\`);
  console.log(\`📡 Serwery: \${c.guilds.cache.size}\`);
  console.log(\`👤 Użytkownicy: \${c.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\`);
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  if (message.content === '!ping') {
    message.reply(\`🏓 Pong! Latencja: \${client.ws.ping}ms\`);
  }
});

client.login(process.env.DISCORD_TOKEN);
` },
      { name: '.env', type: 'file', size: 64, modified: now, content: `DISCORD_TOKEN=WKLEJ_SWOJ_TOKEN_TUTAJ\n` },
      { name: 'node_modules', type: 'folder', modified: now, children: [
        { name: 'discord.js', type: 'folder', modified: now, children: [] },
        { name: 'dotenv', type: 'folder', modified: now, children: [] },
      ]},
      { name: 'logs', type: 'folder', modified: now, children: [
        { name: 'bot.log', type: 'file', size: 0, modified: now, content: '' },
      ]},
    ];
  } else {
    return [
      { name: 'requirements.txt', type: 'file', size: 64, modified: now, content: `discord.py>=2.3.0\npython-dotenv>=1.0.0\n` },
      { name: 'bot.py', type: 'file', size: 1024, modified: now, content: `import discord
from discord.ext import commands
import os
from dotenv import load_dotenv

load_dotenv()

intents = discord.Intents.default()
intents.message_content = True

bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'✅ Bot zalogowany jako {bot.user}')
    print(f'📡 Serwery: {len(bot.guilds)}')
    print(f'👤 Użytkownicy: {sum(g.member_count for g in bot.guilds)}')

@bot.command()
async def ping(ctx):
    await ctx.reply(f'🏓 Pong! Latencja: {round(bot.latency * 1000)}ms')

bot.run(os.getenv('DISCORD_TOKEN'))
` },
      { name: '.env', type: 'file', size: 64, modified: now, content: `DISCORD_TOKEN=WKLEJ_SWOJ_TOKEN_TUTAJ\n` },
      { name: 'venv', type: 'folder', modified: now, children: [
        { name: 'lib', type: 'folder', modified: now, children: [] },
        { name: 'bin', type: 'folder', modified: now, children: [] },
      ]},
      { name: 'logs', type: 'folder', modified: now, children: [
        { name: 'bot.log', type: 'file', size: 0, modified: now, content: '' },
      ]},
    ];
  }
}

const defaultAdminSettings: AdminSettings = {
  stripePublicKey: '',
  stripeSecretKey: '',
  stripeWebhookSecret: '',
  stripeEnabled: false,
  phpMyAdminUrl: '',
  phpMyAdminEnabled: false,
  disabledOffers: [],
  loginEnabled: true,
};

function defaultConfigLimits(overrides?: Partial<CustomConfigLimits>): CustomConfigLimits {
  return {
    pricePerCore: 8,
    pricePerGbRam: 5,
    pricePerGbDisk: 0.5,
    minCpu: 1,
    maxCpu: 32,
    minRamGb: 1,
    maxRamGb: 128,
    minDiskGb: 10,
    maxDiskGb: 2000,
    diskStep: 10,
    enabled: true,
    ...overrides,
  };
}

const defaultCustomConfig: CustomConfigByType = {
  vps: defaultConfigLimits(),
  vds: defaultConfigLimits({ pricePerCore: 12, pricePerGbRam: 7, pricePerGbDisk: 0.8 }),
  fivem: defaultConfigLimits({ pricePerCore: 10, pricePerGbRam: 6, maxCpu: 16, maxRamGb: 64 }),
  minecraft: defaultConfigLimits({ pricePerCore: 8, pricePerGbRam: 5, maxCpu: 16, maxRamGb: 64 }),
  bot: defaultConfigLimits({ pricePerCore: 6, pricePerGbRam: 4, pricePerGbDisk: 0.3, maxCpu: 8, maxRamGb: 16, maxDiskGb: 100 }),
};

// ── Admin seed user ────────────────────────────────────────
function createInitialState(): StoreState {
  return {
    users: [{
      id: 'admin-1',
      email: 'admin@svnhost.pl',
      password: 'admin123',
      username: 'Admin',
      role: 'admin',
      balance: 99999,
      createdAt: new Date().toISOString(),
    }],
    servers: [],
    transactions: [],
    promoCodes: [
      { id: 'pc-1', code: 'WELCOME50', amount: 50, maxUses: 100, currentUses: 0, usedBy: [], active: true, createdAt: new Date().toISOString() },
      { id: 'pc-2', code: 'SVNHOST100', amount: 100, maxUses: 50, currentUses: 0, usedBy: [], active: true, createdAt: new Date().toISOString() },
    ],
    tickets: [],
    servicePlans: defaultPlans,
    nodes: [],
    adminSettings: defaultAdminSettings,
    customConfig: defaultCustomConfig,
    currentUserId: null,
  };
}

// ── Store singleton ────────────────────────────────────────
function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoreState;
      // Ensure plans exist
      if (!parsed.servicePlans || parsed.servicePlans.length === 0) {
        parsed.servicePlans = defaultPlans;
      }
      // Ensure new fields exist
      if (!parsed.nodes) parsed.nodes = [];
      // Ensure maxServers field on old nodes
      parsed.nodes = parsed.nodes.map((n: any) => ({ ...n, maxServers: n.maxServers ?? 0 }));
      if (!parsed.adminSettings) parsed.adminSettings = defaultAdminSettings;
      else parsed.adminSettings = { ...defaultAdminSettings, ...parsed.adminSettings };
      if (!parsed.customConfig) parsed.customConfig = defaultCustomConfig;
      // Ensure databases array on servers & reset live stats for non-running
      parsed.servers = parsed.servers.map(s => ({
        ...s,
        databases: s.databases || [],
        ...(s.status !== 'running' ? { cpuUsage: 0, ramUsage: 0, networkIn: 0, networkOut: 0 } : {}),
      }));
      // Ensure user settings/sessions exist
      parsed.users = parsed.users.map(u => ({
        ...u,
        settings: u.settings || defaultUserSettings(),
        sessions: u.sessions || [],
        billing: u.billing || { companyName: '', nip: '', address: '', city: '' },
      }));
      return parsed;
    }
  } catch { /* ignore */ }
  return createInitialState();
}

function saveState(state: StoreState): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

let state = loadState();
let listeners: Array<() => void> = [];

function notify(): void {
  saveState(state);
  listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void): () => void {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

export function getState(): StoreState {
  return state;
}

// ── Helpers ────────────────────────────────────────────────
function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function countServersOnNode(nodeIp: string): number {
  return state.servers.filter(s => s.ip === nodeIp).length;
}

/** Pick the first online node that still has capacity (maxServers).
 *  If a node is full, skip it and try the next one.
 *  maxServers === 0 means unlimited. */
function getServerIp(): string {
  if (state.nodes.length === 0) {
    return '127.0.0.1';
  }
  const onlineNodes = state.nodes.filter(n => n.status === 'online');
  for (const node of onlineNodes) {
    if (node.maxServers === 0 || countServersOnNode(node.ip) < node.maxServers) {
      return node.ip;
    }
  }
  // All online nodes full – try any node (first with capacity, then fallback)
  for (const node of state.nodes) {
    if (node.maxServers === 0 || countServersOnNode(node.ip) < node.maxServers) {
      return node.ip;
    }
  }
  // Absolute fallback – all nodes at max, use first node anyway
  return state.nodes[0].ip;
}

function getNextPort(type: ServerType): number {
  const existingPorts = state.servers
    .filter(s => s.type === type)
    .map(s => s.port)
    .sort((a, b) => a - b);

  switch (type) {
    case 'fivem': {
      const base = 30120;
      for (let i = 0; i < 200; i++) {
        if (!existingPorts.includes(base + i)) return base + i;
      }
      return base + existingPorts.length;
    }
    case 'minecraft': {
      const base = 25565;
      for (let i = 0; i < 200; i++) {
        if (!existingPorts.includes(base + i)) return base + i;
      }
      return base + existingPorts.length;
    }
    case 'vps': return 22;
    case 'vds': return 22;
    case 'bot': {
      const base = 8080;
      for (let i = 0; i < 200; i++) {
        if (!existingPorts.includes(base + i)) return base + i;
      }
      return base + existingPorts.length;
    }
  }
}

function getNextTxAdminPort(): number {
  const existingPorts = state.servers
    .filter(s => s.type === 'fivem' && s.startupConfig?.txAdminPort)
    .map(s => s.startupConfig!.txAdminPort!)
    .sort((a, b) => a - b);
  const base = 40120;
  for (let i = 0; i < 200; i++) {
    if (!existingPorts.includes(base + i)) return base + i;
  }
  return base + existingPorts.length;
}

// ── Auth actions (backed by backend API) ────────────────
// These are now thin wrappers – real auth happens in Login.tsx / Register.tsx
// via backendApi. The store just caches the current user.

import { backendApi, getToken, clearToken, AuthUser } from '../services/backendApi';

/** Cache the backend user into the store so getCurrentUser() keeps working */
export function setCurrentUserFromApi(apiUser: AuthUser): void {
  const user: User = {
    id: apiUser.id,
    email: apiUser.email,
    username: apiUser.username,
    role: apiUser.role as UserRole,
    balance: apiUser.balance,
    createdAt: apiUser.createdAt,
    avatar: apiUser.avatar || undefined,
    fullName: apiUser.fullName || undefined,
    bio: apiUser.bio || undefined,
    phone: apiUser.phone || undefined,
    language: apiUser.language,
    timezone: apiUser.timezone,
    twoFa: !!apiUser.twoFa,
    loginAlerts: !!apiUser.loginAlerts,
  };
  // Upsert user in state
  const exists = state.users.find(u => u.id === user.id);
  if (exists) {
    state = { ...state, users: state.users.map(u => u.id === user.id ? { ...u, ...user } : u), currentUserId: user.id };
  } else {
    state = { ...state, users: [...state.users, user], currentUserId: user.id };
  }
  notify();
}

/** Load current user from backend token on app start */
export async function loadCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await backendApi.auth.me();
    if (res.success && res.data) {
      setCurrentUserFromApi(res.data);
      return getCurrentUser();
    } else {
      clearToken();
      state = { ...state, currentUserId: null };
      notify();
      return null;
    }
  } catch {
    return null;
  }
}

/** Legacy sync register – kept for compatibility but now a no-op stub.
 *  Real registration goes through Login.tsx -> backendApi.auth.register()
 */
export function register(email: string, username: string, password: string): { success: boolean; error?: string } {
  // This is a stub – real registration is async via backendApi
  console.warn('[store] register() is deprecated – use backendApi.auth.register() instead');
  return { success: false, error: 'Use the API' };
}

/** Legacy sync login – kept for compatibility but now a no-op stub. */
export function login(email: string, password: string): { success: boolean; error?: string } {
  console.warn('[store] login() is deprecated – use backendApi.auth.login() instead');
  return { success: false, error: 'Use the API' };
}

function detectDevice(): string {
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Macintosh/i.test(ua)) return 'macOS';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Windows';
}

function detectBrowser(): string {
  const ua = navigator.userAgent;
  if (/Edg/i.test(ua)) return 'Edge';
  if (/OPR|Opera/i.test(ua)) return 'Opera';
  if (/Firefox/i.test(ua)) return 'Firefox';
  if (/Chrome/i.test(ua)) return 'Chrome';
  if (/Safari/i.test(ua)) return 'Safari';
  return 'Przeglądarka';
}

function generateFakeIp(): string {
  const a = Math.floor(Math.random() * 200) + 1;
  const b = Math.floor(Math.random() * 255);
  return `${a}.${b}.***.***`;
}

export function logout(): void {
  // Call backend logout (fire-and-forget)
  const token = getToken();
  if (token) {
    backendApi.auth.logout().catch(() => {});
  }
  clearToken();
  state = { ...state, currentUserId: null };
  notify();
}

export function getCurrentUser(): User | null {
  if (!state.currentUserId) return null;
  return state.users.find(u => u.id === state.currentUserId) || null;
}

// ── Wallet / Transactions ──────────────────────────────────
export function addBalance(userId: string, amount: number, type: TransactionType, description: string): void {
  state = {
    ...state,
    users: state.users.map(u => u.id === userId ? { ...u, balance: Math.round((u.balance + amount) * 100) / 100 } : u),
  };
  const user = state.users.find(u => u.id === userId)!;
  const tx: Transaction = {
    id: uid(),
    userId,
    type,
    amount,
    description,
    createdAt: new Date().toISOString(),
    balanceAfter: user.balance,
  };
  state = { ...state, transactions: [...state.transactions, tx] };
  notify();
}

export function topUpWallet(userId: string, amount: number): void {
  addBalance(userId, amount, 'topup', `Doładowanie portfela: +${amount.toFixed(2)} zł`);
}

export function redeemPromoCode(userId: string, code: string): { success: boolean; error?: string } {
  const promo = state.promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase() && p.active);
  if (!promo) return { success: false, error: 'Invalid or expired promo code' };
  if (promo.currentUses >= promo.maxUses) return { success: false, error: 'Promo code usage limit reached' };
  if (promo.usedBy.includes(userId)) return { success: false, error: 'You already used this code' };

  state = {
    ...state,
    promoCodes: state.promoCodes.map(p => p.id === promo.id ? { ...p, currentUses: p.currentUses + 1, usedBy: [...p.usedBy, userId] } : p),
  };
  addBalance(userId, promo.amount, 'promo_code', `Kod promocyjny ${promo.code}: +${promo.amount.toFixed(2)} zł`);
  return { success: true };
}

// ── Server management ──────────────────────────────────────
export function purchaseServer(userId: string, planId: string, serverName: string, options?: { botRuntime?: 'nodejs' | 'python' }): { success: boolean; error?: string; serverId?: string } {
  const plan = state.servicePlans.find(p => p.id === planId);
  if (!plan) return { success: false, error: 'Plan not found' };
  if (plan.type === 'vds') return { success: false, error: 'Serwery VDS są obecnie niedostępne w sprzedaży' };
  if (plan.type === 'bot' && !options?.botRuntime) return { success: false, error: 'Wybierz środowisko: Node.js lub Python' };

  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };
  if (user.balance < plan.price) return { success: false, error: `Insufficient balance. Need ${plan.price.toFixed(2)} zł, have ${user.balance.toFixed(2)} zł` };

  const serverId = uid();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const serverPort = getNextPort(plan.type);
  const txPort = plan.type === 'fivem' ? getNextTxAdminPort() : undefined;
  const isFiveM = plan.type === 'fivem';
  const isBot = plan.type === 'bot';
  const botRuntime = options?.botRuntime || 'nodejs';

  const server: Server = {
    id: serverId,
    userId,
    name: serverName,
    type: plan.type,
    status: 'installing',
    plan: plan.name,
    ip: getServerIp(),
    port: serverPort,
    cpuCores: plan.cpuCores,
    ramMb: plan.ramMb,
    diskGb: plan.diskGb,
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: Math.random() * 10,
    networkIn: 0,
    networkOut: 0,
    os: (plan.type === 'vps') ? 'Ubuntu 22.04 LTS' : undefined,
    sshPort: (plan.type === 'vps') ? 22 : undefined,
    maxPlayers: plan.type === 'fivem' ? (plan.ramMb <= 8192 ? 64 : plan.ramMb <= 16384 ? 128 : 256) :
                plan.type === 'minecraft' ? (plan.ramMb <= 2048 ? 20 : plan.ramMb <= 8192 ? 60 : 120) : undefined,
    currentPlayers: 0,
    gameVersion: plan.type === 'fivem' ? 'Latest (7290)' : plan.type === 'minecraft' ? '1.20.4' : undefined,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    consoleLogs: [
      `[${new Date().toLocaleTimeString()}] Server created.`,
      `[${new Date().toLocaleTimeString()}] Installing ${plan.type.toUpperCase()} environment...`,
      ...(isFiveM ? [
        `[${new Date().toLocaleTimeString()}] Downloading recommended FiveM server artifacts (v7290)...`,
        `[${new Date().toLocaleTimeString()}] Extracting server files...`,
        `[${new Date().toLocaleTimeString()}] Setting up txAdmin on port ${txPort}...`,
      ] : []),
      ...(isBot ? [
        `[${new Date().toLocaleTimeString()}] Instalacja ${botRuntime === 'nodejs' ? 'Node.js 20 LTS' : 'Python 3.12'}...`,
        `[${new Date().toLocaleTimeString()}] Tworzenie struktury projektu bota Discord...`,
        `[${new Date().toLocaleTimeString()}] Instalacja ${botRuntime === 'nodejs' ? 'discord.js v14' : 'discord.py v2.3'}...`,
      ] : []),
    ],
    files: isFiveM ? JSON.parse(JSON.stringify(defaultFiveMFiles)) :
           isBot ? generateBotFiles(botRuntime, serverName) :
           plan.type === 'minecraft' ? [...defaultFiles] : [
      { name: 'etc', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'hostname', type: 'file', size: 32, modified: new Date().toISOString(), content: serverName },
        { name: 'os-release', type: 'file', size: 256, modified: new Date().toISOString(), content: 'NAME="Ubuntu"\nVERSION="22.04 LTS"\n' },
      ]},
      { name: 'home', type: 'folder', modified: new Date().toISOString(), children: [] },
      { name: 'var', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'log', type: 'folder', modified: new Date().toISOString(), children: [
          { name: 'syslog', type: 'file', size: 4096, modified: new Date().toISOString(), content: 'System initialized\n' },
        ]},
      ]},
    ],
    autoRestart: true,
    backups: [],
    startupConfig: isFiveM ? { txAdminPort: txPort, oneSync: 'on', svMaxClients: plan.ramMb <= 8192 ? 64 : plan.ramMb <= 16384 ? 128 : 256, gameBuild: '3095' } : undefined,
    databases: [],
    botRuntime: isBot ? botRuntime : undefined,
  };

  state = { ...state, servers: [...state.servers, server] };
  addBalance(userId, -plan.price, 'purchase', `Zakup ${plan.name}: -${plan.price.toFixed(2)} zł`);

  // Simulate install completion, then auto-start
  setTimeout(() => {
    state = {
      ...state,
      servers: state.servers.map(s =>
        s.id === serverId ? {
          ...s,
          status: 'stopped' as ServerStatus,
          consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] Installation complete. Starting server...`],
        } : s
      ),
    };
    notify();
    startServer(serverId);
  }, 3000);

  return { success: true, serverId };
}

export function purchaseCustomServer(
  userId: string, type: ServerType, serverName: string,
  cpuCores: number, ramMb: number, diskGb: number, price: number, os?: string,
  botRuntime?: 'nodejs' | 'python',
): { success: boolean; error?: string; serverId?: string } {
  const user = state.users.find(u => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };
  if (price <= 0) return { success: false, error: 'Invalid price' };
  if (type === 'vds') return { success: false, error: 'Serwery VDS są obecnie niedostępne w sprzedaży' };
  if (type === 'bot' && !botRuntime) return { success: false, error: 'Wybierz środowisko: Node.js lub Python' };
  if (user.balance < price) return { success: false, error: `Niewystarczające środki. Potrzebujesz ${price.toFixed(2)} zł, masz ${user.balance.toFixed(2)} zł` };

  const serverId = uid();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const isVps = type === 'vps';
  const isFiveM = type === 'fivem';
  const isBot = type === 'bot';
  const serverPort = getNextPort(type);
  const txPort = isFiveM ? getNextTxAdminPort() : undefined;

  const server: Server = {
    id: serverId,
    userId,
    name: serverName,
    type,
    status: 'installing',
    plan: `Custom (${cpuCores}C/${(ramMb / 1024).toFixed(0)}G/${diskGb}G)`,
    ip: getServerIp(),
    port: serverPort,
    cpuCores,
    ramMb,
    diskGb,
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 0,
    networkIn: 0,
    networkOut: 0,
    os: isVps ? (os || 'Ubuntu 22.04 LTS') : undefined,
    sshPort: isVps ? 22 : undefined,
    maxPlayers: isFiveM ? (ramMb <= 8192 ? 64 : ramMb <= 16384 ? 128 : 256) :
                type === 'minecraft' ? (ramMb <= 2048 ? 20 : ramMb <= 8192 ? 60 : 120) : undefined,
    currentPlayers: 0,
    gameVersion: isFiveM ? 'Latest (7290)' : type === 'minecraft' ? '1.20.4' : undefined,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    consoleLogs: [
      `[${new Date().toLocaleTimeString()}] Custom server created.`,
      `[${new Date().toLocaleTimeString()}] Installing ${type.toUpperCase()} environment...`,
      ...(isFiveM ? [
        `[${new Date().toLocaleTimeString()}] Pobieranie FiveM Server Artifacts...`,
        `[${new Date().toLocaleTimeString()}] Konfiguracja txAdmin na porcie ${txPort}...`,
      ] : []),
      ...(isBot ? [
        `[${new Date().toLocaleTimeString()}] Instalacja ${botRuntime === 'nodejs' ? 'Node.js 20 LTS' : 'Python 3.12'}...`,
        `[${new Date().toLocaleTimeString()}] Tworzenie struktury projektu bota Discord...`,
      ] : []),
    ],
    files: isVps ? [
      { name: 'etc', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'hostname', type: 'file', size: 32, modified: new Date().toISOString(), content: serverName },
        { name: 'os-release', type: 'file', size: 256, modified: new Date().toISOString(), content: `NAME="${os || 'Ubuntu'}"\n` },
      ]},
      { name: 'home', type: 'folder', modified: new Date().toISOString(), children: [] },
      { name: 'var', type: 'folder', modified: new Date().toISOString(), children: [
        { name: 'log', type: 'folder', modified: new Date().toISOString(), children: [
          { name: 'syslog', type: 'file', size: 4096, modified: new Date().toISOString(), content: 'System initialized\n' },
        ]},
      ]},
    ] : isFiveM ? JSON.parse(JSON.stringify(defaultFiveMFiles)) : isBot ? generateBotFiles(botRuntime || 'nodejs', serverName) : [...defaultFiles],
    startupConfig: isFiveM ? { txAdminPort: txPort, oneSync: 'on' as const, svMaxClients: 64, gameBuild: '2802' } : undefined,
    autoRestart: true,
    backups: [],
    databases: [],
    botRuntime: isBot ? botRuntime : undefined,
  };

  state = { ...state, servers: [...state.servers, server] };
  addBalance(userId, -price, 'purchase', `Zakup ${type.toUpperCase()} Custom: -${price.toFixed(2)} zł`);

  // Simulate install completion, then auto-start
  setTimeout(() => {
    state = {
      ...state,
      servers: state.servers.map(s =>
        s.id === serverId ? {
          ...s,
          status: 'stopped' as ServerStatus,
          consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] Installation complete. Starting server...`],
        } : s
      ),
    };
    notify();
    startServer(serverId);
  }, 3000);

  return { success: true, serverId };
}

export function extendServer(userId: string, serverId: string, months: number): { success: boolean; error?: string } {
  const user = state.users.find(u => u.id === userId);
  const server = state.servers.find(s => s.id === serverId);
  if (!user) return { success: false, error: 'User not found' };
  if (!server) return { success: false, error: 'Server not found' };

  // Find matching plan to determine monthly price
  const plan = state.servicePlans.find(p => p.id === server.plan) ||
    state.servicePlans.find(p => p.type === server.type && p.cpuCores === server.cpuCores && p.ramMb === server.ramMb);
  // For custom servers, estimate price from resources
  const monthlyPrice = plan ? plan.price : (server.cpuCores * 8 + (server.ramMb / 1024) * 5 + server.diskGb * 0.5);
  const discount = months === 3 ? 0.9 : months === 6 ? 0.85 : 1;
  const totalPrice = Math.round(monthlyPrice * months * discount * 100) / 100;

  if (user.balance < totalPrice) return { success: false, error: `Niewystarczające środki. Potrzebujesz ${totalPrice.toFixed(2)} zł, masz ${user.balance.toFixed(2)} zł` };

  const currentExpiry = new Date(server.expiresAt);
  const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()));
  newExpiry.setMonth(newExpiry.getMonth() + months);

  state = {
    ...state,
    servers: state.servers.map(s => s.id === serverId ? { ...s, expiresAt: newExpiry.toISOString() } : s),
  };
  addBalance(userId, -totalPrice, 'purchase', `Przedłużenie serwera ${server.name} o ${months} mies.: -${totalPrice.toFixed(2)} zł`);
  return { success: true };
}

export function getServerMonthlyPrice(server: Server): number {
  const plan = state.servicePlans.find(p => p.id === server.plan) ||
    state.servicePlans.find(p => p.type === server.type && p.cpuCores === server.cpuCores && p.ramMb === server.ramMb);
  return plan ? plan.price : (server.cpuCores * 8 + (server.ramMb / 1024) * 5 + server.diskGb * 0.5);
}

export function adminAddServer(userId: string, type: ServerType, name: string, cpuCores: number, ramMb: number, diskGb: number): string {
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);
  const isFiveM = type === 'fivem';
  const isVps = type === 'vps';
  const isBot = type === 'bot';
  const serverPort = getNextPort(type);
  const txPort = isFiveM ? getNextTxAdminPort() : undefined;

  const server: Server = {
    id: uid(),
    userId,
    name,
    type,
    status: 'stopped',
    plan: 'Admin Assigned',
    ip: getServerIp(),
    port: serverPort,
    cpuCores,
    ramMb,
    diskGb,
    cpuUsage: 0,
    ramUsage: 0,
    diskUsage: 0,
    networkIn: 0,
    networkOut: 0,
    os: isVps ? 'Ubuntu 22.04 LTS' : undefined,
    sshPort: isVps ? 22 : undefined,
    maxPlayers: isFiveM ? 128 : type === 'minecraft' ? 60 : undefined,
    currentPlayers: 0,
    gameVersion: isFiveM ? 'Latest (7290)' : type === 'minecraft' ? '1.20.4' : undefined,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    consoleLogs: [`[${new Date().toLocaleTimeString()}] Server assigned by admin.`],
    files: isFiveM ? JSON.parse(JSON.stringify(defaultFiveMFiles)) : isBot ? generateBotFiles('nodejs', name) : defaultFiles,
    startupConfig: isFiveM ? { txAdminPort: txPort, oneSync: 'on' as const, svMaxClients: 64, gameBuild: '2802' } : undefined,
    autoRestart: false,
    backups: [],
    databases: [],
    botRuntime: isBot ? 'nodejs' : undefined,
  };

  state = { ...state, servers: [...state.servers, server] };
  notify();

  // Auto-start the server immediately after creation
  startServer(server.id);

  return server.id;
}

export function startServer(serverId: string): void {
  const srv = state.servers.find(s => s.id === serverId);
  if (!srv || srv.status === 'running') return;
  const isFM = srv.type === 'fivem';
  const isBOT = srv.type === 'bot';
  const botRT = srv.botRuntime || 'nodejs';
  const t = () => new Date().toLocaleTimeString();
  const txPort = srv.startupConfig?.txAdminPort || 40120;
  const port = srv.port;
  const ip = srv.ip;

  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      return {
        ...s,
        status: 'starting' as ServerStatus,
        consoleLogs: [...s.consoleLogs,
          `[${t()}] Starting server...`,
          ...(isBOT ? [
            `[${t()}]`,
            `[${t()}]  ======================================`,
            `[${t()}]   Discord Bot Hosting`,
            `[${t()}]   Runtime: ${botRT === 'nodejs' ? 'Node.js 20 LTS' : 'Python 3.12'}`,
            `[${t()}]  ======================================`,
            `[${t()}]`,
            `[${t()}] Sprawdzanie pliku .env...`,
            `[${t()}] Ładowanie ${botRT === 'nodejs' ? 'index.js' : 'bot.py'}...`,
          ] : []),
          ...(isFM ? [
            `[${t()}]`,
            `[${t()}]  ======================================`,
            `[${t()}]   FXServer v7290 (linux)`,
            `[${t()}]   txAdmin v7.2.0 - In-Game Menu Enabled`,
            `[${t()}]  ======================================`,
            `[${t()}]`,
            `[${t()}] [txAdmin] Checking server license key...`,
            `[${t()}] [txAdmin] License key validated ✓`,
            `[${t()}] [txAdmin] Starting txAdmin web panel on 0.0.0.0:${txPort}...`,
          ] : [
            `[${t()}] Loading server configuration...`,
          ]),
        ],
      };
    }),
  };
  notify();

  // Phase 2: resource loading (1s)
  setTimeout(() => {
    state = {
      ...state,
      servers: state.servers.map(s => {
        if (s.id !== serverId) return s;
        return {
          ...s,
          consoleLogs: [...s.consoleLogs,
            ...(isFM ? [
              `[${t()}] [txAdmin] Web panel started: http://${ip}:${txPort}`,
              `[${t()}] [txAdmin] PIN code: 1234 (use to link account)`,
              `[${t()}]`,
              `[${t()}] Authenticating server with Cfx.re...`,
              `[${t()}] Server license key authentication successful`,
              `[${t()}] Loading server configuration from server.cfg...`,
              `[${t()}]`,
              `[${t()}] ┌──────────────────────────────────────────┐`,
              `[${t()}] │  Setting up OneSync: ${s.startupConfig?.oneSync || 'on'}${' '.repeat(20 - (s.startupConfig?.oneSync || 'on').length)}│`,
              `[${t()}] │  sv_maxClients: ${s.startupConfig?.svMaxClients || 64}${' '.repeat(24 - String(s.startupConfig?.svMaxClients || 64).length)}│`,
              `[${t()}] │  Game build: ${s.startupConfig?.gameBuild || '3095'}${' '.repeat(27 - String(s.startupConfig?.gameBuild || '3095').length)}│`,
              `[${t()}] │  Endpoint: ${ip}:${port}${' '.repeat(Math.max(0, 29 - `${ip}:${port}`.length))}│`,
              `[${t()}] └──────────────────────────────────────────┘`,
              `[${t()}]`,
              `[${t()}] Loading resources...`,
              `[${t()}]   Starting resource mapmanager`,
              `[${t()}]   Starting resource chat`,
              `[${t()}]   Starting resource spawnmanager`,
              `[${t()}]   Starting resource sessionmanager`,
              `[${t()}]   Starting resource basic-gamemode`,
              `[${t()}]   Starting resource hardcap`,
              `[${t()}]   Starting resource monitor (txAdmin)`,
            ] : [
              `[${t()}] Loading resources...`,
            ]),
          ],
        };
      }),
    };
    notify();
  }, 800);

  // Phase 3: server ready (2s)
  setTimeout(() => {
    // Init txAdmin data for FiveM
    if (isFM) {
      const existing = srv.startupConfig?.txAdminData;
      if (!existing || existing.resources.length === 0) {
        updateTxAdminData(serverId, () => getDefaultTxAdminData());
      }
    }
    state = {
      ...state,
      servers: state.servers.map(s => {
        if (s.id !== serverId) return s;
        return {
          ...s,
          status: 'running' as ServerStatus,
          cpuUsage: 5 + Math.random() * 20,
          ramUsage: 20 + Math.random() * 30,
          networkIn: Math.random() * 100,
          networkOut: Math.random() * 50,
          currentPlayers: s.maxPlayers ? 0 : undefined,
          consoleLogs: [...s.consoleLogs,
            ...(isFM ? [
              `[${t()}]`,
              `[${t()}]   All resources started (7/7)`,
              `[${t()}]   Binding endpoint ${ip}:${port} (TCP)...`,
              `[${t()}]   Binding endpoint ${ip}:${port} (UDP)...`,
              `[${t()}]`,
              `[${t()}] ╔══════════════════════════════════════════╗`,
              `[${t()}] ║  Server started successfully!            ║`,
              `[${t()}] ║  Connect: ${ip}:${port}${' '.repeat(Math.max(0, 29 - `${ip}:${port}`.length))}║`,
              `[${t()}] ║  txAdmin: http://${ip}:${txPort}${' '.repeat(Math.max(0, 23 - `${ip}:${txPort}`.length))}║`,
              `[${t()}] ╚══════════════════════════════════════════╝`,
              `[${t()}]`,
              `[${t()}] [txAdmin] Server monitor started ✓`,
              `[${t()}] [txAdmin] Heartbeat OK — CPU ${(5 + Math.random() * 15).toFixed(1)}% | RAM ${(20 + Math.random() * 25).toFixed(0)}%`,
              `[${t()}] [txAdmin] Ready for players. Open http://${ip}:${txPort} to manage.`,
            ] : [
              `[${t()}] Server started successfully on ${ip}:${port}`,
              `[${t()}] Ready for connections.`,
            ]),
            ...(isBOT ? [
              `[${t()}]`,
              `[${t()}] ╔══════════════════════════════════════════╗`,
              `[${t()}] ║  ✅ Bot zalogowany jako DiscordBot       ║`,
              `[${t()}] ║  📡 Serwery: 1                           ║`,
              `[${t()}] ║  👤 Użytkownicy: 0                       ║`,
              `[${t()}] ║  Runtime: ${(botRT === 'nodejs' ? 'Node.js 20 LTS' : 'Python 3.12  ').padEnd(30)}║`,
              `[${t()}] ╚══════════════════════════════════════════╝`,
              `[${t()}]`,
              `[${t()}] Bot is online and ready!`,
              `[${t()}] Listening for commands...`,
            ] : []),
          ],
        };
      }),
    };
    notify();
  }, 2000);
}

export function stopServer(serverId: string): void {
  const srv = state.servers.find(s => s.id === serverId);
  if (!srv || srv.status !== 'running') return;
  const isFM = srv.type === 'fivem';
  const t = () => new Date().toLocaleTimeString();

  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      return {
        ...s,
        status: 'stopping' as ServerStatus,
        consoleLogs: [...s.consoleLogs,
          `[${t()}] Stopping server...`,
          ...(isFM ? [
            `[${t()}] [txAdmin] Sending shutdown signal...`,
            `[${t()}] [txAdmin] Disconnecting ${s.currentPlayers || 0} player(s)...`,
            `[${t()}] [txAdmin] Saving server state...`,
            `[${t()}] Stopping all resources...`,
          ] : []),
        ],
      };
    }),
  };
  notify();

  setTimeout(() => {
    // Clear players on stop
    if (isFM) {
      updateTxAdminData(serverId, data => ({ ...data, players: [] }));
    }
    state = {
      ...state,
      servers: state.servers.map(s => {
        if (s.id !== serverId) return s;
        return {
          ...s,
          status: 'stopped' as ServerStatus,
          cpuUsage: 0,
          ramUsage: 0,
          networkIn: 0,
          networkOut: 0,
          currentPlayers: 0,
          consoleLogs: [
            `[${t()}] ${isFM ? '[txAdmin] Server stopped. Goodbye.' : 'Server stopped.'}`,
          ],
        };
      }),
    };
    notify();
  }, 1500);
}

export function restartServer(serverId: string): void {
  stopServer(serverId);
  setTimeout(() => startServer(serverId), 2000);
}

export function sendConsoleCommand(serverId: string, command: string): void {
  const time = new Date().toLocaleTimeString();
  const server = state.servers.find(s => s.id === serverId);
  if (!server) return;
  const isFM = server.type === 'fivem';
  const txData = server.startupConfig?.txAdminData;
  const cmd = command.toLowerCase().trim();
  const txPort = server.startupConfig?.txAdminPort || 40120;

  let responses: string[] = [];

  if (isFM) {
    // FiveM / txAdmin aware commands
    if (cmd === 'help' || cmd === '?') {
      responses = [
        'Available commands:',
        '  help         - Show this help',
        '  status       - Server status overview',
        '  players      - List online players',
        '  resources    - List loaded resources',
        '  start <res>  - Start a resource',
        '  stop <res>   - Stop a resource',
        '  restart <res>- Restart a resource',
        '  ensure <res> - Ensure a resource is started',
        '  refresh      - Refresh resource list',
        '  kick <id>    - Kick a player by ID',
        '  say <msg>    - Server announcement',
        '  quit         - Stop the server',
        '  txadmin      - txAdmin info',
        '  heartbeat    - Check server health',
        '  sv_maxclients- Show max clients',
        '  version      - Show server version',
      ];
    } else if (cmd === 'status') {
      const uptime = `${Math.floor(Math.random() * 12)}h ${Math.floor(Math.random() * 59)}m`;
      responses = [
        `Server Status:`,
        `  Hostname: ${server.name}`,
        `  Endpoint: ${server.ip}:${server.port}`,
        `  Players:  ${txData?.players?.length || 0}/${server.maxPlayers || 64}`,
        `  Uptime:   ${uptime}`,
        `  txAdmin:  http://${server.ip}:${txPort} (${server.status === 'running' ? 'Active' : 'Inactive'})`,
        `  OneSync:  ${server.startupConfig?.oneSync || 'on'}`,
        `  Build:    ${server.startupConfig?.gameBuild || '3095'}`,
        `  CPU:      ${server.cpuUsage.toFixed(1)}%`,
        `  RAM:      ${server.ramUsage.toFixed(1)}%`,
        `  Resources: ${txData?.resources?.filter(r => r.status === 'started').length || 0} started`,
      ];
    } else if (cmd === 'players') {
      const pls = txData?.players || [];
      if (pls.length === 0) {
        responses = ['No players online.'];
      } else {
        responses = [`Online players (${pls.length}):`, ...pls.map(p => `  [${p.id}] ${p.name} | ping: ${p.ping}ms | steam: ${p.identifiers[0]?.substring(0, 30)}`)];
      }
    } else if (cmd === 'resources') {
      const res = txData?.resources || [];
      responses = [`Loaded resources (${res.length}):`, ...res.map(r => `  [${r.status === 'started' ? '✓' : '✗'}] ${r.name}${r.author ? ` (${r.author})` : ''}`)];
    } else if (cmd.startsWith('start ')) {
      const resName = cmd.substring(6).trim();
      if (resName) {
        txToggleResource(serverId, resName);
        responses = [`[txAdmin] Starting resource '${resName}'...`, `[txAdmin] Resource '${resName}' started.`];
      } else {
        responses = ['Usage: start <resource_name>'];
      }
    } else if (cmd.startsWith('stop ') && !cmd.startsWith('stop server')) {
      const resName = cmd.substring(5).trim();
      if (resName) {
        txToggleResource(serverId, resName);
        responses = [`[txAdmin] Stopping resource '${resName}'...`, `[txAdmin] Resource '${resName}' stopped.`];
      } else {
        responses = ['Usage: stop <resource_name>'];
      }
    } else if (cmd.startsWith('restart ')) {
      const resName = cmd.substring(8).trim();
      if (resName) {
        txRestartResource(serverId, resName);
        responses = [`[txAdmin] Restarting resource '${resName}'...`, `[txAdmin] Resource '${resName}' restarted.`];
      } else {
        responses = ['Usage: restart <resource_name>'];
      }
    } else if (cmd.startsWith('ensure ')) {
      const resName = cmd.substring(7).trim();
      responses = [`[txAdmin] Ensuring resource '${resName}'...`, `[txAdmin] Resource '${resName}' ensured (started).`];
    } else if (cmd === 'refresh') {
      responses = ['[txAdmin] Refreshing resource list...', '[txAdmin] Resource list refreshed. 7 resources loaded.'];
    } else if (cmd.startsWith('kick ')) {
      const idStr = cmd.substring(5).trim();
      const pid = parseInt(idStr);
      const player = txData?.players?.find(p => p.id === pid || p.name.toLowerCase() === idStr.toLowerCase());
      if (player) {
        txKickPlayer(serverId, player.id, 'Kicked via console');
        responses = [`[txAdmin] Player '${player.name}' (id: ${player.id}) has been kicked.`];
      } else {
        responses = [`Player '${idStr}' not found. Use 'players' to list IDs.`];
      }
    } else if (cmd.startsWith('say ')) {
      const msg = command.substring(4).trim();
      if (msg) {
        txSendAnnouncement(serverId, msg);
        responses = [`[txAdmin] Server announcement: ${msg}`];
      } else {
        responses = ['Usage: say <message>'];
      }
    } else if (cmd === 'quit' || cmd === 'stop server') {
      responses = ['[txAdmin] Initiating server shutdown...'];
      setTimeout(() => stopServer(serverId), 500);
    } else if (cmd === 'txadmin') {
      responses = [
        `txAdmin v7.2.0`,
        `  Panel URL: http://${server.ip}:${txPort}`,
        `  Status: ${server.status === 'running' ? 'Active ✓' : 'Inactive ✗'}`,
        `  Players: ${txData?.players?.length || 0}`,
        `  Bans: ${txData?.bans?.length || 0}`,
        `  Resources: ${txData?.resources?.length || 0}`,
        `  Whitelist: ${txData?.whitelist ? 'Enabled' : 'Disabled'}`,
        `  Schedules: ${txData?.schedules?.filter(s => s.enabled).length || 0} active`,
      ];
    } else if (cmd === 'heartbeat') {
      responses = [
        `[txAdmin] Heartbeat check:`,
        `  Server: OK ✓`,
        `  FD3:    OK ✓`,
        `  Health: ${Math.floor(90 + Math.random() * 10)}%`,
        `  CPU:    ${server.cpuUsage.toFixed(1)}%`,
        `  RAM:    ${server.ramUsage.toFixed(1)}%`,
        `  Tick:   ${(15 + Math.random() * 5).toFixed(1)}ms`,
      ];
    } else if (cmd === 'sv_maxclients') {
      responses = [`sv_maxClients is "${server.startupConfig?.svMaxClients || 64}" (default: 64)`];
    } else if (cmd === 'version') {
      responses = [
        `FXServer v7290 (linux)`,
        `txAdmin v7.2.0`,
        `OneSync: ${server.startupConfig?.oneSync || 'on'}`,
        `Game build: ${server.startupConfig?.gameBuild || '3095'}`,
      ];
    } else {
      responses = [`Unknown command: ${command}. Type 'help' for available commands.`];
    }
  } else {
    // Non-FiveM basic commands
    const simpleResponses: Record<string, string> = {
      help: 'Available commands: help, status, players, stop, restart, version',
      status: `Server is running. IP: ${server.ip}:${server.port}`,
      players: `Online players: ${server.currentPlayers || 0}/${server.maxPlayers || 'N/A'}`,
      version: `Server version: ${server.gameVersion || 'Latest'}`,
    };
    const response = simpleResponses[cmd] || `Unknown command: ${command}`;
    responses = [response];
  }

  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      return {
        ...s,
        consoleLogs: [...s.consoleLogs, `[${time}] > ${command}`, ...responses.map(r => `[${time}] ${r}`)],
      };
    }),
  };
  notify();
}

export function updateServerSettings(serverId: string, updates: Partial<Server>): void {
  state = {
    ...state,
    servers: state.servers.map(s => s.id === serverId ? { ...s, ...updates } : s),
  };
  notify();
}

export function deleteServer(serverId: string): void {
  state = {
    ...state,
    servers: state.servers.filter(s => s.id !== serverId),
  };
  notify();
}

export function createBackup(serverId: string): void {
  const backup: Backup = {
    id: uid(),
    name: `backup-${new Date().toISOString().slice(0, 10)}-${uid().slice(0, 4)}`,
    size: Math.floor(Math.random() * 500 + 100),
    createdAt: new Date().toISOString(),
    locked: false,
  };
  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId ? { ...s, backups: [...s.backups, backup] } : s
    ),
  };
  notify();
}

export function deleteBackup(serverId: string, backupId: string): void {
  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId
        ? { ...s, backups: s.backups.filter(b => b.id !== backupId) }
        : s
    ),
  };
  notify();
}

export function renameBackup(serverId: string, backupId: string, newName: string): void {
  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId
        ? { ...s, backups: s.backups.map(b => b.id === backupId ? { ...b, name: newName } : b) }
        : s
    ),
  };
  notify();
}

export function toggleBackupLock(serverId: string, backupId: string): void {
  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId
        ? { ...s, backups: s.backups.map(b => b.id === backupId ? { ...b, locked: !b.locked } : b) }
        : s
    ),
  };
  notify();
}

export function downloadBackup(_serverId: string, _backupId: string): void {
  const server = state.servers.find(s => s.id === _serverId);
  const backup = server?.backups.find(b => b.id === _backupId);
  const name = backup?.name || `backup-${_backupId}`;

  // Generate a minimal valid ZIP file in the browser
  // ZIP structure: local file header + file data + central directory + end of central directory
  const fileName = 'backup-info.txt';
  const fileContent = new TextEncoder().encode(
    `SVNHost Backup\nServer: ${server?.name || _serverId}\nDate: ${backup?.createdAt || new Date().toISOString()}\nType: ${server?.type || 'unknown'}\n\nThis is a simulated backup file.\nIn production, this would contain actual server data.\n`
  );

  const fileNameBytes = new TextEncoder().encode(fileName);
  const fnLen = fileNameBytes.length;
  const dataLen = fileContent.length;

  // Local file header (30 + fnLen)
  const localHeader = new Uint8Array(30 + fnLen + dataLen);
  const lv = new DataView(localHeader.buffer);
  lv.setUint32(0, 0x04034b50, true); // signature
  lv.setUint16(4, 20, true); // version needed
  lv.setUint16(6, 0, true);  // flags
  lv.setUint16(8, 0, true);  // compression (store)
  lv.setUint16(10, 0, true); // mod time
  lv.setUint16(12, 0, true); // mod date
  // CRC-32 — compute simple CRC
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < dataLen; i++) {
    crc ^= fileContent[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  crc ^= 0xFFFFFFFF;
  lv.setUint32(14, crc, true);
  lv.setUint32(18, dataLen, true); // compressed size
  lv.setUint32(22, dataLen, true); // uncompressed size
  lv.setUint16(26, fnLen, true);   // filename length
  lv.setUint16(28, 0, true);      // extra field length
  localHeader.set(fileNameBytes, 30);
  localHeader.set(fileContent, 30 + fnLen);

  // Central directory header (46 + fnLen)
  const centralDir = new Uint8Array(46 + fnLen);
  const cv = new DataView(centralDir.buffer);
  cv.setUint32(0, 0x02014b50, true); // signature
  cv.setUint16(4, 20, true); // version made by
  cv.setUint16(6, 20, true); // version needed
  cv.setUint16(8, 0, true);  // flags
  cv.setUint16(10, 0, true); // compression
  cv.setUint16(12, 0, true); // mod time
  cv.setUint16(14, 0, true); // mod date
  cv.setUint32(16, crc, true);
  cv.setUint32(20, dataLen, true);
  cv.setUint32(24, dataLen, true);
  cv.setUint16(28, fnLen, true);
  cv.setUint16(30, 0, true); // extra field length
  cv.setUint16(32, 0, true); // comment length
  cv.setUint16(34, 0, true); // disk start
  cv.setUint16(36, 0, true); // internal attrs
  cv.setUint32(38, 0, true); // external attrs
  cv.setUint32(42, 0, true); // offset of local header
  centralDir.set(fileNameBytes, 46);

  // End of central directory (22 bytes)
  const localSize = 30 + fnLen + dataLen;
  const centralSize = 46 + fnLen;
  const endDir = new Uint8Array(22);
  const ev = new DataView(endDir.buffer);
  ev.setUint32(0, 0x06054b50, true); // signature
  ev.setUint16(4, 0, true);  // disk number
  ev.setUint16(6, 0, true);  // disk with central dir
  ev.setUint16(8, 1, true);  // entries on disk
  ev.setUint16(10, 1, true); // total entries
  ev.setUint32(12, centralSize, true); // central dir size
  ev.setUint32(16, localSize, true);   // central dir offset
  ev.setUint16(20, 0, true); // comment length

  const zipData = new Uint8Array(localSize + centralSize + 22);
  zipData.set(localHeader, 0);
  zipData.set(centralDir, localSize);
  zipData.set(endDir, localSize + centralSize);

  const blob = new Blob([zipData], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.zip`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── File management ────────────────────────────────────────
function getFileAtPath(files: FileNode[], path: string[]): FileNode[] {
  let nodes = files;
  for (const part of path) {
    const found = nodes.find(f => f.name === part && f.type === 'folder');
    if (found?.children) nodes = found.children;
    else break;
  }
  return nodes;
}

function updateFilesAtPath(files: FileNode[], path: string[], updater: (nodes: FileNode[]) => FileNode[]): FileNode[] {
  if (path.length === 0) return updater(files);
  const [first, ...rest] = path;
  return files.map(f => {
    if (f.name === first && f.type === 'folder' && f.children) {
      return { ...f, children: updateFilesAtPath(f.children, rest, updater) };
    }
    return f;
  });
}

export function editFile(serverId: string, filePath: string[], fileName: string, newContent: string): void {
  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      const newFiles = updateFilesAtPath(s.files, filePath, nodes =>
        nodes.map(f => f.name === fileName && f.type === 'file'
          ? { ...f, content: newContent, modified: new Date().toISOString(), size: new Blob([newContent]).size }
          : f
        )
      );
      return { ...s, files: newFiles };
    }),
  };
  notify();
}

export function renameFile(serverId: string, filePath: string[], oldName: string, newName: string): void {
  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      const newFiles = updateFilesAtPath(s.files, filePath, nodes =>
        nodes.map(f => f.name === oldName ? { ...f, name: newName, modified: new Date().toISOString() } : f)
      );
      return { ...s, files: newFiles };
    }),
  };
  notify();
}

export function deleteFile(serverId: string, filePath: string[], fileName: string): void {
  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      const newFiles = updateFilesAtPath(s.files, filePath, nodes =>
        nodes.filter(f => f.name !== fileName)
      );
      return { ...s, files: newFiles };
    }),
  };
  notify();
}

export function reinstallOS(serverId: string, os: string): void {
  // Set status to installing immediately in local state
  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      return {
        ...s,
        status: 'installing' as ServerStatus,
        os,
        consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] Reinstalacja systemu: ${os}...`],
      };
    }),
  };
  notify();

  // Call real backend API
  import('../services/backendApi').then(({ backendApi }) => {
    backendApi.reinstallServer(serverId, os).then((res) => {
      if (!res.success) {
        state = {
          ...state,
          servers: state.servers.map(s =>
            s.id === serverId ? {
              ...s,
              status: 'error' as ServerStatus,
              consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] Błąd reinstalacji: ${res.error}`],
            } : s
          ),
        };
        notify();
      }
      // Status updates come via Socket.IO (server:status events)
    }).catch((err: any) => {
      state = {
        ...state,
        servers: state.servers.map(s =>
          s.id === serverId ? {
            ...s,
            status: 'error' as ServerStatus,
            consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] Błąd reinstalacji: ${err.message}`],
          } : s
        ),
      };
      notify();
    });
  });
}

// ── Admin: Promo code management ───────────────────────────
export function createPromoCode(code: string, amount: number, maxUses: number): void {
  const promo: PromoCode = {
    id: uid(),
    code: code.toUpperCase(),
    amount,
    maxUses,
    currentUses: 0,
    usedBy: [],
    active: true,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, promoCodes: [...state.promoCodes, promo] };
  notify();
}

export function togglePromoCode(promoId: string): void {
  state = {
    ...state,
    promoCodes: state.promoCodes.map(p => p.id === promoId ? { ...p, active: !p.active } : p),
  };
  notify();
}

export function deletePromoCode(promoId: string): void {
  state = { ...state, promoCodes: state.promoCodes.filter(p => p.id !== promoId) };
  notify();
}

// ── Admin: User management ─────────────────────────────────
export function adminSetBalance(userId: string, amount: number): void {
  const user = state.users.find(u => u.id === userId);
  if (!user) return;
  const diff = amount - user.balance;
  addBalance(userId, diff, diff >= 0 ? 'admin_add' : 'admin_remove', `Admin zmienił saldo: ${diff >= 0 ? '+' : ''}${diff.toFixed(2)} zł`);
}

export function adminSetRole(userId: string, role: 'user' | 'admin'): void {
  state = { ...state, users: state.users.map(u => u.id === userId ? { ...u, role } : u) };
  notify();
}

export function adminUpdateUser(userId: string, updates: { email?: string; username?: string; password?: string }): void {
  state = {
    ...state,
    users: state.users.map(u => {
      if (u.id !== userId) return u;
      const patched = { ...u };
      if (updates.email) patched.email = updates.email;
      if (updates.username) patched.username = updates.username;
      if (updates.password) patched.password = updates.password;
      return patched;
    }),
  };
  notify();
}

export function adminDeleteUser(userId: string): void {
  state = {
    ...state,
    users: state.users.filter(u => u.id !== userId),
    servers: state.servers.filter(s => s.userId !== userId),
    transactions: state.transactions.filter(t => t.userId !== userId),
  };
  notify();
}

export function adminCreateUser(email: string, username: string, password: string, role: 'user' | 'admin', balance: number): string {
  const userId = uid();
  const user: User = {
    id: userId,
    email,
    password,
    username,
    role,
    balance,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, users: [...state.users, user] };
  notify();
  return userId;
}

// ── Startup config (FiveM) ─────────────────────────────────
export function updateStartupConfig(serverId: string, config: Partial<StartupConfig>): void {
  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      return { ...s, startupConfig: { ...s.startupConfig, ...config } };
    }),
  };
  notify();
}

// ── txAdmin management ─────────────────────────────────────
function getDefaultTxAdminData(): TxAdminData {
  return {
    players: [],
    bans: [],
    resources: [
      { name: 'mapmanager', status: 'started', description: 'Map manager', author: 'cfx' },
      { name: 'chat', status: 'started', description: 'Chat resource', author: 'cfx' },
      { name: 'spawnmanager', status: 'started', description: 'Spawn manager', author: 'cfx' },
      { name: 'sessionmanager', status: 'started', description: 'Session management', author: 'cfx' },
      { name: 'basic-gamemode', status: 'started', description: 'Basic gamemode', author: 'cfx' },
      { name: 'hardcap', status: 'started', description: 'Hardcap resource', author: 'cfx' },
      { name: 'monitor', status: 'started', description: 'txAdmin Monitor', author: 'tabarra', version: '7.0.0' },
    ],
    schedules: [],
    announcements: [],
    whitelist: false,
    whitelistIds: [],
  };
}

export function getTxAdminData(serverId: string): TxAdminData {
  const server = state.servers.find(s => s.id === serverId);
  if (!server?.startupConfig?.txAdminData) {
    // Initialize txAdmin data
    const data = getDefaultTxAdminData();
    updateStartupConfig(serverId, { txAdminData: data });
    return data;
  }
  return server.startupConfig.txAdminData;
}

function updateTxAdminData(serverId: string, updater: (data: TxAdminData) => TxAdminData): void {
  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.id !== serverId) return s;
      const currentData = s.startupConfig?.txAdminData || getDefaultTxAdminData();
      const newData = updater(currentData);
      return { ...s, startupConfig: { ...s.startupConfig, txAdminData: newData } };
    }),
  };
  notify();
}

export function txKickPlayer(serverId: string, playerId: number, reason: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    players: data.players.filter(p => p.id !== playerId),
  }));
  const server = state.servers.find(s => s.id === serverId);
  if (server) {
    state = {
      ...state,
      servers: state.servers.map(s =>
        s.id === serverId ? {
          ...s,
          consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] [txAdmin] Kicked player #${playerId}: ${reason}`],
          currentPlayers: Math.max(0, (s.currentPlayers || 0) - 1),
        } : s
      ),
    };
    notify();
  }
}

export function txBanPlayer(serverId: string, playerName: string, identifier: string, reason: string, duration?: string): void {
  const ban: TxAdminBan = {
    id: uid(),
    playerName,
    identifier,
    reason,
    bannedBy: 'admin',
    bannedAt: new Date().toISOString(),
    expiresAt: duration ? new Date(Date.now() + parseDuration(duration)).toISOString() : undefined,
  };
  updateTxAdminData(serverId, data => ({
    ...data,
    bans: [...data.bans, ban],
    players: data.players.filter(p => !p.identifiers.includes(identifier)),
  }));
  const server = state.servers.find(s => s.id === serverId);
  if (server) {
    state = {
      ...state,
      servers: state.servers.map(s =>
        s.id === serverId ? {
          ...s,
          consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] [txAdmin] Banned ${playerName}: ${reason}${duration ? ` (${duration})` : ' (permanent)'}`],
        } : s
      ),
    };
    notify();
  }
}

function parseDuration(dur: string): number {
  const match = dur.match(/^(\d+)(h|d|w|m)$/);
  if (!match) return 24 * 60 * 60 * 1000;
  const val = parseInt(match[1]);
  switch (match[2]) {
    case 'h': return val * 60 * 60 * 1000;
    case 'd': return val * 24 * 60 * 60 * 1000;
    case 'w': return val * 7 * 24 * 60 * 60 * 1000;
    case 'm': return val * 30 * 24 * 60 * 60 * 1000;
    default: return val * 60 * 60 * 1000;
  }
}

export function txUnbanPlayer(serverId: string, banId: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    bans: data.bans.filter(b => b.id !== banId),
  }));
}

export function txToggleResource(serverId: string, resourceName: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    resources: data.resources.map(r =>
      r.name === resourceName ? { ...r, status: r.status === 'started' ? 'stopped' : 'started' } : r
    ),
  }));
  const server = state.servers.find(s => s.id === serverId);
  const resource = server?.startupConfig?.txAdminData?.resources.find(r => r.name === resourceName);
  if (server) {
    const newStatus = resource?.status === 'started' ? 'stopped' : 'started';
    state = {
      ...state,
      servers: state.servers.map(s =>
        s.id === serverId ? {
          ...s,
          consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] [txAdmin] Resource '${resourceName}' ${newStatus}`],
        } : s
      ),
    };
    notify();
  }
}

export function txRestartResource(serverId: string, resourceName: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    resources: data.resources.map(r =>
      r.name === resourceName ? { ...r, status: 'stopped' } : r
    ),
  }));
  setTimeout(() => {
    updateTxAdminData(serverId, data => ({
      ...data,
      resources: data.resources.map(r =>
        r.name === resourceName ? { ...r, status: 'started' } : r
      ),
    }));
  }, 500);
  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId ? {
        ...s,
        consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] [txAdmin] Restarting resource '${resourceName}'...`],
      } : s
    ),
  };
  notify();
}

export function txAddSchedule(serverId: string, time: string, days: string[], action: 'restart' | 'stop' | 'backup'): void {
  const schedule: TxAdminSchedule = {
    id: uid(),
    time,
    days,
    action,
    enabled: true,
  };
  updateTxAdminData(serverId, data => ({
    ...data,
    schedules: [...data.schedules, schedule],
  }));
}

export function txRemoveSchedule(serverId: string, scheduleId: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    schedules: data.schedules.filter(s => s.id !== scheduleId),
  }));
}

export function txToggleSchedule(serverId: string, scheduleId: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    schedules: data.schedules.map(s =>
      s.id === scheduleId ? { ...s, enabled: !s.enabled } : s
    ),
  }));
}

export function txSendAnnouncement(serverId: string, message: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    announcements: [message, ...data.announcements].slice(0, 50),
  }));
  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId ? {
        ...s,
        consoleLogs: [...s.consoleLogs, `[${new Date().toLocaleTimeString()}] [txAdmin] Announcement: ${message}`],
      } : s
    ),
  };
  notify();
}

export function txToggleWhitelist(serverId: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    whitelist: !data.whitelist,
  }));
}

export function txAddWhitelistId(serverId: string, identifier: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    whitelistIds: [...data.whitelistIds, identifier],
  }));
}

export function txRemoveWhitelistId(serverId: string, identifier: string): void {
  updateTxAdminData(serverId, data => ({
    ...data,
    whitelistIds: data.whitelistIds.filter(id => id !== identifier),
  }));
}

// ── Tickets ────────────────────────────────────────────────
export function createTicket(
  userId: string,
  subject: string,
  message: string,
  priority: TicketPriority = 'medium',
  category: TicketCategory = 'general',
  description?: string,
): string {
  const ticketId = uid();
  const ticket: Ticket = {
    id: ticketId,
    userId,
    subject,
    description,
    status: 'open',
    priority,
    category,
    messages: [{
      id: uid(),
      userId,
      text: message,
      createdAt: new Date().toISOString(),
      isAdmin: false,
    }],
    createdAt: new Date().toISOString(),
  };
  state = { ...state, tickets: [...state.tickets, ticket] };
  notify();
  return ticketId;
}

export function replyTicket(ticketId: string, userId: string, text: string, isAdmin: boolean): void {
  const msg: TicketMessage = {
    id: uid(),
    userId,
    text,
    createdAt: new Date().toISOString(),
    isAdmin,
  };
  state = {
    ...state,
    tickets: state.tickets.map(t =>
      t.id === ticketId ? {
        ...t,
        messages: [...t.messages, msg],
        status: isAdmin ? 'answered' : 'open',
      } : t
    ),
  };
  notify();
}

export function closeTicket(ticketId: string): void {
  state = {
    ...state,
    tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status: 'closed', closedAt: new Date().toISOString() } : t),
  };
  notify();
}

export function reopenTicket(ticketId: string): void {
  state = {
    ...state,
    tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status: 'open', closedAt: undefined } : t),
  };
  notify();
}

export function updateTicket(ticketId: string, updates: { adminLabel?: string; description?: string; priority?: TicketPriority; category?: TicketCategory }): void {
  state = {
    ...state,
    tickets: state.tickets.map(t => t.id === ticketId ? { ...t, ...updates } : t),
  };
  notify();
}

// ── Simulate live stats (call periodically) ────────────────
export function simulateStats(): void {
  state = {
    ...state,
    servers: state.servers.map(s => {
      if (s.status !== 'running') return s;

      // Update pings for existing txAdmin players
      let updatedConfig = s.startupConfig;
      if (s.type === 'fivem' && s.startupConfig?.txAdminData) {
        const txd = { ...s.startupConfig.txAdminData };
        const currentPlayers = txd.players.map(p => ({
          ...p,
          ping: Math.max(10, Math.min(120, p.ping + Math.floor((Math.random() - 0.5) * 15))),
        }));
        txd.players = currentPlayers;
        updatedConfig = { ...s.startupConfig, txAdminData: txd };
      }

      return {
        ...s,
        cpuUsage: Math.min(100, Math.max(1, s.cpuUsage + (Math.random() - 0.5) * 10)),
        ramUsage: Math.min(100, Math.max(5, s.ramUsage + (Math.random() - 0.5) * 5)),
        networkIn: Math.max(0, s.networkIn + (Math.random() - 0.3) * 20),
        networkOut: Math.max(0, s.networkOut + (Math.random() - 0.3) * 10),
      };
    }),
  };
  notify();
}

// ── Profile updates ────────────────────────────────────────
export function updateProfile(userId: string, updates: Partial<User>): void {
  state = {
    ...state,
    users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u),
  };
  notify();
}

export function updateUserSettings(userId: string, updates: Partial<import('./types').UserSettings>): void {
  state = {
    ...state,
    users: state.users.map(u => {
      if (u.id !== userId) return u;
      return { ...u, settings: { ...(u.settings || defaultUserSettings()), ...updates } };
    }),
  };
  notify();
}

export function updateUserBilling(userId: string, updates: Partial<import('./types').UserBilling>): void {
  state = {
    ...state,
    users: state.users.map(u => {
      if (u.id !== userId) return u;
      return { ...u, billing: { ...(u.billing || { companyName: '', nip: '', address: '', city: '' }), ...updates } };
    }),
  };
  notify();
}

export function removeSession(userId: string, sessionId: string): void {
  state = {
    ...state,
    users: state.users.map(u => {
      if (u.id !== userId) return u;
      return { ...u, sessions: (u.sessions || []).filter(s => s.id !== sessionId) };
    }),
  };
  notify();
}

export function removeAllOtherSessions(userId: string): void {
  state = {
    ...state,
    users: state.users.map(u => {
      if (u.id !== userId) return u;
      return { ...u, sessions: (u.sessions || []).filter(s => s.current) };
    }),
  };
  notify();
}

export function deleteAccount(userId: string): void {
  // Remove all user's servers
  state = {
    ...state,
    servers: state.servers.filter(s => s.userId !== userId),
    users: state.users.filter(u => u.id !== userId),
    tickets: state.tickets.filter(t => t.userId !== userId),
    currentUserId: state.currentUserId === userId ? null : state.currentUserId,
  };
  if (state.currentUserId === null) {
    localStorage.removeItem('svnhost_current_user');
  }
  notify();
}

export function defaultUserSettings(): import('./types').UserSettings {
  return {
    emailNotifs: true,
    serverAlerts: true,
    billingNotifs: true,
    newsNotifs: false,
    ticketNotifs: true,
    maintenanceNotifs: true,
    compactMode: false,
    animationsEnabled: true,
    showServerIp: true,
    theme: 'dark',
    accentColor: '#ef4444',
  };
}

export function exportUserData(userId: string): string {
  const user = state.users.find(u => u.id === userId);
  if (!user) return '{}';
  const servers = state.servers.filter(s => s.userId === userId);
  const transactions = state.transactions.filter(t => t.userId === userId);
  const tickets = state.tickets.filter(t => t.userId === userId);
  return JSON.stringify({ user: { ...user, password: '***' }, servers, transactions, tickets }, null, 2);
}

// ── Database management ────────────────────────────────────
export function createDatabase(serverId: string, dbName: string): { success: boolean; error?: string } {
  const server = state.servers.find(s => s.id === serverId);
  if (!server) return { success: false, error: 'Server not found' };
  if (server.databases.some(d => d.name === dbName)) return { success: false, error: 'Baza danych o tej nazwie już istnieje' };
  if (server.databases.length >= 5) return { success: false, error: 'Maksymalna liczba baz danych (5) została osiągnięta' };

  const randomSuffix = Math.random().toString(36).slice(2, 9);
  const db: Database = {
    id: uid(),
    name: dbName,
    username: `user_${randomSuffix}`,
    password: Math.random().toString(36).slice(2, 14) + Math.random().toString(36).slice(2, 6).toUpperCase(),
    host: server.ip === '127.0.0.1' ? '127.0.0.1' : server.ip,
    port: 3306,
    sizeUsedMb: 0,
    maxSizeMb: Math.round(server.diskGb * 100), // 10% of disk in MB
    createdAt: new Date().toISOString(),
  };

  // Create real MySQL database + user on the backend
  import('../services/backendApi').then(({ backendApi }) => {
    backendApi.createDatabase(db.name, db.username, db.password).catch(() => {});
  });

  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId ? { ...s, databases: [...s.databases, db] } : s
    ),
  };
  notify();
  return { success: true };
}

export async function deleteDatabase(serverId: string, dbId: string): Promise<{ success: boolean; error?: string }> {
  const server = state.servers.find(s => s.id === serverId);
  const db = server?.databases.find(d => d.id === dbId);

  // Delete real MySQL database + user on the backend first
  if (db) {
    try {
      const { backendApi } = await import('../services/backendApi');
      const res = await backendApi.deleteDatabase(db.name, db.username);
      if (!res.success) {
        return { success: false, error: res.error || 'Nie udało się usunąć bazy na serwerze MySQL' };
      }
    } catch (err: any) {
      // If backend is offline, still remove from local state
      console.warn('[deleteDatabase] Backend call failed, removing locally:', err.message);
    }
  }

  state = {
    ...state,
    servers: state.servers.map(s =>
      s.id === serverId ? { ...s, databases: s.databases.filter(d => d.id !== dbId) } : s
    ),
  };
  notify();
  return { success: true };
}

// ── Node management ────────────────────────────────────────
export function addNode(node: Omit<HostingNode, 'id' | 'createdAt'>): string {
  const id = uid();
  const newNode: HostingNode = {
    ...node,
    id,
    createdAt: new Date().toISOString(),
  };
  state = { ...state, nodes: [...state.nodes, newNode] };
  notify();
  return id;
}

export function updateNode(nodeId: string, updates: Partial<HostingNode>): void {
  state = {
    ...state,
    nodes: state.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n),
  };
  notify();
}

export function removeNode(nodeId: string): void {
  state = { ...state, nodes: state.nodes.filter(n => n.id !== nodeId) };
  notify();
}

// ── Admin Settings ─────────────────────────────────────────
export function updateAdminSettings(updates: Partial<AdminSettings>): void {
  state = {
    ...state,
    adminSettings: { ...state.adminSettings, ...updates },
  };
  notify();
}

// ── Custom Config (pricing & limits) ───────────────────────
export function updateCustomConfig(type: ServerType, updates: Partial<CustomConfigLimits>): void {
  state = {
    ...state,
    customConfig: {
      ...state.customConfig,
      [type]: { ...state.customConfig[type], ...updates },
    },
  };
  notify();
}

// ── Plan / Offer management ────────────────────────────────
export function addServicePlan(plan: Omit<ServicePlan, 'id'>): string {
  const id = uid();
  state = {
    ...state,
    servicePlans: [...state.servicePlans, { ...plan, id }],
  };
  notify();
  return id;
}

export function updateServicePlan(planId: string, updates: Partial<ServicePlan>): void {
  state = {
    ...state,
    servicePlans: state.servicePlans.map(p => p.id === planId ? { ...p, ...updates } : p),
  };
  notify();
}

export function deleteServicePlan(planId: string): void {
  state = { ...state, servicePlans: state.servicePlans.filter(p => p.id !== planId) };
  notify();
}

// ── React hook helper ──────────────────────────────────────
export function useStore(): StoreState {
  // This is called from a custom hook in the component
  return state;
}
