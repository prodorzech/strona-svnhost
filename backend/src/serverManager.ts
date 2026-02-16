import { ChildProcess, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { GameServer, ConsoleLog, CreateServerRequest, ServerStatus } from './types';
import {
  createServerRecord, getServerById, updateServerStatus,
  deleteServerRecord, getNextAvailablePort, getNextAvailableTxPort,
  getNextAvailableMcPort, updateServerField, getAllServers as getAllServersFromDb,
} from './database';
import { io } from './index';
import {
  detectJava, isJavaInstalled, getJavaVersion,
  generateServerProperties, writeEula,
  downloadMinecraftJar, spawnMinecraftProcess,
} from './minecraftManager';
import {
  createVpsInstance, reinstallVpsInstance, startVpsSshd, spawnVpsShell,
  stopVpsInstance, deleteVpsInstance, generatePassword,
  isWslInstalled, getNextSshPort, distroName, distroExists,
} from './vpsManager';
import {
  detectNodeJs, isNodeInstalled, getNodeVersion,
  detectPython, isPythonInstalled, getPythonVersion,
  generateNodeJsBotProject, generatePythonBotProject,
  installNodeDependencies, installPythonDependencies,
  spawnNodeJsBot, spawnPythonBot, getNextBotPort,
} from './botManager';

// ── Process tracking ────────────────────────────────
const processes = new Map<string, ChildProcess>();
const vpsShells = new Map<string, ChildProcess>();
const consoleLogs = new Map<string, ConsoleLog[]>();
const MAX_LOGS = 500;

function getServerDir(serverId: string): string {
  const base = process.env.SERVERS_PATH || './servers';
  return path.resolve(base, serverId);
}

function getFxServerPath(): string {
  const p = process.env.FXSERVER_PATH || './fxserver';
  return path.resolve(p);
}

function addLog(serverId: string, message: string, type: ConsoleLog['type'] = 'stdout'): void {
  if (!consoleLogs.has(serverId)) consoleLogs.set(serverId, []);
  const logs = consoleLogs.get(serverId)!;
  const entry: ConsoleLog = {
    timestamp: new Date().toISOString(),
    message,
    type,
  };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);

  // Broadcast to connected clients
  io()?.to(`server:${serverId}`).emit('console:line', entry);
}

// ── Default server.cfg ────────────────────────────────
function generateServerCfg(server: GameServer, licenseKey: string): string {
  return `# SVNHost - Auto-generated server.cfg
# Server: ${server.name}

# FiveM License Key (get one at https://keymaster.fivem.net)
sv_licenseKey "${licenseKey}"

# Server name
sv_hostname "${server.name}"

# Max players
sv_maxclients ${server.maxPlayers}

# Game build
sv_enforceGameBuild ${server.gameBuild || '3095'}

# OneSync
set onesync ${server.oneSync || 'on'}

# Server endpoint
endpoint_add_tcp "0.0.0.0:${server.port}"
endpoint_add_udp "0.0.0.0:${server.port}"

# RCON password
rcon_password "svnhost_${server.id.substring(0, 8)}"

# Locale
sets locale "pl-PL"
sets tags "default"

# Default resources
ensure mapmanager
ensure chat
ensure spawnmanager
ensure sessionmanager
ensure basic-gamemode
ensure hardcap
ensure monitor
`;
}

