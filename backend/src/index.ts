import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import dotenv from 'dotenv';
import { initDatabase } from './database';
import routes from './routes';
import { shutdownAll } from './serverManager';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ── Express + Socket.IO ────────────────────────────────
const app = express();
const server = http.createServer(app);

let _io: SocketIO | null = null;

const socketIO = new SocketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});
_io = socketIO;

export function io(): SocketIO | null {
  return _io;
}

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── API Routes ─────────────────────────────────────────
app.use('/api', routes);

// ── Socket.IO Events ───────────────────────────────────
socketIO.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);

  // Join a server room to receive console logs
  socket.on('server:join', (serverId: string) => {
    socket.join(`server:${serverId}`);
    console.log(`[WS] ${socket.id} joined server:${serverId}`);
  });

  socket.on('server:leave', (serverId: string) => {
    socket.leave(`server:${serverId}`);
  });

  // Send command via WebSocket
  socket.on('server:command', (data: { serverId: string; command: string }) => {
    const { sendCommand } = require('./serverManager');
    sendCommand(data.serverId, data.command);
  });

  socket.on('disconnect', () => {
    console.log(`[WS] Client disconnected: ${socket.id}`);
  });
});

// ── Init & Start ───────────────────────────────────────
console.log('');
console.log('  ╔══════════════════════════════════════════════════╗');
console.log('  ║           SVNHost Backend v2.1.0                 ║');
console.log('  ║  FiveM + Minecraft + VPS + Bot Discord Manager   ║');
console.log('  ╚══════════════════════════════════════════════════╝');
console.log('');

initDatabase();
console.log(`  [DB] Database initialized`);

server.listen(PORT, HOST, () => {
  console.log(`  [API] REST API: http://${HOST}:${PORT}/api`);
  console.log(`  [WS]  WebSocket: ws://${HOST}:${PORT}`);
  console.log(`  [OK]  Backend ready!`);
  console.log('');

  // Check FXServer
  const { isFxServerInstalled, isJavaInstalled, getJavaVersion } = require('./serverManager');
  if (!isFxServerInstalled()) {
    console.log('  ⚠️  FXServer NOT FOUND');
    console.log(`  📁  Expected at: ${process.env.FXSERVER_PATH || './fxserver'}`);
    console.log('  📥  Download: https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/');
  } else {
    console.log('  ✅  FXServer found and ready');
  }

  // Check Java for Minecraft
  if (!isJavaInstalled()) {
    console.log('  ⚠️  Java NOT FOUND (needed for Minecraft)');
    console.log('  📥  Download: https://adoptium.net/temurin/releases/');
  } else {
    console.log(`  ✅  Java found: ${getJavaVersion()}`);
  }

  // Check WSL for VPS
  const { isWslInstalled, getWslVersion } = require('./vpsManager');
  if (!isWslInstalled()) {
    console.log('  ⚠️  WSL2 NOT FOUND (needed for VPS)');
    console.log('  📥  Run: wsl --install (PowerShell as admin)');
  } else {
    console.log(`  ✅  WSL2 found: v${getWslVersion() || 'installed'}`);
    console.log('  ✅  VPS ready (WSL2 + SSH)');
  }

  // Check Node.js for Bot Discord (Node.js runtime)
  const { isNodeInstalled, getNodeVersion: getNodeVer, isPythonInstalled, getPythonVersion: getPyVer } = require('./serverManager');
  if (!isNodeInstalled()) {
    console.log('  ⚠️  Node.js NOT FOUND (needed for Bot Discord - Node.js)');
    console.log('  📥  Download: https://nodejs.org/');
  } else {
    console.log(`  ✅  Node.js found: ${getNodeVer()}`);
  }

  // Check Python for Bot Discord (Python runtime)
  if (!isPythonInstalled()) {
    console.log('  ⚠️  Python NOT FOUND (needed for Bot Discord - Python)');
    console.log('  📥  Download: https://www.python.org/');
  } else {
    console.log(`  ✅  Python found: ${getPyVer()}`);
  }

  console.log('');
});

// ── Graceful shutdown ──────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n[SVNHost] Shutting down...');
  shutdownAll();
  setTimeout(() => process.exit(0), 6000);
});

process.on('SIGTERM', () => {
  console.log('\n[SVNHost] Shutting down...');
  shutdownAll();
  setTimeout(() => process.exit(0), 6000);
});
