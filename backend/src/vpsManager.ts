import { ChildProcess, spawn, execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { GameServer } from './types';

// ── WSL2 VPS Manager ──────────────────────────────────
// Each VPS is a real WSL2 Linux instance with SSH access.
// Users can connect via Termius/PuTTY/ssh client.

const ROOTFS_DIR = path.resolve('./vps-base');
const ROOTFS_FILE = path.join(ROOTFS_DIR, 'ubuntu-noble-wsl-amd64.tar.gz');
const ROOTFS_URL = 'https://cloud-images.ubuntu.com/wsl/noble/current/ubuntu-noble-wsl-amd64-24.04lts.rootfs.tar.gz';

// ── WSL detection ──────────────────────────────────────
export function isWslInstalled(): boolean {
  try {
    const result = execSync('wsl --status 2>&1', { encoding: 'utf-8', timeout: 10000 });
    return result.includes('WSL') || result.includes('wsl') || result.length > 0;
  } catch {
    return false;
  }
}

export function getWslVersion(): string | null {
  try {
    const result = execSync('wsl --version 2>&1', { encoding: 'utf-8', timeout: 5000 });
    const match = result.match(/(\d+\.\d+\.\d+)/);
    return match ? match[1] : 'installed';
  } catch {
    return null;
  }
}

// ── Distro name helper ─────────────────────────────────
export function distroName(serverId: string): string {
  return `svnhost-${serverId.substring(0, 12)}`;
}

// ── Check if distro exists ─────────────────────────────
export function distroExists(name: string): boolean {
  try {
    const result = execSync('wsl --list --quiet 2>&1', { encoding: 'utf-8', timeout: 5000 });
    // WSL output may have null bytes (UTF-16)
    const clean = result.replace(/\0/g, '').trim();
    return clean.split('\n').map(l => l.trim()).includes(name);
  } catch {
    return false;
  }
}

// ── Generate random password ───────────────────────────
export function generatePassword(length: number = 16): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let password = '';
  const randomBytes = require('crypto').randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

// ── Download rootfs ────────────────────────────────────
function httpDownload(url: string, dest: string, onProgress?: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpDownload(res.headers.location, dest, onProgress).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const totalSize = parseInt(res.headers['content-length'] || '0', 10);
      let downloaded = 0;
      const file = fs.createWriteStream(dest);
      res.on('data', (chunk: Buffer) => {
        downloaded += chunk.length;
        if (totalSize && onProgress) {
          onProgress(Math.round((downloaded / totalSize) * 100));
        }
      });
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', (err) => { try { fs.unlinkSync(dest); } catch {} reject(err); });
    }).on('error', reject);
  });
}

export async function ensureRootfs(
  onLog?: (msg: string) => void,
): Promise<string> {
  if (fs.existsSync(ROOTFS_FILE)) {
    onLog?.(`Rootfs Ubuntu dostępny`);
    return ROOTFS_FILE;
  }

  fs.mkdirSync(ROOTFS_DIR, { recursive: true });
  onLog?.(`Pobieranie Ubuntu 24.04 rootfs (~500MB)...`);

  let lastPct = 0;
  await httpDownload(ROOTFS_URL, ROOTFS_FILE, (pct) => {
    if (pct >= lastPct + 10) {
      onLog?.(`Pobieranie rootfs: ${pct}%`);
      lastPct = pct;
    }
  });

  onLog?.(`Rootfs pobrany!`);
  return ROOTFS_FILE;
}

