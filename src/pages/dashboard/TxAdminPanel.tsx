import { useState, useEffect, useRef } from 'react';
import './TxAdmin.css';
import {
  getTxAdminData, txKickPlayer, txBanPlayer, txUnbanPlayer,
  txToggleResource, txRestartResource, txAddSchedule, txRemoveSchedule,
  txToggleSchedule, txSendAnnouncement, txToggleWhitelist,
  txAddWhitelistId, txRemoveWhitelistId,
  sendConsoleCommand, startServer, stopServer, restartServer,
} from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { toast } from '../../components/Toast';
import type { TxAdminPlayer } from '../../store/types';
import { useRealServer } from '../../hooks/useRealServer';
import {
  Users, Shield, Package, Clock, Megaphone, Terminal, Play, Square,
  RotateCcw, Trash2, Plus, X, Check, Copy, Ban, UserX, Search,
  Power, AlertTriangle, Eye, ChevronDown, ChevronRight,
  Activity, Wifi, Calendar, Volume2, ShieldCheck, ShieldOff,
} from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

type TxTab = 'dashboard' | 'players' | 'resources' | 'bans' | 'scheduler' | 'console' | 'whitelist';

interface TxAdminPanelProps {
  serverId: string;
}

export function TxAdminPanel({ serverId }: TxAdminPanelProps) {
  const store = useStoreState();
  const server = store.servers.find(s => s.id === serverId);
  const real = useRealServer(serverId);
  if (!server) return null;

  const txData = server.startupConfig?.txAdminData || getTxAdminData(serverId);
  const isRunning = server.status === 'running';

  const [txTab, setTxTab] = useState<TxTab>('dashboard');
  const [announcement, setAnnouncement] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [kickModal, setKickModal] = useState<TxAdminPlayer | null>(null);
  const [banModal, setBanModal] = useState<{ player?: TxAdminPlayer; show: boolean }>({ show: false });
  const [kickReason, setKickReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const [banName, setBanName] = useState('');
  const [banIdentifier, setBanIdentifier] = useState('');
  const [scheduleTime, setScheduleTime] = useState('04:00');
  const [scheduleDays, setScheduleDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [scheduleAction, setScheduleAction] = useState<'restart' | 'stop' | 'backup'>('restart');
  const [whitelistId, setWhitelistId] = useState('');
  const [consoleCmd, setConsoleCmd] = useState('');
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  });

  const handleKick = () => {
    if (!kickModal) return;
    txKickPlayer(serverId, kickModal.id, kickReason || 'Kicked by admin');
    toast.success(`Gracz ${kickModal.name} wyrzucony`);
    setKickModal(null);
    setKickReason('');
  };

  const handleBan = () => {
    const name = banModal.player?.name || banName;
    const id = banModal.player?.identifiers[0] || banIdentifier;
    if (!name || !id) { toast.error('Podaj nazwę i identyfikator gracza'); return; }
    txBanPlayer(serverId, name, id, banReason || 'Banned', banDuration || undefined);
    toast.success(`Gracz ${name} zbanowany${banDuration ? ` na ${banDuration}` : ' permanentnie'}`);
    setBanModal({ show: false });
    setBanReason('');
    setBanDuration('');
    setBanName('');
    setBanIdentifier('');
  };

  const handleConsoleCmd = () => {
    if (!consoleCmd.trim()) return;
    if (real.backendOnline) {
      real.sendCommand(consoleCmd.trim());
    } else {
      sendConsoleCommand(serverId, consoleCmd.trim());
    }
    setConsoleCmd('');
  };

  const filteredPlayers = txData.players.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.identifiers.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredResources = txData.resources.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBans = txData.bans.filter(b =>
    b.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.identifier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Styles ──────────────────────────────────────
  const tabBtn = (t: TxTab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => { setTxTab(t); setSearchQuery(''); }}
      className={txTab === t ? 'tx-tab tx-tab--active' : 'tx-tab'}
    >
      {icon} {label}
    </button>
  );

  const statCard = (icon: React.ReactNode, label: string, value: string | number, color: string, sub?: string) => (
    <div className="tx-stat-card" style={{ '--tx-color': color } as React.CSSProperties}>
      <div className="tx-stat-card__icon" style={{ background: `${color}18`, color }}>{icon}</div>
      <div className="tx-stat-card__body">
        <div className="tx-stat-card__value">{value}</div>
        <div className="tx-stat-card__label">{label}</div>
        {sub && <div className="tx-stat-card__sub">{sub}</div>}
      </div>
    </div>
  );

  return (
    <div className="tx-panel animate-fadeInUp">
      {/* txAdmin Header */}
      <div className="tx-header">
        <div className="tx-header__left">
          <div className="tx-header__logo">
            <div className="tx-header__logo-icon">tx</div>
            <div>
              <h2 className="tx-header__title">txAdmin</h2>
              <p className="tx-header__subtitle">
                {server.ip}:{server.startupConfig?.txAdminPort || 40120}
                {isRunning
                  ? <span className="tx-status tx-status--online"><Activity size={10} /> Online</span>
                  : <span className="tx-status tx-status--offline"><Power size={10} /> Offline</span>
                }
              </p>
            </div>
          </div>
        </div>
        <div className="tx-header__right">
          {real.backendOnline ? (
            <a
              href={`http://localhost:${server.startupConfig?.txAdminPort || 40120}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn--sm btn--primary"
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', textDecoration: 'none' }}>
              <Eye size={13} /> Panel txAdmin
            </a>
          ) : (
            <button
              className="btn btn--sm btn--primary"
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem' }}
              onClick={() => toast.info(`txAdmin panel: http://${server.ip}:${server.startupConfig?.txAdminPort || 40120}`)}>
              <Eye size={13} /> Panel zewn.
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tx-tabs">
        {tabBtn('dashboard', <Activity size={14} />, 'Dashboard')}
        {tabBtn('players', <Users size={14} />, `Gracze (${txData.players.length})`)}
        {tabBtn('resources', <Package size={14} />, `Zasoby (${txData.resources.length})`)}
        {tabBtn('bans', <Ban size={14} />, `Bany (${txData.bans.length})`)}
        {tabBtn('scheduler', <Calendar size={14} />, 'Harmonogram')}
        {tabBtn('whitelist', <ShieldCheck size={14} />, 'Whitelist')}
        {tabBtn('console', <Terminal size={14} />, 'Konsola')}
      </div>

      {/* ── Dashboard ──────────────────────────────── */}
      {txTab === 'dashboard' && (
        <div className="tx-content">
          <div className="tx-stats-grid">
            {statCard(<Users size={20} />, 'Gracze online', `${txData.players.length}/${server.maxPlayers || 64}`, '#22c55e')}
            {statCard(<Package size={20} />, 'Zasoby', `${txData.resources.filter(r => r.status === 'started').length}/${txData.resources.length}`, '#3b82f6', `${txData.resources.filter(r => r.status === 'stopped').length} zatrzymanych`)}
            {statCard(<Ban size={20} />, 'Aktywne bany', txData.bans.length, '#ef4444')}
            {statCard(<Calendar size={20} />, 'Harmonogram', `${txData.schedules.filter(s => s.enabled).length} aktywnych`, '#f59e0b')}
          </div>

          {/* Quick actions */}
          <div className="tx-card" style={{ marginTop: 16 }}>
            <h3 className="tx-card__title"><Megaphone size={16} /> Szybkie akcje</h3>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 280 }}>
                <input className="dash-input" placeholder="Wyślij ogłoszenie do wszystkich graczy..."
                  value={announcement} onChange={e => setAnnouncement(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && announcement.trim()) { txSendAnnouncement(serverId, announcement.trim()); toast.success('Ogłoszenie wysłane'); setAnnouncement(''); } }}
                  style={{ flex: 1 }} />
                <button className="btn btn--primary btn--sm" disabled={!announcement.trim()}
                  onClick={() => { if (announcement.trim()) { txSendAnnouncement(serverId, announcement.trim()); toast.success('Ogłoszenie wysłane'); setAnnouncement(''); } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                  <Volume2 size={13} /> Wyślij
                </button>
              </div>
            </div>

            {txData.announcements.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <h4 style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Ostatnie ogłoszenia:</h4>
                <div style={{ display: 'grid', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                  {txData.announcements.slice(0, 5).map((a, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: 8, fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Megaphone size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Online players preview */}
          {txData.players.length > 0 && (
            <div className="tx-card" style={{ marginTop: 16 }}>
              <h3 className="tx-card__title"><Users size={16} /> Gracze online</h3>
              <div className="tx-players-mini">
                {txData.players.slice(0, 8).map(p => (
                  <div key={p.id} className="tx-player-mini">
                    <div className="tx-player-mini__avatar">{p.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                        <Wifi size={10} style={{ verticalAlign: -1 }} /> {p.ping}ms
                      </div>
                    </div>
                  </div>
                ))}
                {txData.players.length > 8 && (
                  <button className="tx-player-mini tx-player-mini--more" onClick={() => setTxTab('players')}>
                    +{txData.players.length - 8} więcej
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Players ──────────────────────────────── */}
      {txTab === 'players' && (
        <div className="tx-content">
          <div className="tx-toolbar">
            <div className="tx-search">
              <Search size={14} />
              <input placeholder="Szukaj gracza..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>

          </div>

          {filteredPlayers.length === 0 ? (
            <div className="tx-empty">
              <Users size={40} />
              <p>Brak graczy online</p>
            </div>
          ) : (
            <div className="tx-table-wrap">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Gracz</th>
                    <th>Ping</th>
                    <th>Dołączył</th>
                    <th>Identyfikator</th>
                    <th style={{ textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{p.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="tx-player-avatar">{p.name.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`tx-ping ${p.ping > 80 ? 'tx-ping--high' : p.ping > 50 ? 'tx-ping--med' : 'tx-ping--low'}`}>
                          {p.ping}ms
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {new Date(p.joinedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td>
                        <code style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                          {p.identifiers[0]?.substring(0, 25)}...
                        </code>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button className="tx-action-btn tx-action-btn--kick" title="Wyrzuć"
                            onClick={() => { setKickModal(p); setKickReason(''); }}>
                            <UserX size={13} />
                          </button>
                          <button className="tx-action-btn tx-action-btn--ban" title="Banuj"
                            onClick={() => { setBanModal({ player: p, show: true }); setBanReason(''); setBanDuration(''); }}>
                            <Ban size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Resources ──────────────────────────────── */}
      {txTab === 'resources' && (
        <div className="tx-content">
          <div className="tx-toolbar">
            <div className="tx-search">
              <Search size={14} />
              <input placeholder="Szukaj zasobu..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <span style={{ color: '#22c55e', fontWeight: 600 }}>{txData.resources.filter(r => r.status === 'started').length}</span> uruchomionych /
              <span style={{ color: '#ef4444', fontWeight: 600, marginLeft: 4 }}>{txData.resources.filter(r => r.status === 'stopped').length}</span> zatrzymanych
            </div>
          </div>

          <div className="tx-resources-grid">
            {filteredResources.map(r => (
              <div key={r.name} className={`tx-resource ${r.status === 'started' ? 'tx-resource--started' : 'tx-resource--stopped'}`}>
                <div className="tx-resource__info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className={`tx-resource__dot ${r.status === 'started' ? 'tx-resource__dot--green' : 'tx-resource__dot--red'}`} />
                    <div>
                      <div className="tx-resource__name">{r.name}</div>
                      {r.description && <div className="tx-resource__desc">{r.description}</div>}
                    </div>
                  </div>
                  {r.author && <span className="tx-resource__author">{r.author}</span>}
                </div>
                <div className="tx-resource__actions">
                  <button className={`tx-action-btn ${r.status === 'started' ? 'tx-action-btn--stop' : 'tx-action-btn--start'}`}
                    title={r.status === 'started' ? 'Zatrzymaj' : 'Uruchom'}
                    onClick={() => { txToggleResource(serverId, r.name); }}>
                    {r.status === 'started' ? <Square size={12} /> : <Play size={12} />}
                  </button>
                  <button className="tx-action-btn tx-action-btn--restart" title="Restart"
                    onClick={() => { txRestartResource(serverId, r.name); toast.success(`Zasób '${r.name}' restartowany`); }}>
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bans ──────────────────────────────── */}
      {txTab === 'bans' && (
        <div className="tx-content">
          <div className="tx-toolbar">
            <div className="tx-search">
              <Search size={14} />
              <input placeholder="Szukaj bana..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button className="btn btn--sm btn--primary" onClick={() => { setBanModal({ show: true }); setBanReason(''); setBanDuration(''); setBanName(''); setBanIdentifier(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={13} /> Dodaj bana
            </button>
          </div>

          {filteredBans.length === 0 ? (
            <div className="tx-empty">
              <Shield size={40} />
              <p>Brak aktywnych banów</p>
            </div>
          ) : (
            <div className="tx-table-wrap">
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Gracz</th>
                    <th>Powód</th>
                    <th>Zbanowany przez</th>
                    <th>Data</th>
                    <th>Wygasa</th>
                    <th style={{ textAlign: 'right' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBans.map(b => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.playerName}</div>
                        <code style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{b.identifier.substring(0, 25)}...</code>
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.reason}</td>
                      <td style={{ fontSize: '0.82rem' }}>{b.bannedBy}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{new Date(b.bannedAt).toLocaleDateString('pl-PL')}</td>
                      <td>
                        {b.expiresAt ? (
                          <span style={{ fontSize: '0.82rem', color: new Date(b.expiresAt) < new Date() ? '#22c55e' : '#f59e0b' }}>
                            {new Date(b.expiresAt).toLocaleDateString('pl-PL')}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.82rem', color: '#ef4444', fontWeight: 600 }}>Permanentny</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="tx-action-btn tx-action-btn--unban" title="Odbanuj"
                          onClick={() => { txUnbanPlayer(serverId, b.id); toast.success(`Gracz ${b.playerName} odbanowany`); }}>
                          <ShieldOff size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Scheduler ──────────────────────────────── */}
      {txTab === 'scheduler' && (
        <div className="tx-content">
          <div className="tx-card">
            <h3 className="tx-card__title"><Calendar size={16} /> Nowe zaplanowane zadanie</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'end' }}>
              <div>
                <label className="dash-label" style={{ fontSize: '0.78rem' }}>Godzina</label>
                <input type="time" className="dash-input" value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)} style={{ width: 120 }} />
              </div>
              <div>
                <label className="dash-label" style={{ fontSize: '0.78rem' }}>Akcja</label>
                <CustomSelect value={scheduleAction}
                  onChange={val => setScheduleAction(val as 'restart' | 'stop' | 'backup')}
                  options={[
                    { value: 'restart', label: 'Restart serwera' },
                    { value: 'stop', label: 'Zatrzymaj serwer' },
                    { value: 'backup', label: 'Backup' },
                  ]}
                />
              </div>
              <button className="btn btn--primary btn--sm" style={{ display: 'flex', alignItems: 'center', gap: 4, height: 38 }}
                onClick={() => {
                  if (scheduleDays.length === 0) { toast.error('Wybierz przynajmniej jeden dzień'); return; }
                  txAddSchedule(serverId, scheduleTime, scheduleDays, scheduleAction);
                  toast.success('Dodano zaplanowane zadanie');
                }}>
                <Plus size={13} /> Dodaj
              </button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                const labels: Record<string, string> = { mon: 'Pn', tue: 'Wt', wed: 'Śr', thu: 'Czw', fri: 'Pt', sat: 'Sb', sun: 'Nd' };
                const active = scheduleDays.includes(day);
                return (
                  <button key={day}
                    className={`tx-day-btn ${active ? 'tx-day-btn--active' : ''}`}
                    onClick={() => setScheduleDays(active ? scheduleDays.filter(d => d !== day) : [...scheduleDays, day])}>
                    {labels[day]}
                  </button>
                );
              })}
            </div>
          </div>

          {txData.schedules.length === 0 ? (
            <div className="tx-empty" style={{ marginTop: 16 }}>
              <Clock size={40} />
              <p>Brak zaplanowanych zadań</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {txData.schedules.map(s => {
                const actionLabels: Record<string, string> = { restart: 'Restart', stop: 'Stop', backup: 'Backup' };
                const dayLabels: Record<string, string> = { mon: 'Pn', tue: 'Wt', wed: 'Śr', thu: 'Czw', fri: 'Pt', sat: 'Sb', sun: 'Nd' };
                return (
                  <div key={s.id} className={`tx-schedule-item ${!s.enabled ? 'tx-schedule-item--disabled' : ''}`}>
                    <div className="tx-schedule-item__info">
                      <div className="tx-schedule-item__time">{s.time}</div>
                      <div className="tx-schedule-item__details">
                        <span className="tx-schedule-item__action">{actionLabels[s.action]}</span>
                        <span className="tx-schedule-item__days">
                          {s.days.map(d => dayLabels[d]).join(', ')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button
                        className="tx-toggle"
                        style={{ background: s.enabled ? 'var(--accent)' : 'var(--bg-tertiary)' }}
                        onClick={() => { txToggleSchedule(serverId, s.id); }}>
                        <span className="tx-toggle__dot" style={{ left: s.enabled ? 18 : 2 }} />
                      </button>
                      <button className="tx-action-btn tx-action-btn--delete"
                        onClick={() => { txRemoveSchedule(serverId, s.id); }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Whitelist ──────────────────────────────── */}
      {txTab === 'whitelist' && (
        <div className="tx-content">
          <div className="tx-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 className="tx-card__title" style={{ marginBottom: 0 }}>
                <ShieldCheck size={16} /> Whitelist
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {txData.whitelist ? 'Włączona' : 'Wyłączona'}
                </span>
                <button
                  className="tx-toggle"
                  style={{ background: txData.whitelist ? 'var(--accent)' : 'var(--bg-tertiary)' }}
                  onClick={() => { txToggleWhitelist(serverId); }}>
                  <span className="tx-toggle__dot" style={{ left: txData.whitelist ? 18 : 2 }} />
                </button>
              </div>
            </div>

            {txData.whitelist && (
              <>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input className="dash-input" placeholder="steam:xxx lub license:xxx..."
                    value={whitelistId} onChange={e => setWhitelistId(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && whitelistId.trim()) { txAddWhitelistId(serverId, whitelistId.trim()); setWhitelistId(''); } }}
                    style={{ flex: 1 }} />
                  <button className="btn btn--primary btn--sm" disabled={!whitelistId.trim()}
                    onClick={() => { txAddWhitelistId(serverId, whitelistId.trim()); setWhitelistId(''); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={13} /> Dodaj
                  </button>
                </div>

                {txData.whitelistIds.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', textAlign: 'center', padding: 20 }}>
                    Brak identyfikatorów na whiteliście
                  </p>
                ) : (
                  <div style={{ display: 'grid', gap: 6 }}>
                    {txData.whitelistIds.map((wId, i) => (
                      <div key={i} className="tx-whitelist-item">
                        <code style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>{wId}</code>
                        <button className="tx-action-btn tx-action-btn--delete"
                          onClick={() => { txRemoveWhitelistId(serverId, wId); }}>
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Console ──────────────────────────────── */}
      {txTab === 'console' && (
        <div className="tx-content">
          {real.backendOnline && (
            <div style={{ padding: '6px 12px', background: '#16a34a22', color: '#22c55e', fontSize: '0.75rem', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Prawdziwa konsola — FXServer + txAdmin
            </div>
          )}
          <div className="tx-console" ref={consoleRef}>
            {(real.backendOnline ? real.consoleLines : server.consoleLogs).map((log, i) => (
              <div key={i} className={`tx-console__line ${log.includes('[txAdmin]') ? 'tx-console__line--tx' : ''} ${log.includes('ERROR') || log.includes('error') ? 'tx-console__line--err' : ''}`}>
                {log}
              </div>
            ))}
          </div>
          <div className="tx-console-input">
            <span className="tx-console-input__prompt">&gt;</span>
            <input placeholder="Wpisz komendę..." value={consoleCmd}
              onChange={e => setConsoleCmd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConsoleCmd()} />
            <button className="btn btn--primary btn--sm" onClick={handleConsoleCmd}
              style={{ height: 32, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Play size={12} /> Wyślij
            </button>
          </div>
        </div>
      )}

      {/* ── Kick Modal ──────────────────────────────── */}
      {kickModal && (
        <div className="tx-modal-overlay" onClick={() => setKickModal(null)}>
          <div className="tx-modal" onClick={e => e.stopPropagation()}>
            <div className="tx-modal__header">
              <h3><UserX size={18} /> Wyrzuć gracza</h3>
              <button className="tx-modal__close" onClick={() => setKickModal(null)}><X size={18} /></button>
            </div>
            <div className="tx-modal__body">
              <p style={{ marginBottom: 12 }}>Gracz: <strong>{kickModal.name}</strong> (#{kickModal.id})</p>
              <label className="dash-label">Powód</label>
              <input className="dash-input" placeholder="Powód wyrzucenia..." value={kickReason}
                onChange={e => setKickReason(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleKick()} autoFocus />
            </div>
            <div className="tx-modal__footer">
              <button className="btn btn--ghost btn--sm" onClick={() => setKickModal(null)}>Anuluj</button>
              <button className="btn btn--sm" style={{ background: '#f59e0b', color: '#000', border: 'none' }} onClick={handleKick}>
                <UserX size={13} /> Wyrzuć
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Ban Modal ──────────────────────────────── */}
      {banModal.show && (
        <div className="tx-modal-overlay" onClick={() => setBanModal({ show: false })}>
          <div className="tx-modal" onClick={e => e.stopPropagation()}>
            <div className="tx-modal__header">
              <h3><Ban size={18} /> Banuj gracza</h3>
              <button className="tx-modal__close" onClick={() => setBanModal({ show: false })}><X size={18} /></button>
            </div>
            <div className="tx-modal__body">
              {banModal.player ? (
                <p style={{ marginBottom: 12 }}>Gracz: <strong>{banModal.player.name}</strong> (#{banModal.player.id})</p>
              ) : (
                <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="dash-label">Nazwa gracza</label>
                    <input className="dash-input" placeholder="Nazwa..." value={banName}
                      onChange={e => setBanName(e.target.value)} />
                  </div>
                  <div>
                    <label className="dash-label">Identyfikator (steam/license)</label>
                    <input className="dash-input" placeholder="steam:xxxxx..." value={banIdentifier}
                      onChange={e => setBanIdentifier(e.target.value)} />
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label className="dash-label">Powód bana</label>
                  <input className="dash-input" placeholder="Powód..." value={banReason}
                    onChange={e => setBanReason(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="dash-label">Czas trwania (puste = permanentny)</label>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {['1h', '6h', '1d', '3d', '7d', '30d'].map(dur => (
                      <button key={dur}
                        className={`tx-dur-btn ${banDuration === dur ? 'tx-dur-btn--active' : ''}`}
                        onClick={() => setBanDuration(banDuration === dur ? '' : dur)}>
                        {dur}
                      </button>
                    ))}
                    <input className="dash-input" placeholder="np. 2w, 3m" value={banDuration}
                      onChange={e => setBanDuration(e.target.value)}
                      style={{ width: 100, height: 32 }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="tx-modal__footer">
              <button className="btn btn--ghost btn--sm" onClick={() => setBanModal({ show: false })}>Anuluj</button>
              <button className="btn btn--sm" style={{ background: '#ef4444', color: '#fff', border: 'none' }} onClick={handleBan}>
                <Ban size={13} /> Banuj {banDuration ? `(${banDuration})` : '(Perm)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
