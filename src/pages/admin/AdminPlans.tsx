import { useState } from 'react';
import { useStoreState } from '../../store/useStore';
import { addServicePlan, updateServicePlan, deleteServicePlan } from '../../store/store';
import type { ServerType, ServicePlan } from '../../store/types';
import {
  Package, Plus, Edit3, Trash2, X, Check, Star,
  Eye, EyeOff, Search,
} from 'lucide-react';
import { CustomSelect } from '../../components/CustomSelect';

export function AdminPlans() {
  const store = useStoreState();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const emptyForm = {
    type: 'fivem' as ServerType,
    name: '',
    price: '',
    period: 'monthly' as ServicePlan['period'],
    cpuCores: '4',
    ramMb: '8192',
    diskGb: '80',
    features: '',
    popular: false,
    active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const filtered = store.servicePlans.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  const typeColors: Record<string, string> = { vps: '#3b82f6', vds: '#8b5cf6', fivem: '#f97316', minecraft: '#22c55e', bot: '#8b5cf6' };
  const periodLabels: Record<string, string> = { monthly: 'Miesięcznie', quarterly: 'Kwartalnie', yearly: 'Rocznie' };

  const handleAdd = () => {
    if (!form.name.trim() || !form.price) return;
    addServicePlan({
      type: form.type,
      name: form.name.trim(),
      price: parseFloat(form.price),
      period: form.period,
      cpuCores: parseInt(form.cpuCores),
      ramMb: parseInt(form.ramMb),
      diskGb: parseInt(form.diskGb),
      features: form.features.split('\n').filter(f => f.trim()),
      popular: form.popular,
      active: form.active,
    });
    setShowAdd(false);
    setForm(emptyForm);
  };

  const startEdit = (plan: ServicePlan) => {
    setEditId(plan.id);
    setForm({
      type: plan.type,
      name: plan.name,
      price: plan.price.toString(),
      period: plan.period,
      cpuCores: plan.cpuCores.toString(),
      ramMb: plan.ramMb.toString(),
      diskGb: plan.diskGb.toString(),
      features: plan.features.join('\n'),
      popular: plan.popular || false,
      active: plan.active !== false,
    });
  };

  const handleEdit = () => {
    if (!editId || !form.name.trim() || !form.price) return;
    updateServicePlan(editId, {
      type: form.type,
      name: form.name.trim(),
      price: parseFloat(form.price),
      period: form.period,
      cpuCores: parseInt(form.cpuCores),
      ramMb: parseInt(form.ramMb),
      diskGb: parseInt(form.diskGb),
      features: form.features.split('\n').filter(f => f.trim()),
      popular: form.popular,
      active: form.active,
    });
    setEditId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    deleteServicePlan(id);
    setConfirmDeleteId(null);
  };

  const toggleActive = (id: string, current: boolean) => {
    updateServicePlan(id, { active: !current });
  };

  const PlanForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label className="dash-label">Typ serwera</label>
          <CustomSelect value={form.type} onChange={val => setForm({ ...form, type: val as ServerType })}
            options={[
              { value: 'fivem', label: 'FiveM' },
              { value: 'minecraft', label: 'Minecraft' },
              { value: 'vps', label: 'VPS' },
              { value: 'bot', label: 'Bot Discord' },
            ]}
          />
        </div>
        <div>
          <label className="dash-label">Okres rozliczeniowy</label>
          <CustomSelect value={form.period} onChange={val => setForm({ ...form, period: val as ServicePlan['period'] })}
            options={[
              { value: 'monthly', label: 'Miesięcznie' },
              { value: 'quarterly', label: 'Kwartalnie' },
              { value: 'yearly', label: 'Rocznie' },
            ]}
          />
        </div>
      </div>
      <div>
        <label className="dash-label">Nazwa planu</label>
        <input className="dash-input" placeholder="np. FiveM Starter" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <label className="dash-label">Cena (PLN)</label>
        <input className="dash-input" type="number" step="0.01" placeholder="np. 29.99" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <div>
          <label className="dash-label">CPU (rdzenie)</label>
          <input className="dash-input" type="number" value={form.cpuCores} onChange={e => setForm({ ...form, cpuCores: e.target.value })} />
        </div>
        <div>
          <label className="dash-label">RAM (MB)</label>
          <input className="dash-input" type="number" value={form.ramMb} onChange={e => setForm({ ...form, ramMb: e.target.value })} />
        </div>
        <div>
          <label className="dash-label">Dysk (GB)</label>
          <input className="dash-input" type="number" value={form.diskGb} onChange={e => setForm({ ...form, diskGb: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="dash-label">Funkcje (każda w nowej linii)</label>
        <textarea className="dash-input" rows={4} placeholder="np.&#10;4 rdzenie CPU&#10;8 GB RAM&#10;80 GB SSD NVMe" value={form.features}
          onChange={e => setForm({ ...form, features: e.target.value })}
          style={{ resize: 'vertical', minHeight: 80 }} />
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
          <input type="checkbox" checked={form.popular} onChange={e => setForm({ ...form, popular: e.target.checked })}
            style={{ accentColor: 'var(--accent)' }} />
          <Star size={14} style={{ color: '#eab308' }} /> Popularna oferta
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.85rem' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })}
            style={{ accentColor: 'var(--accent)' }} />
          <Eye size={14} /> Aktywna (widoczna w sklepie)
        </label>
      </div>
      <button className="btn btn--primary" onClick={onSubmit} style={{ padding: '12px', marginTop: 4 }}>
        {submitLabel}
      </button>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dash-page__title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package size={24} style={{ color: 'var(--accent)' }} /> Oferty / Plany
          </h1>
          <p className="dash-page__subtitle">Zarządzaj ofertami hostingowymi ({store.servicePlans.length} planów)</p>
        </div>
        <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
          onClick={() => { setShowAdd(true); setForm(emptyForm); }}>
          <Plus size={16} /> Dodaj ofertę
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 360, marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input className="dash-input" style={{ paddingLeft: 36 }} placeholder="Szukaj oferty..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Plans table */}
      <div className="dash-card" style={{ overflow: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
              {['Typ', 'Nazwa', 'Cena', 'CPU', 'RAM', 'Dysk', 'Okres', 'Status', 'Akcje'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(plan => (
              <tr key={plan.id} style={{ borderBottom: '1px solid var(--border-primary)', opacity: plan.active === false ? 0.5 : 1 }}>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
                    background: `${typeColors[plan.type]}18`, color: typeColors[plan.type],
                    textTransform: 'uppercase',
                  }}>{plan.type}</span>
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 600 }}>
                  {plan.name}
                  {plan.popular && <Star size={12} style={{ color: '#eab308', marginLeft: 6, verticalAlign: 'middle' }} fill="#eab308" />}
                </td>
                <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--accent)' }}>{plan.price.toFixed(2)} zł</td>
                <td style={{ padding: '10px 14px' }}>{plan.cpuCores}</td>
                <td style={{ padding: '10px 14px' }}>{(plan.ramMb / 1024).toFixed(0)} GB</td>
                <td style={{ padding: '10px 14px' }}>{plan.diskGb} GB</td>
                <td style={{ padding: '10px 14px' }}>{periodLabels[plan.period]}</td>
                <td style={{ padding: '10px 14px' }}>
                  <button onClick={() => toggleActive(plan.id, plan.active !== false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 6,
                      border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                      background: plan.active !== false ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                      color: plan.active !== false ? '#22c55e' : '#ef4444',
                    }}>
                    {plan.active !== false ? <><Eye size={12} /> Aktywna</> : <><EyeOff size={12} /> Ukryta</>}
                  </button>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => startEdit(plan)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                      <Edit3 size={15} />
                    </button>
                    {confirmDeleteId === plan.id ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button onClick={() => handleDelete(plan.id)}
                          style={{ background: '#ef444420', border: 'none', borderRadius: 6, color: '#ef4444', cursor: 'pointer', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>Usuń</button>
                        <button onClick={() => setConfirmDeleteId(null)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 6px', fontSize: '0.75rem' }}>Anuluj</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmDeleteId(plan.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-secondary)' }}>Brak ofert</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Dodaj nową ofertę</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <PlanForm onSubmit={handleAdd} submitLabel="Dodaj ofertę" />
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editId && (
        <div className="modal-overlay" onClick={() => { setEditId(null); setForm(emptyForm); }}>
          <div className="dash-card modal-card" style={{ width: '100%', maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700 }}>Edytuj ofertę</h3>
              <button onClick={() => { setEditId(null); setForm(emptyForm); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <PlanForm onSubmit={handleEdit} submitLabel="Zapisz zmiany" />
          </div>
        </div>
      )}
    </div>
  );
}