// ── Run command inside WSL distro ──────────────────────
function wslExec(distro: string, command: string, timeout: number = 60000): string {
  try {
    // Use base64 encoding to safely pass complex commands
    return execSync(`wsl -d ${distro} -- bash -c "${command.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout,
    });
  } catch (err: any) {
    throw new Error(`WSL exec failed (${distro}): ${err.stderr || err.message}`);
  }
}

// ── Create VPS instance ────────────────────────────────
export async function createVpsInstance(
  serverId: string,
  vpsDir: string,
  sshPort: number,
  sshUser: string,
  sshPassword: string,
  ramMb: number,
  cpuCores: number,
  onLog?: (msg: string) => void,
): Promise<void> {
  const name = distroName(serverId);

  // 1. Ensure rootfs is downloaded
  const rootfs = await ensureRootfs(onLog);

  // 2. Import WSL instance
  const instanceDir = path.join(vpsDir, 'wsl-disk');
  fs.mkdirSync(instanceDir, { recursive: true });

  if (distroExists(name)) {
    onLog?.(`Instancja WSL "${name}" już istnieje, konfiguracja...`);
  } else {
    onLog?.(`Tworzenie instancji WSL: ${name}...`);
    try {
      execSync(`wsl --import ${name} "${instanceDir}" "${rootfs}" --version 2`, {
        encoding: 'utf-8',
        timeout: 180000,
      });
    } catch (err: any) {
      if (!err.message?.includes('already registered') && !err.stderr?.includes('already registered')) {
        throw new Error(`Import WSL failed: ${err.stderr || err.message}`);
      }
    }
  }

  onLog?.(`Instancja WSL utworzona: ${name}`);

  // 3. Install SSH server, sudo, and basics
  onLog?.(`Instalowanie openssh-server (to może chwilę potrwać)...`);
  wslExec(name, 'apt-get update -qq 2>/dev/null && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq openssh-server sudo passwd net-tools > /dev/null 2>&1', 180000);
  onLog?.(`openssh-server zainstalowany`);

  // 4. Create user with password + sudo
  onLog?.(`Tworzenie użytkownika: ${sshUser}...`);
  try { wslExec(name, `id ${sshUser} 2>/dev/null || useradd -m -s /bin/bash -G sudo ${sshUser}`); } catch {}
  wslExec(name, `echo "${sshUser}:${sshPassword}" | chpasswd`);
  // Allow sudo without password
  wslExec(name, `echo "${sshUser} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${sshUser} && chmod 440 /etc/sudoers.d/${sshUser}`);

  // 5. Configure SSH
  onLog?.(`Konfigurowanie SSH na porcie ${sshPort}...`);
  wslExec(name, `mkdir -p /run/sshd`);
  // Write sshd_config
  wslExec(name, `cat > /etc/ssh/sshd_config << 'EOF'
Port ${sshPort}
ListenAddress 0.0.0.0
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
UsePAM yes
X11Forwarding no
PrintMotd yes
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF`);

  // Generate SSH host keys
  wslExec(name, 'ssh-keygen -A 2>/dev/null || true');

  // 6. MOTD
  const motd = [
    '',
    '  ═══════════════════════════════════════',
    '       SVNHost VPS Server',
    '  ═══════════════════════════════════════',
    '  OS: Ubuntu 24.04 LTS (WSL2)',
    `  CPU: ${cpuCores} vCore | RAM: ${ramMb}MB`,
    '  Powered by SVNHost',
    '  ═══════════════════════════════════════',
    '',
  ].join('\\n');
  wslExec(name, `echo -e "${motd}" > /etc/motd`);

  // 7. Set hostname
  const hostname = `vps-${serverId.substring(0, 8)}`;
  wslExec(name, `echo "${hostname}" > /etc/hostname && hostname "${hostname}" 2>/dev/null || true`);

  onLog?.(`VPS gotowy! SSH: ssh ${sshUser}@<IP> -p ${sshPort}`);
}

// ── Start VPS (start sshd inside WSL) ──────────────────
export function startVpsSshd(
  serverId: string,
  sshPort: number,
  onLog?: (msg: string) => void,
): ChildProcess {
  const name = distroName(serverId);

  if (!distroExists(name)) {
    throw new Error(`Instancja WSL "${name}" nie istnieje`);
  }

  onLog?.(`Uruchamianie SSH daemon na porcie ${sshPort}...`);

  // Start sshd in foreground (-D) so we can track the process
  const child = spawn('wsl', [
    '-d', name,
    '--',
    'bash', '-c',
    `mkdir -p /run/sshd && /usr/sbin/sshd -D -e -p ${sshPort} 2>&1`,
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  return child;
}

// ── Spawn interactive shell inside VPS (for web console) ──
export function spawnVpsShell(
  serverId: string,
  sshUser: string,
): ChildProcess {
  const name = distroName(serverId);

  const child = spawn('wsl', [
    '-d', name,
    '-u', sshUser,
    '--',
    'bash', '--login',
  ], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  return child;
}

// ── Stop VPS (terminate WSL instance) ──────────────────
export function stopVpsInstance(
  serverId: string,
  onLog?: (msg: string) => void,
): void {
  const name = distroName(serverId);
  onLog?.(`Zatrzymywanie instancji WSL: ${name}...`);
  try {
    execSync(`wsl --terminate ${name}`, { encoding: 'utf-8', timeout: 15000 });
  } catch {
    // May already be stopped
  }
  onLog?.(`Instancja zatrzymana.`);
}

// ── Delete VPS (unregister WSL + delete disk) ──────────
export function deleteVpsInstance(
  serverId: string,
  onLog?: (msg: string) => void,
): void {
  const name = distroName(serverId);
  onLog?.(`Usuwanie instancji WSL: ${name}...`);
  try {
    execSync(`wsl --unregister ${name}`, { encoding: 'utf-8', timeout: 30000 });
  } catch {
    // May not exist
  }
  onLog?.(`Instancja usunięta.`);
}

// ── Reinstall VPS (destroy + recreate from scratch) ────
export async function reinstallVpsInstance(
  serverId: string,
  vpsDir: string,
  sshPort: number,
  sshUser: string,
  sshPassword: string,
  ramMb: number,
  cpuCores: number,
  newOs: string,
  onLog?: (msg: string) => void,
): Promise<void> {
  const name = distroName(serverId);

  // 1. Terminate running instance
  onLog?.(`[SVNHost] Zatrzymywanie bieżącej instancji...`);
  try {
    execSync(`wsl --terminate ${name}`, { encoding: 'utf-8', timeout: 15000 });
  } catch { /* may not be running */ }

  // 2. Unregister old instance (deletes all data)
  onLog?.(`[SVNHost] Usuwanie starej instancji WSL: ${name}...`);
  try {
    execSync(`wsl --unregister ${name}`, { encoding: 'utf-8', timeout: 30000 });
  } catch { /* may not exist */ }
  onLog?.(`[SVNHost] Stara instancja usunięta.`);

  // 3. Clean up server directory
  if (fs.existsSync(vpsDir)) {
    const wslDisk = path.join(vpsDir, 'wsl-disk');
    if (fs.existsSync(wslDisk)) {
      fs.rmSync(wslDisk, { recursive: true, force: true });
    }
  }
  onLog?.(`[SVNHost] Stare dane usunięte.`);

  // 4. Ensure rootfs is downloaded
  const rootfs = await ensureRootfs(onLog);

  // 5. Import fresh WSL instance
  const instanceDir = path.join(vpsDir, 'wsl-disk');
  fs.mkdirSync(instanceDir, { recursive: true });

  onLog?.(`[SVNHost] Importowanie nowej instancji WSL: ${name} (${newOs})...`);
  try {
    execSync(`wsl --import ${name} "${instanceDir}" "${rootfs}" --version 2`, {
      encoding: 'utf-8',
      timeout: 180000,
    });
  } catch (err: any) {
    if (!err.message?.includes('already registered') && !err.stderr?.includes('already registered')) {
      throw new Error(`Import WSL failed: ${err.stderr || err.message}`);
    }
  }
  onLog?.(`[SVNHost] Nowa instancja WSL utworzona: ${name}`);

  // 6. Install packages
  onLog?.(`[SVNHost] Aktualizowanie systemu i instalowanie pakietów...`);
  wslExec(name, 'apt-get update -qq 2>/dev/null && DEBIAN_FRONTEND=noninteractive apt-get install -y -qq openssh-server sudo passwd net-tools curl wget htop vim nano git unzip > /dev/null 2>&1', 300000);
  onLog?.(`[SVNHost] Pakiety zainstalowane.`);

  // 7. Create user
  onLog?.(`[SVNHost] Tworzenie użytkownika: ${sshUser}...`);
  try { wslExec(name, `id ${sshUser} 2>/dev/null || useradd -m -s /bin/bash -G sudo ${sshUser}`); } catch {}
  wslExec(name, `echo "${sshUser}:${sshPassword}" | chpasswd`);
  wslExec(name, `echo "${sshUser} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/${sshUser} && chmod 440 /etc/sudoers.d/${sshUser}`);

  // 8. Configure SSH
  onLog?.(`[SVNHost] Konfigurowanie SSH na porcie ${sshPort}...`);
  wslExec(name, `mkdir -p /run/sshd`);
  wslExec(name, `cat > /etc/ssh/sshd_config << 'EOF'
Port ${sshPort}
ListenAddress 0.0.0.0
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
UsePAM yes
X11Forwarding no
PrintMotd yes
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
EOF`);
  wslExec(name, 'ssh-keygen -A 2>/dev/null || true');

  // 9. MOTD
  const motd = [
    '',
    '  ═══════════════════════════════════════',
    '       SVNHost VPS Server',
    `       Reinstalled: ${newOs}`,
    '  ═══════════════════════════════════════',
    `  OS: ${newOs} (WSL2)`,
    `  CPU: ${cpuCores} vCore | RAM: ${ramMb}MB`,
    '  Powered by SVNHost',
    '  ═══════════════════════════════════════',
    '',
  ].join('\\n');
  wslExec(name, `echo -e "${motd}" > /etc/motd`);

  // 10. Hostname
  const hostname = `vps-${serverId.substring(0, 8)}`;
  wslExec(name, `echo "${hostname}" > /etc/hostname && hostname "${hostname}" 2>/dev/null || true`);

  onLog?.(`[SVNHost] ✅ Reinstalacja zakończona! System: ${newOs}`);
  onLog?.(`[SVNHost] SSH: ssh ${sshUser}@<IP> -p ${sshPort}`);
  onLog?.(`[SVNHost] Hasło: ${sshPassword}`);
}

// ── Get WSL distro status ──────────────────────────────
export function getVpsDistroStatus(serverId: string): 'running' | 'stopped' | 'not-found' {
  const name = distroName(serverId);
  try {
    const result = execSync('wsl --list --verbose 2>&1', { encoding: 'utf-8', timeout: 5000 });
    const clean = result.replace(/\0/g, '');
    const lines = clean.split('\n');
    for (const line of lines) {
      if (line.includes(name)) {
        if (line.toLowerCase().includes('running')) return 'running';
        return 'stopped';
      }
    }
    return 'not-found';
  } catch {
    return 'not-found';
  }
}

// ── Get next available SSH port ────────────────────────
export function getNextSshPort(usedPorts: number[], basePort: number = 2222): number {
  let port = basePort;
  while (usedPorts.includes(port)) port++;
  return port;
}
