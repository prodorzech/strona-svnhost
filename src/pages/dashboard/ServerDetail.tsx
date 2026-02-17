import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCurrentUser, startServer, stopServer, restartServer,
  sendConsoleCommand, deleteServer, createBackup, reinstallOS,
  updateServerSettings, simulateStats, editFile, renameFile, deleteFile,
  deleteBackup, renameBackup, toggleBackupLock, downloadBackup,
  updateStartupConfig, extendServer, getServerMonthlyPrice,
  createDatabase, deleteDatabase,
} from '../../store/store';
import { toast } from '../../components/Toast';
import { useStoreState } from '../../store/useStore';
import type { FileNode } from '../../store/types';
import {
  Play, Square, RotateCcw, Terminal, FolderTree, Settings, HardDrive,
  Cpu, MemoryStick, Globe, Users, ArrowLeft, Trash2, Download,
  ChevronRight, File, Folder, Shield, Clock, RefreshCw, MonitorUp,
  Copy, Check, Edit2, X, Save, Lock, Unlock, Pencil, Plus, Rocket,
  Key, Tag, Hash, Radio, Monitor, Info, CalendarPlus, Zap, Server,
  DollarSign, Calendar, AlertTriangle, Database, ExternalLink, Loader,
} from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';
import { osOptions as osOptionsList, getOsIcon } from '../../components/OsIcons';

type Tab = 'info' | 'console' | 'files' | 'backups' | 'startup' | 'database' | 'settings';

import type { Server as ServerT, StoreState } from '../../store/types';

import { useRealServer } from '../../hooks/useRealServer';