// ── Create Server ──────────────────────────────────────
export async function createServer(req: CreateServerRequest): Promise<GameServer> {
  const id = req.id || uuid();
  const serverType = req.type || 'fivem';
  const serverDir = getServerDir(id);

  // Create server directory structure
  fs.mkdirSync(serverDir, { recursive: true });

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  // Type-specific defaults
  let port: number;
  let txAdminPort: number | undefined;
  const server: GameServer = {
    id,
    userId: 'admin',
    name: req.name,
    type: serverType,
    status: 'stopped',
    port: 0, // will be set below
    maxPlayers: req.maxPlayers || 64,
    ip: '0.0.0.0',
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  switch (serverType) {
    case 'fivem': {
      port = req.port || getNextAvailablePort();
      txAdminPort = req.txAdminPort || getNextAvailableTxPort();
      server.port = port;
      server.txAdminPort = txAdminPort;
      server.gameBuild = req.gameBuild || '3095';
      server.oneSync = req.oneSync || 'on';
      server.licensKey = req.licenseKey || '';

      // Create FiveM-specific dirs
      fs.mkdirSync(path.join(serverDir, 'resources'), { recursive: true });
      fs.mkdirSync(path.join(serverDir, 'txData'), { recursive: true });

      // Generate server.cfg
      const cfgContent = generateServerCfg(server, req.licenseKey || '');
      fs.writeFileSync(path.join(serverDir, 'server.cfg'), cfgContent, 'utf-8');

      addLog(id, `[SVNHost] Server FiveM "${req.name}" created.`, 'system');
      addLog(id, `[SVNHost] Port: ${port} | txAdmin Port: ${txAdminPort}`, 'system');
      break;
    }
    case 'minecraft': {
      port = req.port || getNextAvailableMcPort();
      server.port = port;
      server.mcVersion = req.mcVersion || '1.21.4';
      server.mcFlavor = req.mcFlavor || 'paper';
      server.mcJarFile = 'server.jar';
      server.ramMb = req.ramMb || 2048;
      server.javaPath = req.javaPath || detectJava() || 'java';

      // Generate server.properties
      fs.writeFileSync(
        path.join(serverDir, 'server.properties'),
        generateServerProperties(server),
        'utf-8',
      );

      // Accept EULA
      writeEula(serverDir);

      addLog(id, `[SVNHost] Serwer Minecraft "${req.name}" utworzony.`, 'system');
      addLog(id, `[SVNHost] Port: ${port} | Wersja: ${server.mcVersion} | Typ: ${server.mcFlavor}`, 'system');
      addLog(id, `[SVNHost] RAM: ${server.ramMb}MB | Java: ${server.javaPath}`, 'system');
      break;
    }
    case 'vps':
    case 'vds': {
      port = req.port || 0; // VPS doesn't need a game port
      server.port = port;
      server.os = req.os || 'ubuntu-24.04';
      server.cpuCores = req.cpuCores || 2;
      server.diskGb = req.diskGb || 30;
      server.ramMb = req.ramMb || 4096;

      // Generate SSH credentials
      server.sshUser = 'admin';
      server.sshPassword = generatePassword(16);

      // Get next available SSH port
      const usedSshPorts = getAllServersFromDb()
        .filter(s => s.sshPort)
        .map(s => s.sshPort!);
      server.sshPort = getNextSshPort(usedSshPorts, 2222);

      addLog(id, `[SVNHost] Tworzenie VPS "${req.name}" (WSL2 + SSH)...`, 'system');
      addLog(id, `[SVNHost] OS: ${server.os} | CPU: ${server.cpuCores} vCore | RAM: ${server.ramMb}MB`, 'system');
      addLog(id, `[SVNHost] SSH Port: ${server.sshPort} | User: ${server.sshUser}`, 'system');

      // Create WSL instance asynchronously but don't block server creation
      createVpsInstance(
        id,
        serverDir,
        server.sshPort,
        server.sshUser,
        server.sshPassword,
        server.ramMb,
        server.cpuCores,
        (msg) => addLog(id, msg, 'system'),
      ).then(() => {
        addLog(id, `[SVNHost] VPS gotowy! Możesz go uruchomić.`, 'system');
        updateServerStatus(id, 'stopped');
        io()?.to(`server:${id}`).emit('server:status', { id, status: 'stopped' });
      }).catch((err) => {
        addLog(id, `[SVNHost] ERROR tworzenia VPS: ${err.message}`, 'stderr');
        updateServerStatus(id, 'error');
        io()?.to(`server:${id}`).emit('server:status', { id, status: 'error' });
      });

      // Mark as installing while WSL instance is being created
      server.status = 'installing';
      break;
    }
    case 'bot': {
      const usedBotPorts = getAllServersFromDb()
        .filter(s => s.type === 'bot')
        .map(s => s.port);
      port = req.port || getNextBotPort(usedBotPorts, 8080);
      server.port = port;
      server.botRuntime = req.botRuntime || 'nodejs';
      server.ramMb = req.ramMb || 512;
      server.cpuCores = req.cpuCores || 1;
      server.diskGb = req.diskGb || 5;

      // Generate bot project files
      if (server.botRuntime === 'python') {
        generatePythonBotProject(serverDir, req.name);
        addLog(id, `[SVNHost] Bot Discord "${req.name}" utworzony (Python).`, 'system');
      } else {
        generateNodeJsBotProject(serverDir, req.name);
        addLog(id, `[SVNHost] Bot Discord "${req.name}" utworzony (Node.js).`, 'system');
      }

      addLog(id, `[SVNHost] Runtime: ${server.botRuntime}`, 'system');
      addLog(id, `[SVNHost] Port: ${port}`, 'system');

      // Install dependencies asynchronously
      server.status = 'installing';
      const runtime = server.botRuntime;
      const logFn = (msg: string) => addLog(id, msg, 'system');

      const installPromise = runtime === 'python'
        ? installPythonDependencies(serverDir, logFn)
        : installNodeDependencies(serverDir, logFn);

      installPromise.then(() => {
        addLog(id, `[SVNHost] Bot gotowy! Ustaw BOT_TOKEN w pliku .env i uruchom.`, 'system');
        updateServerStatus(id, 'stopped');
        io()?.to(`server:${id}`).emit('server:status', { id, status: 'stopped' });
      }).catch((err) => {
        addLog(id, `[SVNHost] BŁĄD instalacji zależności: ${err.message}`, 'stderr');
        addLog(id, `[SVNHost] Możesz spróbować ponownie uruchamiając serwer.`, 'system');
        updateServerStatus(id, 'stopped');
        io()?.to(`server:${id}`).emit('server:status', { id, status: 'stopped' });
      });

      break;
    }
  }

  addLog(id, `[SVNHost] Katalog: ${serverDir}`, 'system');

  // Save to DB
  createServerRecord(server);

  return server;
}

// ── Start Server ───────────────────────────────────────
export async function startServer(serverId: string): Promise<void> {
  const server = getServerById(serverId);
  if (!server) throw new Error('Server not found');
  if (server.status === 'running' || server.status === 'starting') throw new Error('Server already running');

  switch (server.type) {
    case 'fivem':
      return startFiveMServer(serverId, server);
    case 'minecraft':
      return startMinecraftServer(serverId, server);
    case 'vps':
    case 'vds':
      return startVpsServer(serverId, server);
    case 'bot':
      return startBotServer(serverId, server);
    default:
      throw new Error(`Unknown server type: ${server.type}`);
  }
}

// ── Start FiveM Server ─────────────────────────────────
async function startFiveMServer(serverId: string, server: GameServer): Promise<void> {
  const fxPath = getFxServerPath();
  const serverDir = getServerDir(serverId);

  // Check FXServer exists
  const fxExe = process.platform === 'win32'
    ? path.join(fxPath, 'FXServer.exe')
    : path.join(fxPath, 'run.sh');

  if (!fs.existsSync(fxExe)) {
    addLog(serverId, `[SVNHost] ERROR: FXServer not found at ${fxExe}`, 'stderr');
    addLog(serverId, `[SVNHost] Download FXServer artifacts and place them in: ${fxPath}`, 'stderr');
    addLog(serverId, `[SVNHost] Windows: https://runtime.fivem.net/artifacts/fivem/build_server_windows/master/`, 'stderr');
    addLog(serverId, `[SVNHost] Linux: https://runtime.fivem.net/artifacts/fivem/build_proot_linux/master/`, 'stderr');
    updateServerStatus(serverId, 'error');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
    throw new Error(`FXServer not found at ${fxExe}`);
  }

  // Check server.cfg exists
  const cfgPath = path.join(serverDir, 'server.cfg');
  if (!fs.existsSync(cfgPath)) {
    addLog(serverId, `[SVNHost] ERROR: server.cfg not found. Regenerating...`, 'stderr');
    const cfg = generateServerCfg(server, server.licensKey || '');
    fs.writeFileSync(cfgPath, cfg, 'utf-8');
  }

  updateServerStatus(serverId, 'starting');
  addLog(serverId, `[SVNHost] Starting server "${server.name}"...`, 'system');
  io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'starting' });

  // Spawn FXServer process
  const args: string[] = [];

  if (process.platform === 'win32') {
    args.push(
      '+set', 'citizen_dir', path.join(fxPath, 'citizen'),
      '+set', 'sv_licenseKey', server.licensKey || '',
      '+set', 'txAdminPort', String(server.txAdminPort || 40120),
      '+set', 'txDataPath', path.join(serverDir, 'txData'),
      '+exec', 'server.cfg',
    );
  } else {
    args.push(
      '+set', 'citizen_dir', path.join(fxPath, 'alpine', 'opt', 'cfx-server', 'citizen'),
      '+set', 'sv_licenseKey', server.licensKey || '',
      '+set', 'txAdminPort', String(server.txAdminPort || 40120),
      '+set', 'txDataPath', path.join(serverDir, 'txData'),
      '+exec', 'server.cfg',
    );
  }

  const child = spawn(fxExe, args, {
    cwd: serverDir,
    env: { ...process.env },
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  attachProcess(serverId, server.name, child);
}

// ── Start Minecraft Server ─────────────────────────────
async function startMinecraftServer(serverId: string, server: GameServer): Promise<void> {
  const serverDir = getServerDir(serverId);

  // Check Java
  const javaPath = server.javaPath || detectJava();
  if (!javaPath) {
    addLog(serverId, `[SVNHost] ERROR: Java nie znaleziona!`, 'stderr');
    addLog(serverId, `[SVNHost] Zainstaluj Java 17+ (Adoptium, Oracle, Zulu)`, 'stderr');
    addLog(serverId, `[SVNHost] https://adoptium.net/temurin/releases/`, 'stderr');
    updateServerStatus(serverId, 'error');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
    throw new Error('Java not found');
  }

  const javaVer = getJavaVersion();
  addLog(serverId, `[SVNHost] Java: ${javaPath} (${javaVer || 'unknown'})`, 'system');

  // Download server jar if not present
  const jarPath = path.join(serverDir, server.mcJarFile || 'server.jar');
  if (!fs.existsSync(jarPath)) {
    updateServerStatus(serverId, 'installing');
    addLog(serverId, `[SVNHost] Pobieranie ${server.mcFlavor || 'paper'} ${server.mcVersion || 'latest'}...`, 'system');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'installing' });

    try {
      const jarName = await downloadMinecraftJar(serverDir, server.mcFlavor || 'paper', server.mcVersion || 'latest');
      updateServerField(serverId, 'mcJarFile', jarName);
      addLog(serverId, `[SVNHost] Pobrano: ${jarName}`, 'system');
    } catch (err: any) {
      addLog(serverId, `[SVNHost] ERROR: ${err.message}`, 'stderr');
      updateServerStatus(serverId, 'error');
      io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
      throw err;
    }
  }

  // Ensure server.properties exists
  if (!fs.existsSync(path.join(serverDir, 'server.properties'))) {
    fs.writeFileSync(path.join(serverDir, 'server.properties'), generateServerProperties(server), 'utf-8');
  }

  // Ensure eula.txt
  writeEula(serverDir);

  updateServerStatus(serverId, 'starting');
  addLog(serverId, `[SVNHost] Uruchamianie Minecraft "${server.name}"...`, 'system');
  addLog(serverId, `[SVNHost] RAM: ${server.ramMb || 2048}MB | Port: ${server.port}`, 'system');
  io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'starting' });

  const child = spawnMinecraftProcess(server, serverDir);
  attachProcess(serverId, server.name, child);
}

