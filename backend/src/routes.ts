import { Router, Request, Response } from 'express';
import {
  createServer, startServer, stopServer, restartServer,
  deleteServer, reinstallServer, sendCommand, getConsoleLogs, clearConsole,
  getServerFiles, readServerFile, writeServerFile,
  updateServerCfg, isFxServerInstalled, getProcessInfo, getProcessUsage,
  isJavaInstalled, getJavaVersion,
} from './serverManager';
import { getAllServers, getServerById } from './database';
import { ApiResponse, CreateServerRequest } from './types';
import { isWslInstalled, getWslVersion } from './vpsManager';
import { createMysqlDatabase, deleteMysqlDatabase, isMysqlAvailable } from './mysqlManager';

const router = Router();

const startedAt = Date.now();

// ── Health ──────────────────────────────────────────────
router.get('/health', async (_req: Request, res: Response) => {
  const mysqlOk = await isMysqlAvailable();
  res.json({
    success: true,
    data: {
      status: 'ok',
      fxServerInstalled: isFxServerInstalled(),
      javaInstalled: isJavaInstalled(),
      javaVersion: getJavaVersion(),
      wslInstalled: isWslInstalled(),
      wslVersion: getWslVersion(),
      version: '2.0.0',
      mysqlAvailable: mysqlOk,
      startedAt,
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    },
  } as ApiResponse);
});

// ── List Servers ────────────────────────────────────────
router.get('/servers', async (_req: Request, res: Response) => {
  try {
    const servers = await Promise.all(getAllServers().map(async s => {
      const proc = getProcessInfo(s.id);
      const usage = proc.running ? await getProcessUsage(s.id) : null;
      return {
        ...s,
        ...proc,
        cpuUsage: usage?.cpuUsage ?? 0,
        ramUsageMb: usage?.ramUsageMb ?? 0,
      };
    }));
    res.json({ success: true, data: servers } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Get Server ──────────────────────────────────────────
router.get('/servers/:id', async (req: Request, res: Response) => {
  try {
    const server = getServerById(req.params.id);
    if (!server) return res.status(404).json({ success: false, error: 'Server not found' } as ApiResponse);
    const proc = getProcessInfo(server.id);
    const usage = proc.running ? await getProcessUsage(server.id) : null;
    res.json({ success: true, data: {
      ...server,
      ...proc,
      cpuUsage: usage?.cpuUsage ?? 0,
      ramUsageMb: usage?.ramUsageMb ?? 0,
    } } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Create Server ───────────────────────────────────────
router.post('/servers', async (req: Request, res: Response) => {
  try {
    const body: CreateServerRequest = req.body;
    if (!body.name) return res.status(400).json({ success: false, error: 'Server name is required' } as ApiResponse);

    const server = await createServer(body);
    res.status(201).json({ success: true, data: server } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Delete Server ───────────────────────────────────────
router.delete('/servers/:id', async (req: Request, res: Response) => {
  try {
    await deleteServer(req.params.id);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Start ───────────────────────────────────────────────
router.post('/servers/:id/start', async (req: Request, res: Response) => {
  try {
    await startServer(req.params.id);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Stop ────────────────────────────────────────────────
router.post('/servers/:id/stop', async (req: Request, res: Response) => {
  try {
    await stopServer(req.params.id);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Restart ─────────────────────────────────────────────
router.post('/servers/:id/restart', async (req: Request, res: Response) => {
  try {
    await restartServer(req.params.id);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Reinstall OS (VPS only) ─────────────────────────────
router.post('/servers/:id/reinstall', async (req: Request, res: Response) => {
  try {
    const { os } = req.body;
    if (!os) return res.status(400).json({ success: false, error: 'OS is required' } as ApiResponse);
    // Run reinstall in background, respond immediately
    reinstallServer(req.params.id, os).catch(err => {
      console.error(`[Reinstall] Error for ${req.params.id}:`, err.message);
    });
    res.json({ success: true, data: { message: 'Reinstall started' } } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Send Console Command ────────────────────────────────
router.post('/servers/:id/command', (req: Request, res: Response) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ success: false, error: 'Command required' } as ApiResponse);
    sendCommand(req.params.id, command);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Get Console Logs ────────────────────────────────────
router.get('/servers/:id/console', (req: Request, res: Response) => {
  try {
    const logs = getConsoleLogs(req.params.id);
    res.json({ success: true, data: logs } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Clear Console ───────────────────────────────────────
router.post('/servers/:id/console/clear', (req: Request, res: Response) => {
  try {
    clearConsole(req.params.id);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Server Files ────────────────────────────────────────
router.get('/servers/:id/files', (req: Request, res: Response) => {
  try {
    const relativePath = (req.query.path as string) || '';
    const files = getServerFiles(req.params.id, relativePath);
    res.json({ success: true, data: files } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

router.get('/servers/:id/files/read', (req: Request, res: Response) => {
  try {
    const relativePath = req.query.path as string;
    if (!relativePath) return res.status(400).json({ success: false, error: 'Path required' } as ApiResponse);
    const content = readServerFile(req.params.id, relativePath);
    res.json({ success: true, data: { content } } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

router.post('/servers/:id/files/write', (req: Request, res: Response) => {
  try {
    const { path: filePath, content } = req.body;
    if (!filePath) return res.status(400).json({ success: false, error: 'Path required' } as ApiResponse);
    writeServerFile(req.params.id, filePath, content || '');
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Update Server Config ────────────────────────────────
router.put('/servers/:id/config', (req: Request, res: Response) => {
  try {
    const { licenseKey, ...settings } = req.body;
    updateServerCfg(req.params.id, licenseKey, settings);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Create MySQL Database ───────────────────────────────
router.post('/databases', async (req: Request, res: Response) => {
  try {
    const { dbName, username, password } = req.body;
    if (!dbName || !username || !password) {
      return res.status(400).json({ success: false, error: 'Missing dbName, username or password' } as ApiResponse);
    }
    await createMysqlDatabase(dbName, username, password);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

// ── Delete MySQL Database ───────────────────────────────
router.delete('/databases', async (req: Request, res: Response) => {
  try {
    const { dbName, username } = req.body;
    if (!dbName || !username) {
      return res.status(400).json({ success: false, error: 'Missing dbName or username' } as ApiResponse);
    }
    await deleteMysqlDatabase(dbName, username);
    res.json({ success: true } as ApiResponse);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message } as ApiResponse);
  }
});

export default router;
