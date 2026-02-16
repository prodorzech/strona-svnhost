import { useState } from 'react';
import { useStoreState } from '../../store/useStore';
import { adminAddServer, deleteServer } from '../../store/store';
import type { ServerType } from '../../store/types';
import { Server, Plus, Trash2, Search, X } from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

export function AdminServers() {
  const store = useStoreState();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addUserId, setAddUserId] = useState('');
  const [addType, setAddType] = useState<ServerType>('vps');
  const [addName, setAddName] = useState('');
  const [addCpu, setAddCpu] = useState('4');
  const [addRam, setAddRam] = useState('8192');
  const [addDisk, setAddDisk] = useState('80');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filtered = store.servers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ip.includes(search) ||
    s.type.includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!addUserId || !addName.trim()) return;
    adminAddServer(addUserId, addType, addName.trim(), parseInt(addCpu), parseInt(addRam), parseInt(addDisk));
    setShowAdd(false);
    setAddName('');
  };

  const handleDelete = (id: string) => {
    deleteServer(id);
    setConfirmDeleteId(null);
  };

  const typeColors: Record<string, string> = { vps: '#3b82f6', vds: '#8b5cf6', fivem: '#f97316', minecraft: '#22c55e', bot: '#8b5cf6' };

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dash-page__title">Serwery</h1>
          <p className="dash-page__subtitle">Zarządzaj wszystkimi serwerami ({store.servers.length})</p>
        </div>
        <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
          onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Dodaj serwer
        </button>
      </div>

      {/* Add server modal */}
      {showAdd && (
        <div className="modal-overlay"
          onClick={() => setShowAdd(false)}>
          <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Dodaj serwer użytkownikowi</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label className="dash-label">Użytkownik</label>
                <CustomSelect value={addUserId} onChange={val => setAddUserId(val)}
                  placeholder="Wybierz użytkownika..."
                  options={store.users.map(u => ({ value: u.id, label: `${u.username} (${u.email})` }))}
                />
              </div>
              <div>
                <label className="dash-label">Typ serwera</label>
                <CustomSelect value={addType} onChange={val => setAddType(val as ServerType)}
                  options={[
                    { value: 'vps', label: 'VPS' },
                    { value: 'fivem', label: 'FiveM' },
                    { value: 'minecraft', label: 'Minecraft' },
                    { value: 'bot', label: 'Bot Discord' },
                  ]}
                />
              </div>
              <div>
                <label className="dash-label">Nazwa serwera</label>
                <input className="dash-input" placeholder="np. VPS-Custom-01" value={addName}
                  onChange={e => setAddName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div>
                  <label className="dash-label">CPU (vCore)</label>
                  <input className="dash-input" type="number" value={addCpu} onChange={e => setAddCpu(e.target.value)} />
                </div>
                <div>
                  <label className="dash-label">RAM (MB)</label>
                  <input className="dash-input" type="number" value={addRam} onChange={e => setAddRam(e.target.value)} />
                </div>
                <div>
                  <label className="dash-label">Dysk (GB)</label>
                  <input className="dash-input" type="number" value={addDisk} onChange={e => setAddDisk(e.target.value)} />
                </div>
              </div>
              <button className="btn btn--primary" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={handleAdd} disabled={!addUserId || !addName.trim()}>
                <Plus size={16} /> Dodaj serwer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="animate-fadeInUp anim-delay-1" style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="dash-input" placeholder="Szukaj serwera..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="dash-card dash-empty animate-scaleIn">
          <Server size={48} />
          <p>Brak serwerów</p>
        </div>
      ) : (
        <div className="dash-card animate-fadeInUp anim-delay-2" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Serwer</th>
                  <th>Typ</th>
                  <th>Właściciel</th>
                  <th>IP</th>
                  <th>Status</th>
                  <th>Zasoby</th>
                  <th>Wygasa</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const owner = store.users.find(u => u.id === s.userId);
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: 'var(--radius-full)',
                          fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                          background: typeColors[s.type],
                        }}>
                          {s.type.toUpperCase()}
                        </span>
                      </td>
                      <td>{owner?.username || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{s.ip}:{s.port}</td>
                      <td>
                        <span className={`status-badge status-badge--${s.status}`}>
                          <span className="status-dot" />{s.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>
                        {s.cpuCores}C / {(s.ramMb / 1024).toFixed(0)}G / {s.diskGb}G
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(s.expiresAt).toLocaleDateString('pl-PL')}</td>
                      <td>
                        {confirmDeleteId === s.id ? (
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handleDelete(s.id)}
                              style={{ background: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              Tak
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '4px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Nie
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(s.id)}
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px', borderRadius: 'var(--radius-sm)', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