// ── Start VPS Server ───────────────────────────────────
async function startVpsServer(serverId: string, server: GameServer): Promise<void> {
  // Check WSL
  if (!isWslInstalled()) {
    addLog(serverId, `[SVNHost] ERROR: WSL2 nie jest zainstalowany!`, 'stderr');
    addLog(serverId, `[SVNHost] Uruchom w PowerShell (admin): wsl --install`, 'stderr');
    updateServerStatus(serverId, 'error');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
    throw new Error('WSL2 not installed');
  }

  updateServerStatus(serverId, 'starting');
  addLog(serverId, `[SVNHost] Uruchamianie VPS "${server.name}"...`, 'system');
  io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'starting' });

  const sshPort = server.sshPort || 2222;

  // Auto-recreate WSL instance if it doesn't exist (e.g. after import or cleanup)
  const name = distroName(serverId);
  if (!distroExists(name)) {
    addLog(serverId, `[SVNHost] Instancja WSL "${name}" nie istnieje — tworzenie automatyczne...`, 'system');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'installing' });
    try {
      const serverDir = getServerDir(serverId);
      await createVpsInstance(
        serverId,
        serverDir,
        sshPort,
        server.sshUser || 'admin',
        server.sshPassword || generatePassword(16),
        server.ramMb || 2048,
        server.cpuCores || 2,
        (msg) => addLog(serverId, msg, 'system'),
      );
      addLog(serverId, `[SVNHost] Instancja WSL odtworzona pomyślnie.`, 'system');
    } catch (err: any) {
      addLog(serverId, `[SVNHost] ERROR: Nie udało się odtworzyć instancji WSL: ${err.message}`, 'stderr');
      updateServerStatus(serverId, 'error', null);
      io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
      throw err;
    }
  }

  // Start SSH daemon (main process we track)
  const sshdProcess = startVpsSshd(
    serverId,
    sshPort,
    (msg) => addLog(serverId, msg, 'system'),
  );

  // Also spawn interactive shell for web console
  const shellProcess = spawnVpsShell(serverId, server.sshUser || 'admin');

  // Track the sshd process as the main process
  processes.set(serverId, sshdProcess);

  // Pipe shell output to console logs (for web console)
  shellProcess.stdout?.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    for (const line of lines) addLog(serverId, line, 'stdout');
  });
  shellProcess.stderr?.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    for (const line of lines) addLog(serverId, line, 'stderr');
  });

  // Store shell process for sending commands
  vpsShells.set(serverId, shellProcess);

  sshdProcess.on('spawn', () => {
    updateServerStatus(serverId, 'running', sshdProcess.pid || null);
    addLog(serverId, `[SVNHost] SSH daemon started (PID: ${sshdProcess.pid})`, 'system');
    addLog(serverId, `[SVNHost] ═══════════════════════════════════════`, 'system');
    addLog(serverId, `[SVNHost]   SSH: ssh ${server.sshUser}@${server.ip} -p ${sshPort}`, 'system');
    addLog(serverId, `[SVNHost]   User: ${server.sshUser}`, 'system');
    addLog(serverId, `[SVNHost]   Password: ${server.sshPassword}`, 'system');
    addLog(serverId, `[SVNHost] ═══════════════════════════════════════`, 'system');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'running', pid: sshdProcess.pid });
  });

  sshdProcess.stdout?.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    for (const line of lines) addLog(serverId, `[sshd] ${line}`, 'stdout');
  });

  sshdProcess.stderr?.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    for (const line of lines) addLog(serverId, `[sshd] ${line}`, 'stderr');
  });

  sshdProcess.on('error', (err) => {
    addLog(serverId, `[SVNHost] SSH daemon error: ${err.message}`, 'stderr');
    updateServerStatus(serverId, 'error', null);
    processes.delete(serverId);
    vpsShells.delete(serverId);
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
  });

  sshdProcess.on('exit', (code, signal) => {
    addLog(serverId, `[SVNHost] SSH daemon exited (code: ${code}, signal: ${signal})`, 'system');
    updateServerStatus(serverId, 'stopped', null);
    processes.delete(serverId);
    // Also kill shell
    const shell = vpsShells.get(serverId);
    if (shell && !shell.killed) shell.kill();
    vpsShells.delete(serverId);
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'stopped' });
  });
}