function DatabaseTab({ server, serverId, store }: { server: ServerT; serverId: string; store: StoreState }) {
  const [newDbName, setNewDbName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const databases = server.databases || [];
  const isFiveM = server.type === 'fivem';

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleCreate = () => {
    if (!newDbName.trim()) return;
    const result = createDatabase(serverId, newDbName.trim());
    if (result.success) {
      toast.success(`Baza danych "${newDbName.trim()}" została utworzona`);
      setNewDbName('');
    } else {
      toast.error(result.error || 'Błąd tworzenia bazy danych');
    }
  };

  const handleDelete = async (dbId: string, dbName: string) => {
    setDeletingId(dbId);
    setConfirmDeleteId(null);
    try {
      const result = await deleteDatabase(serverId, dbId);
      if (result.success) {
        toast.success(`Baza danych "${dbName}" została usunięta`);
      } else {
        toast.error(result.error || 'Nie udało się usunąć bazy danych');
      }
    } catch {
      toast.error('Błąd podczas usuwania bazy danych');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="animate-fadeInUp" style={{ display: 'grid', gap: 16 }}>
      {/* Local IP warning */}
      {server.ip === '127.0.0.1' && (
        <div className="dash-card" style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 2 }}>Tryb lokalny (brak node'a)</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Serwer używa IP <strong>127.0.0.1</strong> (localhost), ponieważ nie podpięto żadnego node'a. Bazy danych i serwer dostępne są na Twoim komputerze. Podepnij node w panelu admina, aby nadać serwerowi publiczne IP.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create database */}
      <div className="dash-card animate-slideInUp anim-delay-1">
        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Database size={18} style={{ color: 'var(--accent)' }} /> Bazy danych
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '2px 10px', borderRadius: 12 }}>
            {databases.length}/5
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <input className="dash-input" placeholder="Nazwa nowej bazy danych..." value={newDbName}
            onChange={e => setNewDbName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            style={{ flex: 1, maxWidth: 350 }} />
          <button className="btn btn--primary" onClick={handleCreate}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', whiteSpace: 'nowrap' }}
            disabled={databases.length >= 5}>
            <Plus size={15} /> Utwórz bazę
          </button>
        </div>

        {databases.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <HardDrive size={40} style={{ color: 'var(--text-secondary)', opacity: 0.3, marginBottom: 8 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Brak baz danych. Utwórz pierwszą bazę powyżej.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {databases.map(db => (
              <div key={db.id} style={{
                padding: '16px 18px', borderRadius: 10, border: '1px solid var(--border-primary)',
                background: 'var(--bg-input)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <HardDrive size={15} style={{ color: 'var(--accent)' }} /> {db.name}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                      Utworzono: {new Date(db.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                  {deletingId === db.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: '0.78rem' }}>
                      <Loader size={14} className="animate-spin" /> Usuwanie...
                    </div>
                  ) : confirmDeleteId === db.id ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button onClick={() => handleDelete(db.id, db.name)}
                        style={{ background: '#ef444420', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer', padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>Usuń</button>
                      <button onClick={() => setConfirmDeleteId(null)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px 8px', fontSize: '0.78rem' }}>Anuluj</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDeleteId(db.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: '0.82rem' }}>
                  {[
                    { label: 'Host', value: db.host, key: `host-${db.id}` },
                    { label: 'Port', value: db.port.toString(), key: `port-${db.id}` },
                    { label: 'Nazwa bazy', value: db.name, key: `name-${db.id}` },
                    { label: 'Użytkownik', value: db.username, key: `user-${db.id}` },
                    { label: 'Hasło', value: db.password, key: `pass-${db.id}` },
                  ].map(item => (
                    <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--bg-card)', borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 1 }}>{item.label}</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.label === 'Hasło' ? '••••••••' : item.value}</div>
                      </div>
                      <button onClick={() => copyText(item.value, item.key)}
                        style={{ background: 'none', border: 'none', color: copiedField === item.key ? '#22c55e' : 'var(--text-secondary)', cursor: 'pointer', padding: 2 }}>
                        {copiedField === item.key ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Connection string */}
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 8 }}>
                    mysql://{db.username}:{db.password}@{db.host}:{db.port}/{db.name}
                  </div>
                  <button onClick={() => copyText(`mysql://${db.username}:${db.password}@${db.host}:${db.port}/${db.name}`, `conn-${db.id}`)}
                    style={{ background: 'none', border: 'none', color: copiedField === `conn-${db.id}` ? '#22c55e' : 'var(--text-secondary)', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                    {copiedField === `conn-${db.id}` ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* phpMyAdmin link */}
      {store.adminSettings?.phpMyAdminEnabled && store.adminSettings?.phpMyAdminUrl && (
        <div className="dash-card animate-slideInUp anim-delay-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <HardDrive size={20} style={{ color: '#f97316' }} />
              <div>
                <h4 style={{ fontWeight: 700 }}>phpMyAdmin</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Zarządzaj bazami danych przez przeglądarkę</p>
              </div>
            </div>
            <a href={store.adminSettings.phpMyAdminUrl} target="_blank" rel="noopener noreferrer"
              className="btn btn--outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', textDecoration: 'none' }}>
              <ExternalLink size={14} /> Otwórz phpMyAdmin
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export function ServerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const store = useStoreState();
  const user = getCurrentUser();
  const [tab, setTab] = useState<Tab>('info');
  const [extendMonths, setExtendMonths] = useState<number | null>(null);
  const [cmd, setCmd] = useState('');
  const [filePath, setFilePath] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reinstallOs, setReinstallOs] = useState('');
  const [copied, setCopied] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);

  // File manager state
  const [editingFile, setEditingFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [renamingFile, setRenamingFile] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [fileAnimKey, setFileAnimKey] = useState(0);

  // Backup state
  const [renamingBackup, setRenamingBackup] = useState<string | null>(null);
  const [backupRenameValue, setBackupRenameValue] = useState('');
  const [deletingBackup, setDeletingBackup] = useState<string | null>(null);

  // Real backend connection for FiveM servers
  const real = useRealServer(id);

  useEffect(() => {
    const iv = setInterval(simulateStats, 3000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  });

  if (!user || !id) return null;
  const server = store.servers.find(s => s.id === id);
  if (!server) {
    return (
      <div className="dash-card dash-empty animate-scaleIn">
        <p>Serwer nie znaleziony</p>
        <button className="btn btn--primary" onClick={() => navigate('/dashboard/servers')}>Powrót</button>
      </div>
    );
  }

  const isGame = server.type === 'fivem' || server.type === 'minecraft';
  const isVps = server.type === 'vps' || server.type === 'vds';
  const isFiveM = server.type === 'fivem';
  const isMinecraft = server.type === 'minecraft';
  const isBot = server.type === 'bot';
  const needsSftp = isGame || isBot;
  // Merge backend data for VPS SSH credentials
  const sshUser = (real.backendServer as any)?.sshUser || server.sshUser || 'admin';
  const sshPassword = (real.backendServer as any)?.sshPassword || server.sshPassword || '';
  const sshPort = (real.backendServer as any)?.sshPort || server.sshPort || 2222;
  // Use real backend status for ALL server types when backend is online
  const effectiveStatus = (real.backendOnline && real.realStatus) ? real.realStatus : server.status;
  const canStart = effectiveStatus === 'stopped' || effectiveStatus === 'error';
  const canStop = effectiveStatus === 'running' || effectiveStatus === 'starting';

  // Use real CPU/RAM from backend if online, otherwise use frontend store values
  const effectiveCpu = real.backendOnline ? real.cpuUsage : (effectiveStatus === 'running' ? server.cpuUsage : 0);
  const effectiveRamMb = real.backendOnline ? real.ramUsageMb : 0;
  const effectiveRamPct = real.backendOnline
    ? (server.ramMb > 0 ? Math.min(100, (effectiveRamMb / server.ramMb) * 100) : 0)
    : (effectiveStatus === 'running' ? server.ramUsage : 0);

  const handleCmd = () => {
    if (!cmd.trim()) return;
    if (real.backendOnline) {
      real.sendCommand(cmd.trim());
    } else {
      sendConsoleCommand(id, cmd.trim());
    }
    setCmd('');
  };

  const getCurrentFiles = (): FileNode[] => {
    let nodes = server.files;
    for (const part of filePath) {
      const found = nodes.find(f => f.name === part && f.type === 'folder');
      if (found?.children) nodes = found.children;
      else break;
    }
    return nodes;
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleReinstall = () => {
    if (reinstallOs) {
      reinstallOS(id, reinstallOs);
      setReinstallOs('');
    }
  };

  const handleDelete = () => {
    deleteServer(id);
    navigate('/dashboard/servers');
  };

  const navigateToFolder = (folderName: string) => {
    setFilePath([...filePath, folderName]);
    setFileAnimKey(k => k + 1);
  };

  const navigateBack = () => {
    setFilePath(filePath.slice(0, -1));
    setFileAnimKey(k => k + 1);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) setFilePath([]);
    else setFilePath(filePath.slice(0, index + 1));
    setFileAnimKey(k => k + 1);
  };

  const openFile = (node: FileNode) => {
    setEditingFile(node);
    setFileContent(node.content || '');
  };

  const saveFile = () => {
    if (editingFile) {
      editFile(id, filePath, editingFile.name, fileContent);
      setEditingFile(null);
    }
  };

  const handleRenameFile = (oldName: string) => {
    if (renameValue.trim() && renameValue !== oldName) {
      renameFile(id, filePath, oldName, renameValue.trim());
    }
    setRenamingFile(null);
  };

  const handleDeleteFile = (fileName: string) => {
    deleteFile(id, filePath, fileName);
    setDeletingFile(null);
  };

  const handleRenameBackup = (backupId: string) => {
    if (backupRenameValue.trim()) {
      renameBackup(id, backupId, backupRenameValue.trim());
    }
    setRenamingBackup(null);
  };

  const handleDeleteBackup = (backupId: string) => {
    deleteBackup(id, backupId);
    setDeletingBackup(null);
  };

  const osOptions = osOptionsList.map(os => os.name);
  const startupConfig = server.startupConfig || {};

  // ── Render ──────────────────────────────────────────
  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div style={{ marginBottom: 24 }} className="animate-fadeInDown">
        <button onClick={() => navigate('/dashboard/servers')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
          <ArrowLeft size={16} /> Powrót do serwerów
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="dash-page__title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {server.name}
              <span className={`status-badge status-badge--${effectiveStatus}`}>
                <span className="status-dot" />{effectiveStatus}
              </span>
            </h1>
            <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              <span style={{ fontFamily: 'monospace' }}>{server.ip}:{server.port}</span>
              <span>{server.type.toUpperCase()}</span>
              <span>{server.plan}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn--primary" disabled={!canStart}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
              onClick={() => { if (real.backendOnline) { real.startServer().catch(e => toast.error(e.message)); } else { startServer(id); } }}>
              <Play size={14} /> Start
            </button>
            <button className="btn btn--outline" disabled={!canStop}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
              onClick={() => { if (real.backendOnline) { real.stopServer().catch(e => toast.error(e.message)); } else { stopServer(id); } }}>
              <Square size={14} /> Stop
            </button>
            <button className="btn btn--outline"
              disabled={effectiveStatus !== 'running'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}
              onClick={() => { if (real.backendOnline) { real.restartServer().catch(e => toast.error(e.message)); } else { restartServer(id); } }}>
              <RotateCcw size={14} /> Restart
            </button>
          </div>
        </div>
      </div>

      {/* Resource overview — VPS/VDS */}
      {isVps && (
        <div className="dash-grid dash-grid--4" style={{ marginBottom: 24 }}>
          <div className="dash-card animate-slideInUp anim-delay-1" style={{ textAlign: 'center' }}>
            <Cpu size={24} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>CPU</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{server.cpuCores} vCore</div>
            {effectiveStatus === 'running' && (<>
              <div className="progress-bar" style={{ marginTop: 8 }}><div className={`progress-bar__fill progress-bar__fill--${effectiveCpu > 80 ? 'red' : effectiveCpu > 50 ? 'yellow' : 'green'}`} style={{ width: `${effectiveCpu}%` }} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{effectiveCpu.toFixed(1)}%</div>
            </>)}
          </div>
          <div className="dash-card animate-slideInUp anim-delay-2" style={{ textAlign: 'center' }}>
            <MemoryStick size={24} style={{ color: '#8b5cf6', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>RAM</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{(server.ramMb / 1024).toFixed(0)} GB</div>
            {effectiveStatus === 'running' && (<>
              <div className="progress-bar" style={{ marginTop: 8 }}><div className={`progress-bar__fill progress-bar__fill--${effectiveRamPct > 80 ? 'red' : effectiveRamPct > 50 ? 'yellow' : 'green'}`} style={{ width: `${effectiveRamPct}%` }} /></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{effectiveRamPct.toFixed(1)}%{real.backendOnline && effectiveRamMb > 0 ? ` (${effectiveRamMb} MB)` : ''}</div>
            </>)}
          </div>
          <div className="dash-card animate-slideInUp anim-delay-3" style={{ textAlign: 'center' }}>
            <HardDrive size={24} style={{ color: '#f97316', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Dysk</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{server.diskGb} GB</div>
            <div className="progress-bar" style={{ marginTop: 8 }}><div className="progress-bar__fill progress-bar__fill--accent" style={{ width: `${server.diskUsage}%` }} /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>{server.diskUsage.toFixed(1)}% used</div>
          </div>
          <div className="dash-card animate-slideInUp anim-delay-4" style={{ textAlign: 'center' }}>
            <Globe size={24} style={{ color: '#3b82f6', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Sieć</div>
            {effectiveStatus === 'running' ? (<>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: 4 }}>↓ {server.networkIn.toFixed(1)} MB/s</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>↑ {server.networkOut.toFixed(1)} MB/s</div>
            </>) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 12 }}>Serwer wyłączony</div>
            )}
          </div>
        </div>
      )}

      {/* Resource overview — Game */}
      {isGame && (
        <div className="dash-grid dash-grid--4" style={{ marginBottom: 24 }}>
          <div className="dash-card animate-slideInUp anim-delay-1" style={{ textAlign: 'center', background: effectiveStatus === 'running' ? 'rgba(34,197,94,0.05)' : undefined }}>
            <Users size={24} style={{ color: '#22c55e', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Gracze</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{server.currentPlayers ?? 0}<span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>/{server.maxPlayers}</span></div>
          </div>
          <div className="dash-card animate-slideInUp anim-delay-2" style={{ textAlign: 'center' }}>
            <Cpu size={24} style={{ color: 'var(--accent)', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>CPU / RAM</div>
            {effectiveStatus === 'running' ? (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1 }}><div className="progress-bar"><div className={`progress-bar__fill progress-bar__fill--${effectiveCpu > 80 ? 'red' : 'green'}`} style={{ width: `${effectiveCpu}%` }} /></div><div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>CPU {effectiveCpu.toFixed(0)}%</div></div>
                <div style={{ flex: 1 }}><div className="progress-bar"><div className={`progress-bar__fill progress-bar__fill--${effectiveRamPct > 80 ? 'red' : 'green'}`} style={{ width: `${effectiveRamPct}%` }} /></div><div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>RAM {effectiveRamPct.toFixed(0)}%</div></div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: 12 }}>Serwer wyłączony</div>
            )}
          </div>
          <div className="dash-card animate-slideInUp anim-delay-3" style={{ textAlign: 'center' }}>
            <Shield size={24} style={{ color: '#f97316', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Wersja</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: 4 }}>{server.gameVersion || '—'}</div>
          </div>
          <div className="dash-card animate-slideInUp anim-delay-4" style={{ textAlign: 'center' }}>
            <Clock size={24} style={{ color: '#8b5cf6', marginBottom: 8 }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Wygasa</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, marginTop: 4 }}>{new Date(server.expiresAt).toLocaleDateString('pl-PL')}</div>
          </div>
        </div>
      )}

      {/* Connection info for VPS/VDS */}
      {isVps && (
        <div className="dash-card animate-fadeInUp" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Dane dostępowe SSH</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { label: 'Komenda SSH', value: `ssh ${sshUser}@${server.ip} -p ${sshPort}`, key: 'ssh' },
              { label: 'Host', value: server.ip, key: 'host' },
              { label: 'Port SSH', value: String(sshPort), key: 'port' },
              { label: 'Użytkownik', value: sshUser, key: 'user' },
              { label: 'Hasło', value: sshPassword || '—', key: 'password' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', transition: 'transform 0.2s' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{item.label}</div>
                  <code style={{ fontSize: '0.85rem' }}>{item.key === 'password' ? '••••••••' : item.value}</code>
                </div>
                <button onClick={() => handleCopy(item.value, item.key)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {copied === item.key ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </button>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>System</div>
                <span style={{ fontSize: '0.85rem' }}>Ubuntu 24.04 LTS (WSL2)</span>
              </div>
              <MonitorUp size={16} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          </div>
        </div>
      )}

      {/* SFTP connection info for VPS/VDS */}
      {isVps && (
        <div className="dash-card animate-fadeInUp" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderTree size={18} style={{ color: '#f97316' }} /> Połączenie SFTP
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 4 }}>WinSCP / FileZilla</span>
          </h3>
          <div style={{ padding: '10px 14px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Połącz się z serwerem przez SFTP używając <strong>WinSCP</strong> lub <strong>FileZilla</strong>. Protokół: <strong>SFTP</strong> (nie zwykły FTP).
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { label: 'Protokół', value: 'SFTP', key: 'sftp-proto' },
              { label: 'Host', value: server.ip, key: 'sftp-host' },
              { label: 'Port', value: String(sshPort), key: 'sftp-port' },
              { label: 'Użytkownik', value: sshUser, key: 'sftp-user' },
              { label: 'Hasło', value: sshPassword || '—', key: 'sftp-pass' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', transition: 'transform 0.2s' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{item.label}</div>
                  <code style={{ fontSize: '0.85rem' }}>{item.key === 'sftp-pass' ? '••••••••' : item.value}</code>
                </div>
                <button onClick={() => handleCopy(item.value, item.key)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {copied === item.key ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection info for game servers */}
      {isGame && (
        <div className="dash-card animate-fadeInUp" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Globe size={18} style={{ color: '#3b82f6' }} /> Dane połączenia
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 4 }}>Serwer {isFiveM ? 'FiveM' : 'Minecraft'}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { label: 'Adres serwera', value: `${server.ip}:${server.port}`, key: 'game-addr' },
              { label: 'Host / IP', value: server.ip, key: 'game-host' },
              { label: 'Port gry', value: String(server.port), key: 'game-port' },
              ...(isFiveM ? [{ label: 'Połącz w FiveM', value: `connect ${server.ip}:${server.port}`, key: 'game-connect' }] : []),
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', transition: 'transform 0.2s' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{item.label}</div>
                  <code style={{ fontSize: '0.85rem' }}>{item.value}</code>
                </div>
                <button onClick={() => handleCopy(item.value, item.key)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {copied === item.key ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SFTP connection info for game servers + bots */}
      {needsSftp && (
        <div className="dash-card animate-fadeInUp" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderTree size={18} style={{ color: '#f97316' }} /> Połączenie SFTP
            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 4 }}>WinSCP / FileZilla</span>
          </h3>
          <div style={{ padding: '10px 14px', background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', borderRadius: 'var(--radius-md)', marginBottom: 14, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Zarządzaj plikami {isBot ? 'bota' : 'serwera'} przez <strong>WinSCP</strong> lub <strong>FileZilla</strong>. Protokół: <strong>SFTP</strong> (nie zwykły FTP).
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { label: 'Protokół', value: 'SFTP', key: 'gsftp-proto' },
              { label: 'Host', value: server.ip, key: 'gsftp-host' },
              { label: 'Port', value: String(sshPort || 22), key: 'gsftp-port' },
              { label: 'Użytkownik', value: sshUser || 'svnhost', key: 'gsftp-user' },
              { label: 'Hasło', value: sshPassword || '—', key: 'gsftp-pass' },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', transition: 'transform 0.2s' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{item.label}</div>
                  <code style={{ fontSize: '0.85rem' }}>{item.key === 'gsftp-pass' ? '••••••••' : item.value}</code>
                </div>
                <button onClick={() => handleCopy(item.value, item.key)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {copied === item.key ? <Check size={16} color="#22c55e" /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="dash-tabs animate-fadeIn">
        <button className={`dash-tab ${tab === 'info' ? 'dash-tab--active' : ''}`} onClick={() => setTab('info')}>
          <Info size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Info
        </button>
        <button className={`dash-tab ${tab === 'console' ? 'dash-tab--active' : ''}`} onClick={() => setTab('console')}>
          <Terminal size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Konsola
        </button>
        <button className={`dash-tab ${tab === 'files' ? 'dash-tab--active' : ''}`} onClick={() => setTab('files')}>
          <FolderTree size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Pliki
        </button>
        <button className={`dash-tab ${tab === 'backups' ? 'dash-tab--active' : ''}`} onClick={() => setTab('backups')}>
          <Download size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Backupy
        </button>
        {isFiveM && (
          <button className={`dash-tab ${tab === 'startup' ? 'dash-tab--active' : ''}`} onClick={() => setTab('startup')}>
            <Rocket size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Startup
          </button>
        )}
        <button className={`dash-tab ${tab === 'database' ? 'dash-tab--active' : ''}`} onClick={() => setTab('database')}>
          <Database size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Baza danych
        </button>
        <button className={`dash-tab ${tab === 'settings' ? 'dash-tab--active' : ''}`} onClick={() => setTab('settings')}>
          <Settings size={14} style={{ marginRight: 6, verticalAlign: -2 }} /> Ustawienia
        </button>
      </div>

      {/* Info tab */}
      {tab === 'info' && (() => {
        const monthlyPrice = getServerMonthlyPrice(server);
        const expiresDate = new Date(server.expiresAt);
        const createdDate = new Date(server.createdAt);
        const now = new Date();
        const daysLeft = Math.max(0, Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const isExpiringSoon = daysLeft <= 7 && daysLeft > 0;
        const isExpired = daysLeft === 0;

        const handleExtend = (months: number) => {
          const discount = months === 3 ? 0.9 : months === 6 ? 0.85 : 1;
          const totalPrice = Math.round(monthlyPrice * months * discount * 100) / 100;
          const result = extendServer(user.id, id, months);
          if (result.success) {
            toast.success('Serwer przedłużony!', `+${months} mies. za ${totalPrice.toFixed(2)} zł`);
            setExtendMonths(null);
          } else {
            toast.error('Błąd przedłużenia', result.error || 'Wystąpił błąd');
          }
        };

        return (
          <div className="animate-fadeInUp" style={{ display: 'grid', gap: 20 }}>
            {/* Server specs */}
            <div className="dash-card animate-slideInUp anim-delay-1">
              <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Server size={18} style={{ color: 'var(--accent)' }} /> Specyfikacja serwera
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <Cpu size={16} style={{ color: 'var(--accent)' }} /> Procesor
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{server.cpuCores} vCPU</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>AMD EPYC™</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <MemoryStick size={16} style={{ color: '#8b5cf6' }} /> Pamięć RAM
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{(server.ramMb / 1024).toFixed(0)} GB</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>DDR5 ECC</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <HardDrive size={16} style={{ color: '#f59e0b' }} /> Dysk
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{server.diskGb} GB</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>NVMe Enterprise</div>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    <Globe size={16} style={{ color: '#22c55e' }} /> Sieć
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{server.ip}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Port: {server.port}{server.sshPort ? ` • SSH: ${server.sshPort}` : ''}</div>
                </div>
                {server.os && (
                  <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <Monitor size={16} style={{ color: '#06b6d4' }} /> System operacyjny
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{server.os}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{server.type.toUpperCase()}</div>
                  </div>
                )}
                {server.maxPlayers != null && (
                  <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                      <Users size={16} style={{ color: '#ec4899' }} /> Sloty
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{server.maxPlayers}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Max graczy</div>
                  </div>
                )}
              </div>
            </div>

            {/* Billing & Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
              <div className="dash-card animate-slideInUp anim-delay-2">
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={18} style={{ color: 'var(--accent)' }} /> Rozliczenie
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Plan</span>
                    <span style={{ fontWeight: 600 }}>{server.plan}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Typ serwera</span>
                    <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{server.type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cena miesięczna</span>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent)' }}>{monthlyPrice.toFixed(2)} zł</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Utworzono</span>
                    <span style={{ fontWeight: 600 }}>{createdDate.toLocaleDateString('pl-PL')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Wygasa</span>
                    <span style={{ fontWeight: 700, color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#22c55e' }}>
                      {expiresDate.toLocaleDateString('pl-PL')}
                      {isExpired && ' (wygasł)'}
                      {isExpiringSoon && ` (${daysLeft} dni)`}
                    </span>
                  </div>
                </div>
                {(isExpiringSoon || isExpired) && (
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: isExpired ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={16} style={{ color: isExpired ? '#ef4444' : '#f59e0b' }} />
                    <span style={{ fontSize: '0.82rem', color: isExpired ? '#ef4444' : '#f59e0b' }}>
                      {isExpired ? 'Serwer wygasł! Przedłuż go, aby kontynuować korzystanie.' : `Serwer wygasa za ${daysLeft} dni. Rozważ przedłużenie.`}
                    </span>
                  </div>
                )}
              </div>

              {/* Extend server */}
              <div className="dash-card animate-slideInUp anim-delay-3">
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CalendarPlus size={18} style={{ color: 'var(--accent)' }} /> Przedłuż serwer
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
                  Przedłuż czas trwania serwera. Przy dłuższych okresach otrzymasz rabat!
                </p>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[1, 3, 6].map(months => {
                    const discount = months === 3 ? 0.9 : months === 6 ? 0.85 : 1;
                    const total = Math.round(monthlyPrice * months * discount * 100) / 100;
                    const discountPct = months === 3 ? 10 : months === 6 ? 15 : 0;
                    return (
                      <button key={months} onClick={() => setExtendMonths(months)}
                        style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '14px 18px', borderRadius: 'var(--radius-md)',
                          border: extendMonths === months ? '2px solid var(--accent)' : '1px solid var(--border)',
                          background: extendMonths === months ? 'rgba(var(--accent-rgb), 0.06)' : 'var(--bg-tertiary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onMouseLeave={e => { if (extendMonths !== months) e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Calendar size={16} style={{ color: 'var(--accent)' }} />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600 }}>{months} {months === 1 ? 'miesiąc' : months < 5 ? 'miesiące' : 'miesięcy'}</div>
                            {discountPct > 0 && (
                              <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>-{discountPct}% rabatu</div>
                            )}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{total.toFixed(2)} zł</div>
                          {discountPct > 0 && (
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
                              {(monthlyPrice * months).toFixed(2)} zł
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {extendMonths && (
                  <button className="btn btn--primary" onClick={() => handleExtend(extendMonths)}
                    style={{ marginTop: 16, width: '100%', padding: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Zap size={16} /> Przedłuż o {extendMonths} {extendMonths === 1 ? 'miesiąc' : extendMonths < 5 ? 'miesiące' : 'miesięcy'}
                  </button>
                )}
              </div>
            </div>

            {/* Additional info */}
            <div className="dash-card animate-slideInUp anim-delay-4">
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} style={{ color: 'var(--accent)' }} /> Dodatkowe informacje
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Ochrona DDoS</div>
                  <div style={{ fontWeight: 600, color: '#22c55e' }}>Aktywna</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Auto-restart</div>
                  <div style={{ fontWeight: 600, color: server.autoRestart ? '#22c55e' : 'var(--text-secondary)' }}>{server.autoRestart ? 'Włączony' : 'Wyłączony'}</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Backupy</div>
                  <div style={{ fontWeight: 600 }}>{server.backups.length} kopii</div>
                </div>
                <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Pozostało dni</div>
                  <div style={{ fontWeight: 700, color: isExpired ? '#ef4444' : isExpiringSoon ? '#f59e0b' : '#22c55e' }}>{daysLeft}</div>
                </div>
                {server.gameVersion && (
                  <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Wersja gry</div>
                    <div style={{ fontWeight: 600 }}>{server.gameVersion}</div>
                  </div>
                )}
                <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>ID serwera</div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', fontFamily: 'monospace' }}>{server.id}</div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Console tab */}
      {tab === 'console' && (
        <div className="dash-card animate-fadeInUp" style={{ padding: 0 }}>
          <div ref={consoleRef} style={{ height: 400, overflowY: 'auto', padding: 16, fontFamily: '"JetBrains Mono", "Fira Code", monospace', fontSize: '0.82rem', lineHeight: 1.6, background: '#0a0a0a', color: '#e5e5e5', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
            {(real.backendOnline ? real.consoleLines : server.consoleLogs).map((line, i) => (
              <div key={i} style={{ color: line.includes('ERROR') || line.includes('error') || line.includes('stderr') ? '#ef4444' : line.includes('WARN') ? '#eab308' : line.includes('[SVNHost]') ? '#60a5fa' : line.includes('>') ? '#a78bfa' : '#e5e5e5', animation: 'slideInUp 0.2s ease forwards' }}>{line}</div>
            ))}
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #222', background: '#0a0a0a', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <span style={{ padding: '12px 0 12px 16px', color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.85rem' }}>{'>'}</span>
            <input value={cmd} onChange={e => setCmd(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCmd()} placeholder="Wpisz komendę..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '12px 16px', color: '#e5e5e5', fontFamily: 'monospace', fontSize: '0.85rem' }} />
            <button onClick={handleCmd} style={{ padding: '12px 20px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', borderRadius: '0 0 var(--radius-lg) 0', transition: 'background 0.2s' }}>Wyślij</button>
          </div>
        </div>
      )}

      {/* Files tab */}
      {tab === 'files' && editingFile && (
        <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)', minHeight: 500 }}>
          {/* Full-page editor header */}
          <div className="dash-card" style={{ marginBottom: 0, borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={() => setEditingFile(null)}
                  style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px 12px', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                  <ArrowLeft size={14} /> Powrót
                </button>
                <div style={{ width: 1, height: 24, background: 'var(--border-primary)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  <File size={14} />
                  {filePath.length > 0 && (
                    <span style={{ color: 'var(--text-tertiary)' }}>{filePath.join('/')}/</span>
                  )}
                  <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{editingFile.name}</span>
                </div>
                {editingFile.size && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    {(editingFile.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn--ghost btn--sm" onClick={() => setEditingFile(null)}>Anuluj</button>
                <button className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={saveFile}><Save size={14} /> Zapisz</button>
              </div>
            </div>
          </div>
          {/* Editor area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', border: '1px solid var(--border-primary)', borderTop: 'none', overflow: 'hidden' }}>
            <div style={{ padding: '8px 16px', background: '#111', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#666', fontFamily: 'monospace' }}>
                {editingFile.name.endsWith('.lua') ? 'Lua' : editingFile.name.endsWith('.cfg') ? 'Config' : editingFile.name.endsWith('.json') ? 'JSON' : editingFile.name.endsWith('.js') ? 'JavaScript' : editingFile.name.endsWith('.log') ? 'Log' : editingFile.name.endsWith('.xml') ? 'XML' : editingFile.name.endsWith('.yml') || editingFile.name.endsWith('.yaml') ? 'YAML' : 'Text'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#555', fontFamily: 'monospace' }}>
                {fileContent.split('\n').length} linii
              </span>
            </div>
            <textarea
              value={fileContent}
              onChange={e => setFileContent(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1, width: '100%', background: 'transparent', color: '#e5e5e5',
                border: 'none', padding: '16px 20px', fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                fontSize: '0.88rem', lineHeight: 1.7, resize: 'none', outline: 'none', tabSize: 2,
              }}
            />
          </div>
        </div>
      )}

      {tab === 'files' && !editingFile && (
        <div className="dash-card animate-fadeInUp">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigateToBreadcrumb(-1)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: '2px 4px' }}>/root</button>
            {filePath.map((part, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, animation: 'fadeInLeft 0.3s ease forwards' }}>
                <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                <button onClick={() => navigateToBreadcrumb(i)}
                  style={{ background: 'none', border: 'none', color: i === filePath.length - 1 ? 'var(--text-primary)' : 'var(--accent)', cursor: 'pointer', fontWeight: 500, padding: '2px 4px' }}>{part}</button>
              </span>
            ))}
          </div>

          <table className="dash-table" key={fileAnimKey}>
            <thead><tr><th>Nazwa</th><th>Rozmiar</th><th>Modyfikacja</th><th style={{ width: 120 }}>Akcje</th></tr></thead>
            <tbody>
              {filePath.length > 0 && (
                <tr style={{ cursor: 'pointer', animation: 'fadeInLeft 0.25s ease forwards' }} onClick={navigateBack}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Folder size={16} style={{ color: '#eab308' }} /> ..</td>
                  <td>{'—'}</td><td>{'—'}</td><td></td>
                </tr>
              )}
              {getCurrentFiles()
                .sort((a, b) => (a.type === 'folder' ? -1 : 1) - (b.type === 'folder' ? -1 : 1) || a.name.localeCompare(b.name))
                .map((node, idx) => (
                  <tr key={node.name} style={{ cursor: 'pointer', animation: `slideInUp 0.3s ease forwards`, animationDelay: `${idx * 0.04}s`, opacity: 0 }}
                    onClick={() => node.type === 'folder' ? navigateToFolder(node.name) : openFile(node)}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {node.type === 'folder' ? <Folder size={16} style={{ color: '#eab308' }} /> : <File size={16} style={{ color: 'var(--text-tertiary)' }} />}
                      {renamingFile === node.name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                          <input className="dash-input" value={renameValue} onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleRenameFile(node.name)} style={{ padding: '4px 8px', fontSize: '0.85rem', width: 180 }} autoFocus />
                          <button onClick={() => handleRenameFile(node.name)} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}><Check size={14} /></button>
                          <button onClick={() => setRenamingFile(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={14} /></button>
                        </div>
                      ) : (
                        <span style={{ fontWeight: node.type === 'folder' ? 600 : 400 }}>{node.name}</span>
                      )}
                    </td>
                    <td>{node.type === 'file' && node.size ? `${(node.size / 1024).toFixed(1)} KB` : '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(node.modified).toLocaleDateString('pl-PL')}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {node.type === 'file' && (
                          <button onClick={() => openFile(node)} title="Edytuj"
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', cursor: 'pointer', transition: 'all 0.2s' }}><Edit2 size={13} /></button>
                        )}
                        <button onClick={() => { setRenamingFile(node.name); setRenameValue(node.name); }} title="Zmień nazwę"
                          style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}><Pencil size={13} /></button>
                        {deletingFile === node.name ? (<>
                          <button onClick={() => handleDeleteFile(node.name)}
                            style={{ background: '#ef4444', border: 'none', padding: '5px 8px', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Tak</button>
                          <button onClick={() => setDeletingFile(null)}
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.72rem' }}>Nie</button>
                        </>) : (
                          <button onClick={() => setDeletingFile(node.name)} title="Usuń"
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {getCurrentFiles().length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '40px 0' }}>Pusty folder</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Backups tab */}
      {tab === 'backups' && (
        <div className="dash-card animate-fadeInUp">
          {/* Rename backup modal */}
          {renamingBackup && (
            <div className="modal-overlay" onClick={() => setRenamingBackup(null)}>
              <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><Pencil size={18} /> Zmień nazwę backupu</h3>
                  <button onClick={() => setRenamingBackup(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                </div>
                <input className="dash-input" value={backupRenameValue} onChange={e => setBackupRenameValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRenameBackup(renamingBackup)} autoFocus />
                <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                  <button className="btn btn--ghost btn--sm" onClick={() => setRenamingBackup(null)}>Anuluj</button>
                  <button className="btn btn--primary btn--sm" onClick={() => handleRenameBackup(renamingBackup)}>Zapisz</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700 }}>Kopie zapasowe</h3>
            <button className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={() => createBackup(id)}><Plus size={14} /> Utwórz backup</button>
          </div>
          {server.backups.length === 0 ? (
            <p className="animate-fadeIn" style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 40 }}>Brak kopii zapasowych</p>
          ) : (
            <table className="dash-table">
              <thead><tr><th>Nazwa</th><th>Rozmiar</th><th>Data</th><th>Status</th><th style={{ width: 180 }}>Akcje</th></tr></thead>
              <tbody>
                {server.backups.map((b, idx) => (
                  <tr key={b.id} style={{ animation: `slideInUp 0.3s ease forwards`, animationDelay: `${idx * 0.05}s`, opacity: 0 }}>
                    <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      {b.locked && <Lock size={13} style={{ color: '#eab308' }} />}{b.name}
                    </td>
                    <td>{b.size} MB</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(b.createdAt).toLocaleString('pl-PL')}</td>
                    <td>{b.locked
                      ? <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 600 }}>Zablokowany</span>
                      : <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Odblokowany</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => downloadBackup(id, b.id)} title="Pobierz"
                          style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: '#3b82f6', cursor: 'pointer', transition: 'all 0.2s' }}><Download size={13} /></button>
                        <button onClick={() => { setRenamingBackup(b.id); setBackupRenameValue(b.name); }} title="Zmień nazwę"
                          style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}><Pencil size={13} /></button>
                        <button onClick={() => toggleBackupLock(id, b.id)} title={b.locked ? 'Odblokuj' : 'Zablokuj'}
                          style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: b.locked ? '#eab308' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}>
                          {b.locked ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>
                        {b.locked ? (
                          <button disabled title="Odblokuj aby usunąć"
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: 'var(--text-tertiary)', cursor: 'not-allowed', opacity: 0.4 }}><Trash2 size={13} /></button>
                        ) : deletingBackup === b.id ? (<>
                          <button onClick={() => handleDeleteBackup(b.id)}
                            style={{ background: '#ef4444', border: 'none', padding: '5px 8px', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>Tak</button>
                          <button onClick={() => setDeletingBackup(null)}
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px 8px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.72rem' }}>Nie</button>
                        </>) : (
                          <button onClick={() => setDeletingBackup(b.id)} title="Usuń"
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '5px', borderRadius: 'var(--radius-sm)', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Startup tab (FiveM) */}
      {tab === 'startup' && isFiveM && (
        <div className="animate-fadeInUp" style={{ display: 'grid', gap: 16 }}>
          <div className="dash-card animate-slideInUp anim-delay-1">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Rocket size={18} style={{ color: 'var(--accent)' }} /> Konfiguracja startowa FiveM
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 500, margin: '0 auto' }}>
                Skonfiguruj parametry startowe serwera FiveM. Zmiany zostaną zastosowane po restarcie.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 800, margin: '0 auto' }}>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Key size={14} /> Steam Web API Key</label>
                <input className="dash-input" placeholder="Twój Steam Web API Key..." defaultValue={startupConfig.steamWebApiKey || ''}
                  onBlur={e => updateStartupConfig(id, { steamWebApiKey: e.target.value })} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Pobierz z <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>steamcommunity.com/dev/apikey</a></div>
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Key size={14} /> License Key (Cfx.re)</label>
                <input className="dash-input" placeholder="cfxk_xxxx..." defaultValue={startupConfig.serverLicenseKey || ''}
                  onBlur={e => updateStartupConfig(id, { serverLicenseKey: e.target.value })} />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>Pobierz z <a href="https://keymaster.fivem.net" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>keymaster.fivem.net</a></div>
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Tag size={14} /> Tagi serwera</label>
                <input className="dash-input" placeholder="roleplay, polski, economy..." defaultValue={startupConfig.serverTags || ''}
                  onBlur={e => updateStartupConfig(id, { serverTags: e.target.value })} />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Hash size={14} /> Game Build</label>
                <CustomSelect defaultValue={startupConfig.gameBuild || '2802'}
                  onChange={val => updateStartupConfig(id, { gameBuild: val })}
                  options={[
                    { value: '2060', label: '2060 (Los Santos Summer Special)' },
                    { value: '2189', label: '2189 (Cayo Perico Heist)' },
                    { value: '2372', label: '2372 (The Contract)' },
                    { value: '2545', label: '2545 (Criminal Enterprises)' },
                    { value: '2612', label: '2612 (San Andreas Mercenaries)' },
                    { value: '2699', label: '2699 (The Chop Shop)' },
                    { value: '2802', label: '2802 (Bottom Dollar Bounties)' },
                    { value: '3095', label: '3095 (Latest)' },
                  ]}
                />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Users size={14} /> sv_maxClients</label>
                <input className="dash-input" type="number" placeholder="128" defaultValue={startupConfig.svMaxClients || server.maxPlayers || 128}
                  onBlur={e => updateStartupConfig(id, { svMaxClients: parseInt(e.target.value) || 128 })} />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Radio size={14} /> OneSync</label>
                <CustomSelect defaultValue={startupConfig.oneSync || 'on'}
                  onChange={val => updateStartupConfig(id, { oneSync: val as 'on' | 'off' | 'legacy' })}
                  options={[
                    { value: 'on', label: 'On (Zalecane)' },
                    { value: 'legacy', label: 'Legacy' },
                    { value: 'off', label: 'Off' },
                  ]}
                />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Monitor size={14} /> Port txAdmin</label>
                <input className="dash-input" type="number" placeholder="40120" defaultValue={startupConfig.txAdminPort || 40120}
                  onBlur={e => updateStartupConfig(id, { txAdminPort: parseInt(e.target.value) || 40120 })} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database tab */}
      {tab === 'database' && (
        <DatabaseTab server={server} serverId={id!} store={store} />
      )}

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="animate-fadeInUp" style={{ display: 'grid', gap: 16 }}>
          <div className="dash-card animate-slideInUp anim-delay-1">
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Ustawienia ogólne</h3>
            <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
              <div>
                <label className="dash-label">Nazwa serwera</label>
                <input className="dash-input" defaultValue={server.name} onBlur={e => updateServerSettings(id, { name: e.target.value })} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label className="dash-label" style={{ margin: 0 }}>Auto-restart</label>
                <button onClick={() => updateServerSettings(id, { autoRestart: !server.autoRestart })}
                  style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: server.autoRestart ? 'var(--accent)' : 'var(--bg-tertiary)', position: 'relative', transition: 'background 0.2s' }}>
                  <span style={{ position: 'absolute', top: 2, left: server.autoRestart ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                </button>
              </div>
            </div>
          </div>

          {isVps && (
            <div className="dash-card animate-slideInUp anim-delay-2">
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}><RefreshCw size={18} style={{ marginRight: 8, verticalAlign: -3 }} />Reinstalacja systemu</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>Uwaga: Reinstalacja usunie wszystkie dane na serwerze.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <CustomSelect value={reinstallOs} onChange={val => setReinstallOs(val)}
                  placeholder="Wybierz system..."
                  options={osOptions.map(os => ({ value: os, label: os, icon: getOsIcon(os, 18) }))}
                  style={{ maxWidth: 300 }}
                />
                <button className="btn btn--outline" disabled={!reinstallOs} onClick={handleReinstall} style={{ padding: '8px 16px' }}>Reinstaluj</button>
              </div>
            </div>
          )}

          {isGame && (
            <div className="dash-card animate-slideInUp anim-delay-2">
              <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Ustawienia gry</h3>
              <div style={{ display: 'grid', gap: 16, maxWidth: 500 }}>
                <div>
                  <label className="dash-label">Maksymalna liczba graczy</label>
                  <input className="dash-input" type="number" defaultValue={server.maxPlayers || 64}
                    onBlur={e => updateServerSettings(id, { maxPlayers: parseInt(e.target.value) || 64 })} />
                </div>
                <div>
                  <label className="dash-label">Wersja</label>
                  <input className="dash-input" defaultValue={server.gameVersion || ''}
                    onBlur={e => updateServerSettings(id, { gameVersion: e.target.value })} />
                </div>
              </div>
            </div>
          )}

          <div className="dash-card animate-slideInUp anim-delay-3" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <h3 style={{ fontWeight: 700, color: '#ef4444', marginBottom: 8 }}><Trash2 size={18} style={{ marginRight: 8, verticalAlign: -3 }} />Strefa niebezpieczna</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>Usunięcie serwera jest nieodwracalne. Wszystkie dane zostaną utracone.</p>
            {!confirmDelete ? (
              <button className="btn btn--danger" style={{ padding: '8px 16px' }} onClick={() => setConfirmDelete(true)}>Usuń serwer</button>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', animation: 'scaleIn 0.2s ease' }}>
                <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>Na pewno?</span>
                <button className="btn btn--sm" style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={handleDelete}>Tak, usuń</button>
                <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(false)}>Anuluj</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
