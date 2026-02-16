import { useState } from 'react';
import { useStoreState } from '../../store/useStore';
import { createPromoCode, togglePromoCode, deletePromoCode } from '../../store/store';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, X, Copy, Check } from 'lucide-react';

export function AdminCodes() {
  const store = useStoreState();
  const [showAdd, setShowAdd] = useState(false);
  const [code, setCode] = useState('');
  const [amount, setAmount] = useState('50');
  const [maxUses, setMaxUses] = useState('100');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState('');

  const handleAdd = () => {
    if (!code.trim() || !amount || !maxUses) return;
    createPromoCode(code.trim(), parseFloat(amount), parseInt(maxUses));
    setCode('');
    setAmount('50');
    setMaxUses('100');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deletePromoCode(id);
    setConfirmDeleteId(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dash-page__title">Kody promocyjne</h1>
          <p className="dash-page__subtitle">Zarządzaj kodami ({store.promoCodes.length})</p>
        </div>
        <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
          onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Nowy kod
        </button>
      </div>

      {/* Add modal */}
      {showAdd && (
        <div className="modal-overlay"
          onClick={() => setShowAdd(false)}>
          <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 450 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Nowy kod promocyjny</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <label className="dash-label">Kod</label>
                <input className="dash-input" placeholder="np. WELCOME50" value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }} />
              </div>
              <div>
                <label className="dash-label">Kwota (zł)</label>
                <input className="dash-input" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="dash-label">Maks. użyć</label>
                <input className="dash-input" type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} />
              </div>
              <button className="btn btn--primary" style={{ padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={handleAdd} disabled={!code.trim()}>
                <Plus size={16} /> Utwórz kod
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {store.promoCodes.length === 0 ? (
        <div className="dash-card dash-empty animate-scaleIn">
          <Tag size={48} />
          <p>Brak kodów promocyjnych</p>
        </div>
      ) : (
        <div className="dash-card animate-fadeInUp anim-delay-1" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Kwota</th>
                  <th>Użycia</th>
                  <th>Status</th>
                  <th>Data utworzenia</th>
                  <th>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {store.promoCodes.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <code style={{
                          fontWeight: 700, letterSpacing: '0.05em', fontSize: '0.9rem',
                          padding: '3px 8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                        }}>
                          {p.code}
                        </code>
                        <button onClick={() => handleCopy(p.code)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>
                          {copied === p.code ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{p.amount.toFixed(2)} zł</td>
                    <td>{p.currentUses} / {p.maxUses}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700,
                        background: p.active ? 'rgba(34,197,94,0.1)' : 'rgba(161,161,170,0.1)',
                        color: p.active ? '#22c55e' : '#a1a1aa',
                      }}>
                        {p.active ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(p.createdAt).toLocaleDateString('pl-PL')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => togglePromoCode(p.id)}
                          style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px', borderRadius: 'var(--radius-sm)', color: p.active ? '#22c55e' : 'var(--text-tertiary)', cursor: 'pointer' }}
                          title={p.active ? 'Dezaktywuj' : 'Aktywuj'}>
                          {p.active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        </button>
                        {confirmDeleteId === p.id ? (
                          <>
                            <button onClick={() => handleDelete(p.id)}
                              style={{ background: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                              Tak
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)}
                              style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '4px 10px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                              Nie
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setConfirmDeleteId(p.id)}
                            style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px', borderRadius: 'var(--radius-sm)', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