// ── Start Bot Server ───────────────────────────────────
async function startBotServer(serverId: string, server: GameServer): Promise<void> {
  const serverDir = getServerDir(serverId);
  const runtime = server.botRuntime || 'nodejs';

  // Check runtime installed
  if (runtime === 'nodejs') {
    if (!isNodeInstalled()) {
      addLog(serverId, `[SVNHost] BŁĄD: Node.js nie znaleziono!`, 'stderr');
      addLog(serverId, `[SVNHost] Zainstaluj Node.js 18+: https://nodejs.org/`, 'stderr');
      updateServerStatus(serverId, 'error');
      io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
      throw new Error('Node.js not found');
    }
    addLog(serverId, `[SVNHost] Node.js: ${getNodeVersion()}`, 'system');

    // Check if node_modules exist, install if not
    if (!fs.existsSync(path.join(serverDir, 'node_modules'))) {
      updateServerStatus(serverId, 'installing');
      addLog(serverId, `[SVNHost] Brak node_modules — instalowanie...`, 'system');
      io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'installing' });
      try {
        await installNodeDependencies(serverDir, (msg) => addLog(serverId, msg, 'system'));
      } catch (err: any) {
        addLog(serverId, `[SVNHost] BŁĄD: ${err.message}`, 'stderr');
        updateServerStatus(serverId, 'error');
        io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
        throw err;
      }
    }
  } else {
    if (!isPythonInstalled()) {
      addLog(serverId, `[SVNHost] BŁĄD: Python 3 nie znaleziono!`, 'stderr');
      addLog(serverId, `[SVNHost] Zainstaluj Python 3.10+: https://www.python.org/`, 'stderr');
      updateServerStatus(serverId, 'error');
      io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
      throw new Error('Python not found');
    }
    addLog(serverId, `[SVNHost] Python: ${getPythonVersion()}`, 'system');

    // Check if pip_modules exist, install if not
    if (!fs.existsSync(path.join(serverDir, 'pip_modules'))) {
      updateServerStatus(serverId, 'installing');
      addLog(serverId, `[SVNHost] Brak pip_modules — instalowanie...`, 'system');
      io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'installing' });
      try {
        await installPythonDependencies(serverDir, (msg) => addLog(serverId, msg, 'system'));
      } catch (err: any) {
        addLog(serverId, `[SVNHost] BŁĄD: ${err.message}`, 'stderr');
        updateServerStatus(serverId, 'error');
        io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
        throw err;
      }
    }
  }

  // Check .env file for BOT_TOKEN
  const envPath = path.join(serverDir, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('YOUR_BOT_TOKEN_HERE') || !envContent.match(/BOT_TOKEN=\S+/)) {
      addLog(serverId, `[SVNHost] ⚠️  BOT_TOKEN nie ustawiony!`, 'stderr');
      addLog(serverId, `[SVNHost] Edytuj plik .env i wpisz swój token Discord.`, 'stderr');
      addLog(serverId, `[SVNHost] Token: https://discord.com/developers/applications`, 'stderr');
    }
  }

  updateServerStatus(serverId, 'starting');
  addLog(serverId, `[SVNHost] ═══════════════════════════════════════`, 'system');
  addLog(serverId, `[SVNHost]   🤖 Discord Bot Hosting`, 'system');
  addLog(serverId, `[SVNHost]   Bot: ${server.name}`, 'system');
  addLog(serverId, `[SVNHost]   Runtime: ${runtime === 'nodejs' ? 'Node.js (discord.js)' : 'Python (discord.py)'}`, 'system');
  addLog(serverId, `[SVNHost] ═══════════════════════════════════════`, 'system');
  addLog(serverId, `[SVNHost] Uruchamianie bota "${server.name}"...`, 'system');
  io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'starting' });

  const child = runtime === 'nodejs'
    ? spawnNodeJsBot(server, serverDir)
    : spawnPythonBot(server, serverDir);

  attachProcess(serverId, server.name, child);
}

