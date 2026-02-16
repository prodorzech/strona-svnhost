import { useState } from 'react';
import { useStoreState } from '../../store/useStore';
import { adminSetBalance, adminSetRole, adminDeleteUser, adminCreateUser, adminUpdateUser } from '../../store/store';
import { Users, Search, Edit2, Trash2, Shield, User, X, Save, Plus, UserPlus, Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

export function AdminUsers() {
  const store = useStoreState();
  const [search, setSearch] = useState('');
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState('');
  const [editRole, setEditRole] = useState<'user' | 'admin'>('user');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editSaved, setEditSaved] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Create user state
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newBalance, setNewBalance] = useState('0');

  const filtered = store.users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (u: typeof store.users[0]) => {
    setEditUserId(u.id);
    setEditBalance(u.balance.toString());
    setEditRole(u.role);
    setEditEmail(u.email);
    setEditUsername(u.username);
    setEditPassword('');
    setShowEditPassword(false);
    setEditSaved(false);
  };

  const saveEdit = () => {
    if (!editUserId) return;
    adminSetBalance(editUserId, parseFloat(editBalance) || 0);
    adminSetRole(editUserId, editRole);
    const updates: { email?: string; username?: string; password?: string } = {};
    const user = store.users.find(u => u.id === editUserId);
    if (user && editEmail.trim() && editEmail !== user.email) updates.email = editEmail.trim();
    if (user && editUsername.trim() && editUsername !== user.username) updates.username = editUsername.trim();
    if (editPassword.trim().length >= 6) updates.password = editPassword.trim();
    if (Object.keys(updates).length > 0) adminUpdateUser(editUserId, updates);
    setEditSaved(true);
    setTimeout(() => { setEditSaved(false); setEditUserId(null); }, 1200);
  };

  const handleDelete = (id: string) => {
    adminDeleteUser(id);
    setConfirmDeleteId(null);
  };

  const handleCreate = () => {
    if (!newEmail.trim() || !newUsername.trim() || !newPassword.trim()) return;
    adminCreateUser(newEmail.trim(), newUsername.trim(), newPassword, newRole, parseFloat(newBalance) || 0);
    setShowCreate(false);
    setNewEmail('');
    setNewUsername('');
    setNewPassword('');
    setNewRole('user');
    setNewBalance('0');
  };

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dash-page__title">Użytkownicy</h1>
          <p className="dash-page__subtitle">Zarządzaj kontami użytkowników ({store.users.length})</p>
        </div>
        <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
          onClick={() => setShowCreate(true)}>
          <UserPlus size={16} /> Nowy użytkownik
        </button>
      </div>

      {/* Search */}
      <div className="animate-fadeInUp anim-delay-1" style={{ position: 'relative', marginBottom: 16, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="dash-input" placeholder="Szukaj użytkownika..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 38 }} />
      </div>

      {/* Create user modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={18} /> Nowy użytkownik
              </h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} /> Email
                </label>
                <input className="dash-input" type="email" placeholder="user@example.com" value={newEmail}
                  onChange={e => setNewEmail(e.target.value)} />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={14} /> Nazwa użytkownika
                </label>
                <input className="dash-input" placeholder="np. jan_kowalski" value={newUsername}
                  onChange={e => setNewUsername(e.target.value)} />
              </div>
              <div>
                <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Lock size={14} /> Hasło
                </label>
                <input className="dash-input" type="password" placeholder="Min. 6 znaków" value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={14} /> Rola
                  </label>
                  <CustomSelect value={newRole} onChange={val => setNewRole(val as any)}
                    options={[
                      { value: 'user', label: 'Użytkownik' },
                      { value: 'admin', label: 'Administrator' },
                    ]}
                  />
                </div>
                <div>
                  <label className="dash-label">Saldo początkowe (zł)</label>
                  <input className="dash-input" type="number" value={newBalance}
                    onChange={e => setNewBalance(e.target.value)} />
                </div>
              </div>
              <button className="btn btn--primary" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={handleCreate} disabled={!newEmail.trim() || !newUsername.trim() || newPassword.length < 6}>
                <UserPlus size={16} /> Utwórz użytkownika
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editUserId && (() => {
        const u = store.users.find(u => u.id === editUserId);
        if (!u) return null;
        return (
          <div className="modal-overlay" onClick={() => setEditUserId(null)}>
            <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 500 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Edit2 size={18} /> Edytuj: {u.username}
                </h3>
                <button onClick={() => setEditUserId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: 'grid', gap: 14 }}>
                <div>
                  <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Mail size={14} /> Email
                  </label>
                  <input className="dash-input" type="email" value={editEmail}
                    onChange={e => setEditEmail(e.target.value)} />
                </div>
                <div>
                  <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <User size={14} /> Nazwa użytkownika
                  </label>
                  <input className="dash-input" value={editUsername}
                    onChange={e => setEditUsername(e.target.value)} />
                </div>
                <div>
                  <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Lock size={14} /> Nowe hasło
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input className="dash-input" type={showEditPassword ? 'text' : 'password'}
                      placeholder="Zostaw puste, aby nie zmieniać" value={editPassword}
                      onChange={e => setEditPassword(e.target.value)}
                      style={{ paddingRight: 40 }} />
                    <button onClick={() => setShowEditPassword(!showEditPassword)}
                      style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                      {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {editPassword.length > 0 && editPassword.length < 6 && (
                    <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>Hasło musi mieć minimum 6 znaków</p>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="dash-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Shield size={14} /> Rola
                    </label>
                    <CustomSelect value={editRole} onChange={val => setEditRole(val as any)}
                      options={[
                        { value: 'user', label: 'Użytkownik' },
                        { value: 'admin', label: 'Administrator' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="dash-label">Saldo (zł)</label>
                    <input className="dash-input" type="number" value={editBalance}
                      onChange={e => setEditBalance(e.target.value)} />
                  </div>
                </div>
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--bg-tertiary)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  ID: <code style={{ color: 'var(--accent)' }}>{u.id}</code> &bull; Zarejestrowany: {new Date(u.createdAt).toLocaleDateString('pl-PL')}
                  &bull; Serwery: {store.servers.filter(s => s.userId === u.id).length}
                </div>
                <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', justifyContent: 'center' }}
                  onClick={saveEdit} disabled={editPassword.length > 0 && editPassword.length < 6}>
                  {editSaved ? <><CheckCircle2 size={16} /> Zapisano!</> : <><Save size={16} /> Zapisz zmiany</>}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Table */}
      <div className="dash-card animate-fadeInUp anim-delay-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Użytkownik</th>
                <th>Email</th>
                <th>Rola</th>
                <th>Saldo</th>
                <th>Serwery</th>
                <th>Data rejestracji</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const serverCount = store.servers.filter(s => s.userId === u.id).length;
                return (
                  <tr key={u.id} className="animate-slideInUp" style={{ animationDelay: `${i * 0.04}s` }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: u.role === 'admin' ? 'var(--gradient-accent)' : 'var(--bg-tertiary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: u.role === 'admin' ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 700, fontSize: '0.75rem', flexShrink: 0,
                      }}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      {u.username}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700,
                        background: u.role === 'admin' ? 'rgba(239,68,68,0.1)' : 'var(--bg-tertiary)',
                        color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)',
                      }}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{u.balance.toFixed(2)} zł</td>
                    <td>{serverCount}</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString('pl-PL')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => startEdit(u)}
                          style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                          <Edit2 size={14} />
                        </button>
                        {confirmDeleteId === u.id ? (
                          <>
                            <button onClick={() => handleDelete(u.id)}
                              style={{ background: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              Tak
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Nie
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(u.id)}
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px', borderRadius: 'var(--radius-sm)', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
