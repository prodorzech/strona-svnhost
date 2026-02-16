import { useStoreState } from '../../store/useStore';
import {
  Users, Server, CreditCard, Tag, Activity,
  TrendingUp, ArrowUpRight, ArrowDownRight, MessageSquare,
} from 'lucide-react';

export function AdminDashboard() {
  const store = useStoreState();

  const totalBalance = store.users.reduce((a, u) => a + u.balance, 0);
  const runningServers = store.servers.filter(s => s.status === 'running').length;
  const totalRevenue = store.transactions.filter(t => t.type === 'purchase').reduce((a, t) => a + Math.abs(t.amount), 0);
  const totalTopUps = store.transactions.filter(t => t.type === 'topup').reduce((a, t) => a + t.amount, 0);
  const openTickets = store.tickets.filter(t => t.status !== 'closed').length;

  const recentTx = store.transactions.slice(-10).reverse();
  const recentUsers = store.users.slice(-5).reverse();

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title">Panel Administratora</h1>
        <p className="dash-page__subtitle">Przegląd systemu SVNHost</p>
      </div>

      {/* Stats */}
      <div className="dash-grid dash-grid--3" style={{ marginBottom: 24 }}>
        <div className="dash-card animate-slideInUp anim-delay-1">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <div className="dash-card__title" style={{ margin: 0 }}>Użytkownicy</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{store.users.length}</div>
            </div>
          </div>
        </div>
        <div className="dash-card animate-slideInUp anim-delay-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <div className="dash-card__title" style={{ margin: 0 }}>Serwery</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{store.servers.length}
                <span style={{ fontSize: '0.78rem', color: '#22c55e', marginLeft: 6 }}>{runningServers} aktywnych</span>
              </div>
            </div>
          </div>
        </div>
        <div className="dash-card animate-slideInUp anim-delay-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={20} style={{ color: '#a855f7' }} />
            </div>
            <div>
              <div className="dash-card__title" style={{ margin: 0 }}>Tickety</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{store.tickets.length}
                {openTickets > 0 && <span style={{ fontSize: '0.78rem', color: '#eab308', marginLeft: 6 }}>{openTickets} otwartych</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="dash-card animate-slideInUp anim-delay-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
              <div className="dash-card__title" style={{ margin: 0 }}>Przychód</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>{totalRevenue.toFixed(2)} zł</div>
            </div>
          </div>
        </div>
        <div className="dash-card animate-slideInUp anim-delay-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(234,179,8,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} style={{ color: '#eab308' }} />
            </div>
            <div>
              <div className="dash-card__title" style={{ margin: 0 }}>Salda użytkowników</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalBalance.toFixed(2)} zł</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Recent transactions */}
        <div className="dash-card animate-fadeInUp anim-delay-5">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} /> Ostatnie transakcje
          </h3>
          {recentTx.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>Brak transakcji</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="dash-table">
                <thead>
                  <tr><th>Użytkownik</th><th>Opis</th><th>Kwota</th><th>Data</th></tr>
                </thead>
                <tbody>
                  {recentTx.map(tx => {
                    const txUser = store.users.find(u => u.id === tx.userId);
                    return (
                      <tr key={tx.id}>
                        <td style={{ fontWeight: 600 }}>{txUser?.username || '—'}</td>
                        <td>{tx.description}</td>
                        <td>
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
                            color: tx.amount >= 0 ? '#22c55e' : '#ef4444',
                          }}>
                            {tx.amount >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} zł
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{new Date(tx.createdAt).toLocaleString('pl-PL')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent users */}
        <div className="dash-card animate-fadeInUp anim-delay-6">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} /> Nowi użytkownicy
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentUsers.map(u => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: u.role === 'admin' ? 'var(--gradient-accent)' : 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: u.role === 'admin' ? '#fff' : 'var(--text-secondary)',
                  fontWeight: 700, fontSize: '0.85rem',
                }}>
                  {u.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{u.username}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{u.email}</div>
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: u.role === 'admin' ? 'rgba(239,68,68,0.1)' : 'var(--bg-secondary)',
                  color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-tertiary)',
                }}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