// ── Attach Process (common for all types) ──────────────
function attachProcess(serverId: string, serverName: string, child: ChildProcess): void {
  processes.set(serverId, child);

  child.stdout?.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    for (const line of lines) {
      addLog(serverId, line, 'stdout');
    }
  });

  child.stderr?.on('data', (data: Buffer) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    for (const line of lines) {
      addLog(serverId, line, 'stderr');
    }
  });

  child.on('spawn', () => {
    updateServerStatus(serverId, 'running', child.pid || null);
    addLog(serverId, `[SVNHost] Process started (PID: ${child.pid})`, 'system');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'running', pid: child.pid });
  });

  child.on('error', (err) => {
    addLog(serverId, `[SVNHost] Process error: ${err.message}`, 'stderr');
    updateServerStatus(serverId, 'error', null);
    processes.delete(serverId);
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
  });

  child.on('exit', (code, signal) => {
    addLog(serverId, `[SVNHost] Process exited (code: ${code}, signal: ${signal})`, 'system');
    updateServerStatus(serverId, 'stopped', null);
    processes.delete(serverId);
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'stopped' });
  });
}

// ── Stop Server ────────────────────────────────────────
export async function stopServer(serverId: string): Promise<void> {
  const server = getServerById(serverId);
  if (!server) throw new Error('Server not found');

  const child = processes.get(serverId);
  if (!child) {
    updateServerStatus(serverId, 'stopped', null);
    return;
  }

  updateServerStatus(serverId, 'stopping');
  addLog(serverId, `[SVNHost] Stopping server...`, 'system');
  io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'stopping' });

  // Send type-appropriate stop command via stdin
  if (child.stdin?.writable) {
    switch (server.type) {
      case 'minecraft':
        child.stdin.write('stop\n');
        break;
      case 'vps':
      case 'vds': {
        // Kill shell process and terminate WSL instance
        const shell = vpsShells.get(serverId);
        if (shell && !shell.killed) shell.kill();
        vpsShells.delete(serverId);
        stopVpsInstance(serverId, (msg) => addLog(serverId, msg, 'system'));
        child.kill();
        return;
      }
      case 'fivem':
      default:
        child.stdin.write('quit\n');
        break;
      case 'bot':
        // Bots handle SIGTERM gracefully
        child.kill('SIGTERM');
        return;
    }
  }

  // Force kill after 10 seconds
  const killTimeout = setTimeout(() => {
    if (processes.has(serverId)) {
      addLog(serverId, `[SVNHost] Force killing process...`, 'stderr');
      child.kill('SIGKILL');
    }
  }, 10000);

  child.on('exit', () => {
    clearTimeout(killTimeout);
  });
}

