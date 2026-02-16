import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, simulateStats } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import {
  Server, Wallet, Activity, ArrowUpRight, ArrowDownRight, Clock, Users,
} from 'lucide-react';

export function DashboardHome() {
  const navigate = useNavigate();
  const store = useStoreState();
  const user = getCurrentUser();

  useEffect(() => {
    const iv = setInterval(simulateStats, 5000);
    return () => clearInterval(iv);
  }, []);

  if (!user) return null;

  const myServers = store.servers.filter(s => s.userId === user.id);
  const runningServers = myServers.filter(s => s.status === 'running');
  const myTransactions = store.transactions.filter(t => t.userId === user.id).slice(-10).reverse();
  const myTickets = store.tickets.filter(t => t.userId === user.id);
  const openTickets = myTickets.filter(t => t.status !== 'closed');



  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title">Dashboard</h1>
        <p className="dash-page__subtitle">Witaj, {user.username}! Oto przegląd Twojego konta.</p>
      </div>

      {/* Stats cards */}
      <div className="dash-grid dash-grid--3" style={{ marginBottom: 24 }}>
        <div className="dash-card animate-slideInUp anim-delay-1" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/servers')}>
          <div className="dash-card__title">Serwery</div>
          <div className="dash-card__value">
            {myServers.length}
            <span style={{ fontSize: '0.85rem', color: '#22c55e', marginLeft: 8 }}>
              {runningServers.length} aktywnych
            </span>
          </div>
        </div>
        <div className="dash-card animate-slideInUp anim-delay-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/wallet')}>
          <div className="dash-card__title">Portfel</div>
          <div className="dash-card__value dash-card__value--accent">{user.balance.toFixed(2)} zł</div>
        </div>
        <div className="dash-card animate-slideInUp anim-delay-3" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard/tickets')}>
          <div className="dash-card__title">Tickety</div>
          <div className="dash-card__value">{openTickets.length} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>otwartych</span></div>
        </div>
      </div>

      {/* Server monitoring */}
      {runningServers.length > 0 && (
        <div className="dash-card animate-fadeInUp anim-delay-5" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} className="text-accent" /> Aktywne serwery
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Nazwa</th>
                  <th>Typ</th>
                  <th>CPU</th>
                  <th>RAM</th>
                  <th>Sieć</th>
                  {runningServers.some(s => s.maxPlayers) && <th>Gracze</th>}
                </tr>
              </thead>
              <tbody>
                {runningServers.map(s => (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/dashboard/servers/${s.id}`)}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                    <td><span className="status-badge status-badge--running"><span className="status-dot" />{s.type.toUpperCase()}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className={`progress-bar__fill progress-bar__fill--${s.cpuUsage > 80 ? 'red' : s.cpuUsage > 50 ? 'yellow' : 'green'}`}
                            style={{ width: `${s.cpuUsage}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{s.cpuUsage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div className={`progress-bar__fill progress-bar__fill--${s.ramUsage > 80 ? 'red' : s.ramUsage > 50 ? 'yellow' : 'green'}`}
                            style={{ width: `${s.ramUsage}%` }} />
                        </div>
                        <span style={{ fontSize: '0.8rem' }}>{s.ramUsage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>↓{s.networkIn.toFixed(0)} ↑{s.networkOut.toFixed(0)} MB/s</td>
                    {runningServers.some(sr => sr.maxPlayers) && (
                      <td>{s.maxPlayers ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Users size={14} /> {s.currentPlayers}/{s.maxPlayers}
                        </span>
                      ) : '—'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="dash-card animate-fadeInUp anim-delay-6">
        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} /> Ostatnie transakcje
        </h3>
        {myTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>Brak transakcji</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr><th>Opis</th><th>Kwota</th><th>Saldo po</th><th>Data</th></tr>
              </thead>
              <tbody>
                {myTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-primary)' }}>{tx.description}</td>
                    <td>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
                        color: tx.amount >= 0 ? '#22c55e' : '#ef4444',
                      }}>
                        {tx.amount >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} zł
                      </span>
                    </td>
                    <td>{tx.balanceAfter.toFixed(2)} zł</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(tx.createdAt).toLocaleString('pl-PL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
