import { useState, useEffect, useRef, useCallback } from 'react';
import {
  backendApi, connectWebSocket, joinServerRoom, leaveServerRoom,
  onConsoleLine, onServerStatus, isBackendConnected,
  type ConsoleLog, type BackendServer,
} from '../services/backendApi';
import { useStoreState } from '../store/useStore';

/**
 * Hook that connects ANY server (FiveM, Minecraft, VPS) to the real backend.
 * Auto-syncs frontend server to backend if it doesn't exist there.
 * Provides real console logs, start/stop/restart, and command sending
 * through actual server processes.
 */
export function useRealServer(serverId: string | undefined) {
  const store = useStoreState();
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendServer, setBackendServer] = useState<BackendServer | null>(null);
  const [synced, setSynced] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [realStatus, setRealStatus] = useState<string | null>(null);
  const [realCpuUsage, setRealCpuUsage] = useState<number>(0);
  const [realRamUsageMb, setRealRamUsageMb] = useState<number>(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const syncingRef = useRef(false);

  // Get frontend server data for syncing
  const frontendServer = serverId ? store.servers.find(s => s.id === serverId) : undefined;

  // Ensure server exists in backend (auto-sync from frontend store)
  const ensureBackendServer = useCallback(async (): Promise<boolean> => {
    if (!serverId || !frontendServer || syncingRef.current) return false;

    // Check if already exists in backend
    const check = await backendApi.getServer(serverId);
    if (check.success && check.data) {
      setBackendServer(check.data);
      setRealStatus(check.data.status);
      setRealCpuUsage(check.data.cpuUsage ?? 0);
      setRealRamUsageMb(check.data.ramUsageMb ?? 0);
      setSynced(true);
      return true;
    }

    // Create in backend using the same ID
    syncingRef.current = true;
    try {
      const createData: Record<string, unknown> = {
        id: serverId,
        name: frontendServer.name,
        type: frontendServer.type || 'fivem',
        maxPlayers: frontendServer.maxPlayers || 64,
      };

      // FiveM-specific fields
      if (frontendServer.type === 'fivem') {
        createData.gameBuild = frontendServer.startupConfig?.gameBuild || '3095';
        createData.oneSync = frontendServer.startupConfig?.oneSync || 'on';
        createData.licenseKey = frontendServer.startupConfig?.serverLicenseKey || '';
      }

      // Minecraft-specific fields
      if (frontendServer.type === 'minecraft') {
        createData.mcVersion = frontendServer.gameVersion || '1.21.4';
        createData.mcFlavor = frontendServer.modpack || 'paper';
        createData.ramMb = frontendServer.ramMb || 2048;
      }

      // VPS-specific fields
      if (frontendServer.type === 'vps' || frontendServer.type === 'vds') {
        createData.os = frontendServer.os || 'ubuntu-24.04';
        createData.cpuCores = frontendServer.cpuCores || 2;
        createData.diskGb = frontendServer.diskGb || 30;
        createData.ramMb = frontendServer.ramMb || 4096;
      }

      const res = await backendApi.createServer(createData as any);

      if (res.success && res.data) {
        setBackendServer(res.data);
        setRealStatus(res.data.status);
        setSynced(true);
        console.log('[useRealServer] Auto-synced server to backend:', serverId);
        return true;
      } else {
        console.error('[useRealServer] Failed to sync server:', res.error);
        return false;
      }
    } finally {
      syncingRef.current = false;
    }
  }, [serverId, frontendServer]);

  // Check backend health on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await backendApi.health();
        if (mounted && res.success) {
          setBackendOnline(true);
          await connectWebSocket();
        }
      } catch {
        if (mounted) setBackendOnline(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Auto-sync server to backend when backend comes online
  useEffect(() => {
    if (!backendOnline || !serverId || !frontendServer) return;
    ensureBackendServer();
  }, [backendOnline, serverId, frontendServer?.id]);

  // Join WebSocket room and fetch initial logs (after sync)
  useEffect(() => {
    if (!backendOnline || !serverId || !synced) return;

    joinServerRoom(serverId);

    // Fetch existing logs
    (async () => {
      const res = await backendApi.getConsoleLogs(serverId);
      if (res.success && res.data) {
        setConsoleLogs(res.data);
      }
    })();

    // Listen for new console lines
    const offConsole = onConsoleLine((log) => {
      setConsoleLogs(prev => {
        const next = [...prev, log];
        return next.length > 500 ? next.slice(-500) : next;
      });
    });

    // Listen for status changes
    const offStatus = onServerStatus((data) => {
      if (data.id === serverId) {
        setRealStatus(data.status);
      }
    });

    // Poll server status every 3s (fallback for missed WS events)
    pollingRef.current = setInterval(async () => {
      const res = await backendApi.getServer(serverId);
      if (res.success && res.data) {
        setBackendServer(res.data);
        setRealStatus(res.data.status);
        setRealCpuUsage(res.data.cpuUsage ?? 0);
        setRealRamUsageMb(res.data.ramUsageMb ?? 0);
      }
    }, 3000);

    return () => {
      leaveServerRoom(serverId);
      offConsole();
      offStatus();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [backendOnline, serverId, synced]);

  // Actions — all ensure the server is synced before acting
  const startReal = useCallback(async () => {
    if (!serverId) return;
    await ensureBackendServer();
    setConsoleLogs([]); // Clear console on start
    const res = await backendApi.startServer(serverId);
    if (!res.success) throw new Error(res.error || 'Failed to start');
  }, [serverId, ensureBackendServer]);

  const stopReal = useCallback(async () => {
    if (!serverId) return;
    const res = await backendApi.stopServer(serverId);
    if (!res.success) throw new Error(res.error || 'Failed to stop');
  }, [serverId]);

  const restartReal = useCallback(async () => {
    if (!serverId) return;
    await ensureBackendServer();
    setConsoleLogs([]);
    const res = await backendApi.restartServer(serverId);
    if (!res.success) throw new Error(res.error || 'Failed to restart');
  }, [serverId, ensureBackendServer]);

  const sendCommandReal = useCallback(async (command: string) => {
    if (!serverId) return;
    const res = await backendApi.sendCommand(serverId, command);
    if (!res.success) throw new Error(res.error || 'Failed to send command');
  }, [serverId]);

  const clearConsoleReal = useCallback(async () => {
    if (!serverId) return;
    setConsoleLogs([]);
    await backendApi.clearConsole(serverId);
  }, [serverId]);

  // Format logs as string array for easy rendering
  const consoleLines: string[] = consoleLogs.map(l => {
    const time = new Date(l.timestamp).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `[${time}] ${l.message}`;
  });

  return {
    /** Whether the backend is online and reachable */
    backendOnline,
    /** The server record from the backend DB (null if not synced to backend) */
    backendServer,
    /** Real console log entries */
    consoleLogs,
    /** Console logs formatted as string[] for rendering */
    consoleLines,
    /** Real server status from backend (null = use frontend store status) */
    realStatus,
    /** Real CPU usage % from backend process (0 when stopped) */
    cpuUsage: realCpuUsage,
    /** Real RAM usage in MB from backend process (0 when stopped) */
    ramUsageMb: realRamUsageMb,
    /** Start the real server process (FiveM/MC/VPS) */
    startServer: startReal,
    /** Stop the real server process */
    stopServer: stopReal,
    /** Restart the real server process */
    restartServer: restartReal,
    /** Send a command to stdin of the server process */
    sendCommand: sendCommandReal,
    /** Clear console logs */
    clearConsole: clearConsoleReal,
  };
}