// ── Restart Server ─────────────────────────────────────
export async function restartServer(serverId: string): Promise<void> {
  await stopServer(serverId);
  // Wait for process to exit
  await new Promise<void>((resolve) => {
    const check = setInterval(() => {
      if (!processes.has(serverId)) {
        clearInterval(check);
        resolve();
      }
    }, 500);
    // Safety timeout
    setTimeout(() => { clearInterval(check); resolve(); }, 15000);
  });
  await startServer(serverId);
}

// ── Send Command ───────────────────────────────────────
export function sendCommand(serverId: string, command: string): void {
  // For VPS, send to the shell process (not sshd)
  const shell = vpsShells.get(serverId);
  if (shell && shell.stdin?.writable) {
    addLog(serverId, `> ${command}`, 'system');
    shell.stdin.write(command + '\n');
    return;
  }

  const child = processes.get(serverId);
  if (!child || !child.stdin?.writable) {
    addLog(serverId, `[SVNHost] Cannot send command — server not running`, 'stderr');
    return;
  }
  addLog(serverId, `> ${command}`, 'system');
  child.stdin.write(command + '\n');
}

// ── Delete Server ──────────────────────────────────────
// ── Reinstall VPS OS ───────────────────────────────────
export async function reinstallServer(serverId: string, newOs: string): Promise<void> {
  const server = getServerById(serverId);
  if (!server) throw new Error('Server not found');
  if (server.type !== 'vps' && server.type !== 'vds') throw new Error('Reinstall is only supported for VPS/VDS servers');

  // Stop if running
  if (processes.has(serverId)) {
    await stopServer(serverId);
    await new Promise(r => setTimeout(r, 2000));
  }

  // Mark as installing
  updateServerStatus(serverId, 'installing');
  io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'installing' });
  addLog(serverId, `[SVNHost] Rozpoczęto reinstalację systemu: ${newOs}...`, 'system');

  const serverDir = getServerDir(serverId);
  const newPassword = generatePassword();

  try {
    await reinstallVpsInstance(
      serverId,
      serverDir,
      server.sshPort || 2222,
      server.sshUser || 'user',
      newPassword,
      server.ramMb || 1024,
      server.cpuCores || 1,
      newOs,
      (msg) => {
        addLog(serverId, msg, 'system');
        io()?.to(`server:${serverId}`).emit('server:log', { id: serverId, log: { timestamp: new Date().toISOString(), message: msg, type: 'system' } });
      },
    );

    // Update DB with new password and OS
    updateServerField(serverId, 'sshPassword', newPassword);
    updateServerField(serverId, 'os', newOs);
    updateServerStatus(serverId, 'stopped');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'stopped' });
    io()?.to(`server:${serverId}`).emit('server:reinstall-complete', { id: serverId, newOs, sshPassword: newPassword });

    addLog(serverId, `[SVNHost] ✅ Reinstalacja zakończona pomyślnie.`, 'system');
  } catch (err: any) {
    addLog(serverId, `[SVNHost] ❌ Błąd reinstalacji: ${err.message}`, 'stderr');
    updateServerStatus(serverId, 'error');
    io()?.to(`server:${serverId}`).emit('server:status', { id: serverId, status: 'error' });
    throw err;
  }
}

