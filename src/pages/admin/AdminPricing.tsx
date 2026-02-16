import { useState } from 'react';
import { useStoreState } from '../../store/useStore';
import { updateCustomConfig } from '../../store/store';
import { toast } from '../../components/Toast';
import type { ServerType, CustomConfigLimits } from '../../store/types';
import {
  DollarSign, Cpu, MemoryStick, HardDrive, Save,
  Server, Gamepad2, Bot, Monitor, ToggleLeft, ToggleRight,
} from 'lucide-react';

const typeInfo: Record<ServerType, { label: string; icon: typeof Server; color: string }> = {
  vps: { label: 'VPS', icon: Monitor, color: '#3b82f6' },
  vds: { label: 'VDS', icon: Server, color: '#06b6d4' },
  fivem: { label: 'FiveM', icon: Gamepad2, color: '#f97316' },
  minecraft: { label: 'Minecraft', icon: Gamepad2, color: '#22c55e' },
  bot: { label: 'Bot Discord', icon: Bot, color: '#8b5cf6' },
};

const serverTypes: ServerType[] = ['vps', 'vds', 'fivem', 'minecraft', 'bot'];

function NumberInput({ label, value, onChange, suffix, min, max, step = 1, color }: {
  label: string; value: number; onChange: (v: number) => void;
  suffix?: string; min?: number; max?: number; step?: number; color?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '0.88rem',
            fontWeight: 700,
            color: color || 'var(--text-primary)',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
        />
        {suffix && <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', fontWeight: 600 }}>{suffix}</span>}
      </div>
    </div>
  );
}

function TypeConfigCard({ type, config }: { type: ServerType; config: CustomConfigLimits }) {
  const info = typeInfo[type];
  const Icon = info.icon;
  const [local, setLocal] = useState<CustomConfigLimits>({ ...config });
  const [dirty, setDirty] = useState(false);

  const update = (field: keyof CustomConfigLimits, value: number | boolean) => {
    setLocal(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    // Validate
    if (local.minCpu > local.maxCpu) { toast.error('Błąd', 'Min CPU > Max CPU'); return; }
    if (local.minRamGb > local.maxRamGb) { toast.error('Błąd', 'Min RAM > Max RAM'); return; }
    if (local.minDiskGb > local.maxDiskGb) { toast.error('Błąd', 'Min Dysk > Max Dysk'); return; }
    if (local.pricePerCore <= 0 || local.pricePerGbRam <= 0 || local.pricePerGbDisk <= 0) {
      toast.error('Błąd', 'Ceny muszą być większe od 0'); return;
    }
    updateCustomConfig(type, local);
    setDirty(false);
    toast.success('Zapisano', `Konfiguracja ${info.label} zaktualizowana`);
  };

  return (
    <div className="dash-card" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--radius-md)',
            background: info.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} style={{ color: info.color }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>{info.label}</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Własny pakiet</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Toggle enabled */}
          <button
            onClick={() => update('enabled', !local.enabled)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: local.enabled ? '#22c55e' : 'var(--text-tertiary)',
              fontSize: '0.82rem', fontWeight: 600,
            }}
          >
            {local.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            {local.enabled ? 'Aktywny' : 'Wyłączony'}
          </button>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <DollarSign size={16} style={{ color: '#eab308' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cennik (miesięcznie)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <NumberInput label="Cena za 1 vCPU" value={local.pricePerCore} onChange={v => update('pricePerCore', v)}
            suffix="zł" min={0.01} step={0.5} color={info.color} />
          <NumberInput label="Cena za 1 GB RAM" value={local.pricePerGbRam} onChange={v => update('pricePerGbRam', v)}
            suffix="zł" min={0.01} step={0.5} color={info.color} />
          <NumberInput label="Cena za 1 GB Dysk" value={local.pricePerGbDisk} onChange={v => update('pricePerGbDisk', v)}
            suffix="zł" min={0.01} step={0.1} color={info.color} />
        </div>
      </div>

      {/* CPU Limits */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <Cpu size={16} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Procesor (vCPU)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <NumberInput label="Minimum" value={local.minCpu} onChange={v => update('minCpu', v)} suffix="vCPU" min={1} />
          <NumberInput label="Maksimum" value={local.maxCpu} onChange={v => update('maxCpu', v)} suffix="vCPU" min={1} />
        </div>
      </div>

      {/* RAM Limits */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <MemoryStick size={16} style={{ color: '#8b5cf6' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pamięć RAM</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <NumberInput label="Minimum" value={local.minRamGb} onChange={v => update('minRamGb', v)} suffix="GB" min={1} />
          <NumberInput label="Maksimum" value={local.maxRamGb} onChange={v => update('maxRamGb', v)} suffix="GB" min={1} />
        </div>
      </div>

      {/* Disk Limits */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <HardDrive size={16} style={{ color: '#f97316' }} />
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dysk SSD</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <NumberInput label="Minimum" value={local.minDiskGb} onChange={v => update('minDiskGb', v)} suffix="GB" min={1} />
          <NumberInput label="Maksimum" value={local.maxDiskGb} onChange={v => update('maxDiskGb', v)} suffix="GB" min={1} />
          <NumberInput label="Krok slidera" value={local.diskStep} onChange={v => update('diskStep', v)} suffix="GB" min={1} />
        </div>
      </div>

      {/* Price preview */}
      <div style={{
        padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-primary)', marginBottom: 16,
      }}>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600 }}>
          Podgląd ceny — przykład ({local.minCpu} vCPU, {local.minRamGb} GB RAM, {local.minDiskGb} GB Dysk)
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: info.color }}>
          {(local.minCpu * local.pricePerCore + local.minRamGb * local.pricePerGbRam + local.minDiskGb * local.pricePerGbDisk).toFixed(2)} zł
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-tertiary)' }}> / mies.</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
          Max: {(local.maxCpu * local.pricePerCore + local.maxRamGb * local.pricePerGbRam + local.maxDiskGb * local.pricePerGbDisk).toFixed(2)} zł / mies.
        </div>
      </div>

      {/* Save */}
      <button
        className={`btn ${dirty ? 'btn--primary' : 'btn--outline'}`}
        onClick={handleSave}
        disabled={!dirty}
        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', width: '100%', justifyContent: 'center' }}
      >
        <Save size={14} /> {dirty ? 'Zapisz zmiany' : 'Brak zmian'}
      </button>
    </div>
  );
}

export function AdminPricing() {
  const store = useStoreState();
  const config = store.customConfig;

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 24 }}>
        <h1 className="dash-page__title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <DollarSign size={24} style={{ color: '#eab308' }} />
          Cennik własnych pakietów
        </h1>
        <p className="dash-page__subtitle">
          Ustaw ceny za jednostkę, limity minimalne i maksymalne dla konfiguratora własnych pakietów.
          Te ustawienia dotyczą sekcji „Własny pakiet" w sklepie.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 20 }}>
        {serverTypes.map(type => (
          <TypeConfigCard key={type} type={type} config={config[type]} />
        ))}
      </div>
    </div>
  );
}
