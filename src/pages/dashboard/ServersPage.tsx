import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import {
  Server, Plus, Play, Square, AlertTriangle, Loader, Download,
} from 'lucide-react';
import type { ServerStatus } from '../../store/types';

const statusLabels: Record<ServerStatus, string> = {
  running: 'Uruchomiony',
  stopped: 'Zatrzymany',
  starting: 'Uruchamianie…',
  stopping: 'Zatrzymywanie…',
  installing: 'Instalacja…',
  error: 'Błąd',
};

const statusIcon = (s: ServerStatus) => {
  switch (s) {
    case 'running': return <Play size={12} />;
    case 'stopped': return <Square size={12} />;
    case 'starting': case 'installing': return <Loader size={12} className="spin" />;
    case 'stopping': return <Download size={12} />;
    case 'error': return <AlertTriangle size={12} />;
  }
};

const typeColors: Record<string, string> = {
  vps: '#3b82f6',
  vds: '#8b5cf6',
  fivem: '#f97316',
  minecraft: '#22c55e',
};

export function ServersPage() {
  const navigate = useNavigate();
  const store = useStoreState();
  const user = getCurrentUser();
  if (!user) return null;

  const myServers = store.servers.filter(s => s.userId === user.id);

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dash-page__title">Serwery</h1>
          <p className="dash-page__subtitle">Zarządzaj swoimi serwerami</p>
        </div>
        <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
          onClick={() => navigate('/dashboard/shop')}>
          <Plus size={16} /> Kup serwer
        </button>
      </div>

      {myServers.length === 0 ? (
        <div className="dash-card dash-empty animate-scaleIn">
          <Server size={48} />
          <p>Nie masz jeszcze żadnych serwerów</p>
          <button className="btn btn--primary" onClick={() => navigate('/dashboard/shop')}>
            Kup pierwszy serwer
          </button>
        </div>
      ) : (
        <div className="dash-grid dash-grid--2">
          {myServers.map((server, idx) => (
            <div
              key={server.id}
              className={`dash-card animate-slideInUp anim-delay-${Math.min(idx + 1, 8)}`}
              style={{ cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
              onClick={() => navigate(`/dashboard/servers/${server.id}`)}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-primary)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{server.name}</h3>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                    background: typeColors[server.type] || 'var(--accent)',
                  }}>
                    {server.type.toUpperCase()}
                  </span>
                </div>
                <span className={`status-badge status-badge--${server.status}`}>
                  <span className="status-dot" />
                  {statusLabels[server.status]}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                <div>IP: <span style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{server.ip}:{server.port}</span></div>
                <div>Plan: <span style={{ color: 'var(--text-primary)' }}>{server.plan}</span></div>
                <div>CPU: <span style={{ color: 'var(--text-primary)' }}>{server.cpuCores} vCore</span></div>
                <div>RAM: <span style={{ color: 'var(--text-primary)' }}>{(server.ramMb / 1024).toFixed(0)} GB</span></div>
                <div>Dysk: <span style={{ color: 'var(--text-primary)' }}>{server.diskGb} GB</span></div>
                {server.maxPlayers != null && (
                  <div>Gracze: <span style={{ color: 'var(--text-primary)' }}>{server.currentPlayers}/{server.maxPlayers}</span></div>
                )}
              </div>

              {server.status === 'running' && (
                <div style={{ marginTop: 12, display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>CPU {server.cpuUsage.toFixed(0)}%</div>
                    <div className="progress-bar">
                      <div className={`progress-bar__fill progress-bar__fill--${server.cpuUsage > 80 ? 'red' : server.cpuUsage > 50 ? 'yellow' : 'green'}`}
                        style={{ width: `${server.cpuUsage}%` }} />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>RAM {server.ramUsage.toFixed(0)}%</div>
                    <div className="progress-bar">
                      <div className={`progress-bar__fill progress-bar__fill--${server.ramUsage > 80 ? 'red' : server.ramUsage > 50 ? 'yellow' : 'green'}`}
                        style={{ width: `${server.ramUsage}%` }} />
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 12, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Wygasa: {new Date(server.expiresAt).toLocaleDateString('pl-PL')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