export async function deleteServer(serverId: string): Promise<void> {
  // Stop if running
  if (processes.has(serverId)) {
    await stopServer(serverId);
    await new Promise(r => setTimeout(r, 3000));
  }

  // Delete files
  const serverDir = getServerDir(serverId);
  if (fs.existsSync(serverDir)) {
    fs.rmSync(serverDir, { recursive: true, force: true });
  }

  // If VPS, unregister WSL instance
  const server2 = getServerById(serverId);
  if (server2 && (server2.type === 'vps' || server2.type === 'vds')) {
    deleteVpsInstance(serverId, (msg) => addLog(serverId, msg, 'system'));
  }

  // Delete from DB
  deleteServerRecord(serverId);
  consoleLogs.delete(serverId);

  addLog(serverId, `[SVNHost] Server deleted.`, 'system');
}

// ── Get Console Logs ───────────────────────────────────
export function getConsoleLogs(serverId: string): ConsoleLog[] {
  return consoleLogs.get(serverId) || [];
}

// ── Clear Console ──────────────────────────────────────
export function clearConsole(serverId: string): void {
  consoleLogs.set(serverId, []);
}

// ── Get Server Files ───────────────────────────────────
export function getServerFiles(serverId: string, relativePath: string = ''): { name: string; type: 'file' | 'directory'; size?: number }[] {
  const serverDir = getServerDir(serverId);
  const fullPath = path.join(serverDir, relativePath);

  if (!fs.existsSync(fullPath)) return [];

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  return entries.map(entry => ({
    name: entry.name,
    type: entry.isDirectory() ? 'directory' as const : 'file' as const,
    size: entry.isFile() ? fs.statSync(path.join(fullPath, entry.name)).size : undefined,
  }));
}

