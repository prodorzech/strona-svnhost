import { ChildProcess, spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { GameServer } from './types';

// ── Runtime detection ──────────────────────────────────

let _nodeVersion: string | null = null;
let _pythonPath: string | null = null;
let _pythonVersion: string | null = null;

export function detectNodeJs(): string | null {
  try {
    const ver = execSync('node --version', { encoding: 'utf-8' }).trim();
    _nodeVersion = ver;
    return ver;
  } catch {
    return null;
  }
}

export function isNodeInstalled(): boolean {
  return detectNodeJs() !== null;
}

export function getNodeVersion(): string | null {
  if (_nodeVersion) return _nodeVersion;
  return detectNodeJs();
}

export function detectPython(): string | null {
  // Try python3 first, then python
  for (const cmd of ['python3', 'python', 'py']) {
    try {
      const ver = execSync(`${cmd} --version`, { encoding: 'utf-8' }).trim();
      if (ver.startsWith('Python 3')) {
        _pythonPath = cmd;
        _pythonVersion = ver;
        return cmd;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export function isPythonInstalled(): boolean {
  return detectPython() !== null;
}

export function getPythonVersion(): string | null {
  if (_pythonVersion) return _pythonVersion;
  detectPython();
  return _pythonVersion;
}

export function getPythonPath(): string {
  if (_pythonPath) return _pythonPath;
  return detectPython() || 'python3';
}

// ── Bot project scaffolding ────────────────────────────

export function generateNodeJsBotProject(serverDir: string, botName: string): void {
  // package.json
  const packageJson = {
    name: botName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    version: '1.0.0',
    description: `Discord bot - ${botName}`,
    main: 'index.js',
    scripts: {
      start: 'node index.js',
      dev: 'node --watch index.js',
    },
    dependencies: {
      'discord.js': '^14.14.1',
      dotenv: '^16.4.1',
    },
  };
  fs.writeFileSync(path.join(serverDir, 'package.json'), JSON.stringify(packageJson, null, 2), 'utf-8');

  // index.js
  const indexJs = `const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const PREFIX = process.env.PREFIX || '!';

client.once(Events.ClientReady, (readyClient) => {
  console.log(\`[BOT] Zalogowano jako \${readyClient.user.tag}\`);
  console.log(\`[BOT] Serwery: \${readyClient.guilds.cache.size}\`);
  console.log(\`[BOT] Prefix: \${PREFIX}\`);
  
  readyClient.user.setActivity('SVNHost Bot Hosting', { type: ActivityType.Playing });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;
  
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();
  
  switch (command) {
    case 'ping':
      const latency = Date.now() - message.createdTimestamp;
      await message.reply(\`🏓 Pong! Opóźnienie: \${latency}ms | API: \${Math.round(client.ws.ping)}ms\`);
      break;
    case 'info':
      await message.reply(\`🤖 Bot hostowany na SVNHost\\n📊 Serwery: \${client.guilds.cache.size}\\n👥 Użytkownicy: \${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\`);
      break;
    case 'help':
      await message.reply(\`📋 Komendy:\\n\${PREFIX}ping - Sprawdź opóźnienie\\n\${PREFIX}info - Informacje o bocie\\n\${PREFIX}help - Ta wiadomość\`);
      break;
    default:
      break;
  }
});

client.on(Events.Error, (error) => {
  console.error('[BOT] Błąd klienta:', error);
});

process.on('SIGINT', () => {
  console.log('[BOT] Zamykanie...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[BOT] Zamykanie...');
  client.destroy();
  process.exit(0);
});

// Login
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('[BOT] BŁĄD: Brak BOT_TOKEN w pliku .env!');
  console.error('[BOT] Ustaw token w pliku .env: BOT_TOKEN=twój_token_tutaj');
  process.exit(1);
}

client.login(token).catch((err) => {
  console.error('[BOT] Błąd logowania:', err.message);
  process.exit(1);
});
`;
  fs.writeFileSync(path.join(serverDir, 'index.js'), indexJs, 'utf-8');

  // .env
  const envContent = `# Discord Bot Token — wklej tutaj swój token z https://discord.com/developers/applications
BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Prefix komend
PREFIX=!
`;
  fs.writeFileSync(path.join(serverDir, '.env'), envContent, 'utf-8');

  // logs directory
  fs.mkdirSync(path.join(serverDir, 'logs'), { recursive: true });
}

export function generatePythonBotProject(serverDir: string, botName: string): void {
  // requirements.txt
  const requirements = `discord.py==2.3.2
python-dotenv==1.0.1
`;
  fs.writeFileSync(path.join(serverDir, 'requirements.txt'), requirements, 'utf-8');

  // bot.py
  const botPy = `import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv('BOT_TOKEN')
PREFIX = os.getenv('PREFIX', '!')

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix=PREFIX, intents=intents)

@bot.event
async def on_ready():
    print(f'[BOT] Zalogowano jako {bot.user}')
    print(f'[BOT] Serwery: {len(bot.guilds)}')
    print(f'[BOT] Prefix: {PREFIX}')
    await bot.change_presence(activity=discord.Game(name='SVNHost Bot Hosting'))

@bot.command(name='ping')
async def ping_cmd(ctx):
    latency = round(bot.latency * 1000)
    await ctx.reply(f'🏓 Pong! Opóźnienie: {latency}ms')

@bot.command(name='info')
async def info_cmd(ctx):
    users = sum(g.member_count for g in bot.guilds)
    await ctx.reply(f'🤖 Bot hostowany na SVNHost\\n📊 Serwery: {len(bot.guilds)}\\n👥 Użytkownicy: {users}')

@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.CommandNotFound):
        return
    print(f'[BOT] Błąd: {error}')

if not TOKEN:
    print('[BOT] BŁĄD: Brak BOT_TOKEN w pliku .env!')
    print('[BOT] Ustaw token w pliku .env: BOT_TOKEN=twój_token_tutaj')
    exit(1)

bot.run(TOKEN)
`;
  fs.writeFileSync(path.join(serverDir, 'bot.py'), botPy, 'utf-8');

  // .env
  const envContent = `# Discord Bot Token — wklej tutaj swój token z https://discord.com/developers/applications
BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Prefix komend
PREFIX=!
`;
  fs.writeFileSync(path.join(serverDir, '.env'), envContent, 'utf-8');

  // logs directory
  fs.mkdirSync(path.join(serverDir, 'logs'), { recursive: true });
}

// ── Install dependencies ───────────────────────────────

export function installNodeDependencies(
  serverDir: string,
  onLog: (msg: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    onLog('[SVNHost] Instalowanie zależności Node.js (npm install)...');

    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const child = spawn(npmCmd, ['install', '--production'], {
      cwd: serverDir,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      for (const line of lines) onLog(`[npm] ${line}`);
    });
    child.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      for (const line of lines) onLog(`[npm] ${line}`);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        onLog('[SVNHost] Zależności Node.js zainstalowane pomyślnie.');
        resolve();
      } else {
        onLog(`[SVNHost] BŁĄD: npm install zakończył się kodem ${code}`);
        reject(new Error(`npm install exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      onLog(`[SVNHost] BŁĄD npm: ${err.message}`);
      reject(err);
    });
  });
}

export function installPythonDependencies(
  serverDir: string,
  onLog: (msg: string) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const pythonCmd = getPythonPath();
    onLog(`[SVNHost] Instalowanie zależności Python (pip install)...`);

    const child = spawn(pythonCmd, ['-m', 'pip', 'install', '-r', 'requirements.txt', '--target', path.join(serverDir, 'pip_modules')], {
      cwd: serverDir,
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    child.stdout?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      for (const line of lines) onLog(`[pip] ${line}`);
    });
    child.stderr?.on('data', (data: Buffer) => {
      const lines = data.toString().split('\n').filter((l: string) => l.trim());
      for (const line of lines) onLog(`[pip] ${line}`);
    });

    child.on('exit', (code) => {
      if (code === 0) {
        onLog('[SVNHost] Zależności Python zainstalowane pomyślnie.');
        resolve();
      } else {
        onLog(`[SVNHost] BŁĄD: pip install zakończył się kodem ${code}`);
        reject(new Error(`pip install exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      onLog(`[SVNHost] BŁĄD pip: ${err.message}`);
      reject(err);
    });
  });
}

// ── Spawn bot process ──────────────────────────────────

export function spawnNodeJsBot(server: GameServer, serverDir: string): ChildProcess {
  const child = spawn('node', ['index.js'], {
    cwd: serverDir,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PYTHONPATH: undefined,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return child;
}

export function spawnPythonBot(server: GameServer, serverDir: string): ChildProcess {
  const pythonCmd = getPythonPath();
  const pipModules = path.join(serverDir, 'pip_modules');

  const child = spawn(pythonCmd, ['-u', 'bot.py'], {
    cwd: serverDir,
    env: {
      ...process.env,
      PYTHONPATH: fs.existsSync(pipModules) ? pipModules : undefined,
      PYTHONUNBUFFERED: '1',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return child;
}

// ── Get next bot port ──────────────────────────────────

let _nextBotPort = 8080;

export function getNextBotPort(usedPorts: number[], base = 8080): number {
  let port = Math.max(base, _nextBotPort);
  while (usedPorts.includes(port)) port++;
  _nextBotPort = port + 1;
  return port;
}