// ── Read Server File ───────────────────────────────────
export function readServerFile(serverId: string, relativePath: string): string {
  const serverDir = getServerDir(serverId);
  const fullPath = path.join(serverDir, relativePath);
  if (!fs.existsSync(fullPath)) throw new Error('File not found');
  return fs.readFileSync(fullPath, 'utf-8');
}

// ── Write Server File ──────────────────────────────────
export function writeServerFile(serverId: string, relativePath: string, content: string): void {
  const serverDir = getServerDir(serverId);
  const fullPath = path.join(serverDir, relativePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
}

// ── Update server.cfg ──────────────────────────────────
export function updateServerCfg(serverId: string, licenseKey: string, settings: Partial<{
  maxPlayers: number; gameBuild: string; oneSync: string; hostname: string;
}>): void {
  const server = getServerById(serverId);
  if (!server) throw new Error('Server not found');

  // Update DB fields
  if (settings.maxPlayers) updateServerField(serverId, 'maxPlayers', settings.maxPlayers);
  if (settings.gameBuild) updateServerField(serverId, 'gameBuild', settings.gameBuild);
  if (settings.oneSync) updateServerField(serverId, 'oneSync', settings.oneSync);
  if (licenseKey) updateServerField(serverId, 'licenseKey', licenseKey);

  // Regenerate server.cfg
  const updated = { ...server, ...settings, licensKey: licenseKey || server.licensKey };
  const cfg = generateServerCfg(updated as GameServer, licenseKey || server.licensKey || '');
  const serverDir = getServerDir(serverId);
  fs.writeFileSync(path.join(serverDir, 'server.cfg'), cfg, 'utf-8');

  addLog(serverId, `[SVNHost] server.cfg updated.`, 'system');
}

// ── Check FXServer installed ───────────────────────────
export function isFxServerInstalled(): boolean {
  const fxPath = getFxServerPath();
  const exe = process.platform === 'win32'
    ? path.join(fxPath, 'FXServer.exe')
    : path.join(fxPath, 'run.sh');
  return fs.existsSync(exe);
}

// ── Check Java installed ───────────────────────────────
export { isJavaInstalled, getJavaVersion } from './minecraftManager';

// ── Check Bot runtimes installed ───────────────────────
export { isNodeInstalled, getNodeVersion, isPythonInstalled, getPythonVersion } from './botManager';

// ── Get running process info ───────────────────────────
export function getProcessInfo(serverId: string): { running: boolean; pid?: number } {
  const child = processes.get(serverId);
  return {
    running: !!child && !child.killed,
    pid: child?.pid,
  };
}

// ── Get real CPU/RAM usage for a server process ────────
export async function getProcessUsage(serverId: string): Promise<{ cpuUsage: number; ramUsageMb: number } | null> {
  const child = processes.get(serverId);
  if (!child || child.killed || !child.pid) return null;
  try {
    const pidusage = (await import('pidusage')).default;
    const stats = await pidusage(child.pid);
    return {
      cpuUsage: Math.round(stats.cpu * 10) / 10,
      ramUsageMb: Math.round(stats.memory / 1024 / 1024),
    };
  } catch {
    return null;
  }
}

// ── Cleanup on shutdown ────────────────────────────────
export function shutdownAll(): void {
  for (const [id, child] of processes) {
    console.log(`[SVNHost] Shutting down server ${id} (PID: ${child.pid})`);
    if (child.stdin?.writable) child.stdin.write('quit\n');
    setTimeout(() => child.kill('SIGKILL'), 5000);
  }
}
