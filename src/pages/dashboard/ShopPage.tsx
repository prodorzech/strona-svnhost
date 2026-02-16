import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, purchaseServer, purchaseCustomServer } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { toast } from '../../components/Toast';
import type { ServerType, ServicePlan } from '../../store/types';
import { osOptions } from '../../components/OsIcons';
import {
  ShoppingCart, Server, Gamepad2, Monitor, HardDrive, Bot,
  Check, Cpu, MemoryStick, Zap, Star, SlidersHorizontal, ArrowLeft, Plus, Minus,
} from 'lucide-react';

const NodeJsIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 256 289" width={size} height={size} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <path d="M128 288.464c-3.975 0-7.685-1.06-11.13-2.915l-35.247-20.936c-5.3-2.915-2.65-3.975-1.06-4.505 7.155-2.385 8.48-2.915 15.9-7.155.795-.53 1.855-.265 2.65.265l27.032 16.166c1.06.53 2.385.53 3.18 0l105.74-61.217c1.06-.53 1.59-1.59 1.59-2.915V83.086c0-1.325-.53-2.385-1.59-2.915L129.06 19.172c-1.06-.53-2.385-.53-3.18 0L20.14 80.17c-1.06.53-1.59 1.855-1.59 2.915v122.17c0 1.06.53 2.385 1.59 2.915l28.887 16.695c15.635 7.95 25.44-1.325 25.44-10.6V93.42c0-1.59 1.325-3.18 3.18-3.18h13.516c1.59 0 3.18 1.325 3.18 3.18v120.58c0 20.936-11.396 33.126-31.272 33.126-6.095 0-10.865 0-24.38-6.625l-27.827-15.9C4.24 220.865 0 213.71 0 205.76V83.086c0-7.95 4.24-15.37 11.13-19.345L116.87 2.524c6.625-3.71 15.635-3.71 22.26 0L244.87 63.74c6.89 3.975 11.13 11.13 11.13 19.345v122.17c0 7.95-4.24 15.37-11.13 19.345L139.13 285.55c-3.445 1.855-7.42 2.915-11.13 2.915z" fill="#539E43"/>
    <path d="M159.903 204.108c-45.848 0-55.508-21.2-55.508-38.955 0-1.59 1.325-3.18 3.18-3.18h13.78c1.59 0 2.916 1.06 2.916 2.65 2.12 14.045 8.215 20.936 36.307 20.936 22.26 0 31.802-5.035 31.802-16.96 0-6.89-2.65-11.925-37.367-15.37-28.887-2.915-46.908-9.275-46.908-32.33 0-21.467 18.02-34.187 48.232-34.187 33.92 0 50.615 11.66 52.735 37.102 0 .795-.265 1.59-.795 2.385-.53.53-1.325 1.06-2.12 1.06h-13.78c-1.325 0-2.65-1.06-2.916-2.385-3.18-14.575-11.395-19.345-33.126-19.345-24.38 0-27.296 8.48-27.296 14.84 0 7.685 3.445 10.07 36.307 14.31 32.596 4.24 47.967 10.335 47.967 33.126-.265 23.322-19.345 36.572-53.002 36.572z" fill="#539E43"/>
  </svg>
);

const PythonIcon = ({ size = 24 }: { size?: number }) => (
  <svg viewBox="0 0 256 255" width={size} height={size} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
    <defs>
      <linearGradient x1="12.959%" y1="12.039%" x2="79.639%" y2="78.201%" id="py-a">
        <stop stopColor="#387EB8" offset="0%"/>
        <stop stopColor="#366994" offset="100%"/>
      </linearGradient>
      <linearGradient x1="19.128%" y1="20.579%" x2="90.742%" y2="88.429%" id="py-b">
        <stop stopColor="#FFC836" offset="0%"/>
        <stop stopColor="#FFD43B" offset="100%"/>
      </linearGradient>
    </defs>
    <path d="M126.916.072c-64.832 0-60.784 28.115-60.784 28.115l.072 29.128h61.868v8.745H41.631S.145 61.355.145 126.77c0 65.417 36.21 63.097 36.21 63.097h21.61v-30.356s-1.165-36.21 35.632-36.21h61.362s34.475.557 34.475-33.319V33.97S194.67.072 126.916.072zM92.802 19.66a11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13 11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.13z" fill="url(#py-a)"/>
    <path d="M128.757 254.126c64.832 0 60.784-28.115 60.784-28.115l-.072-29.127H127.6v-8.745h86.441s41.486 4.705 41.486-60.712c0-65.416-36.21-63.096-36.21-63.096h-21.61v30.355s1.165 36.21-35.632 36.21h-61.362s-34.475-.557-34.475 33.32v56.013s-5.235 33.897 62.518 33.897zm34.114-19.586a11.12 11.12 0 0 1-11.13-11.13 11.12 11.12 0 0 1 11.13-11.131 11.12 11.12 0 0 1 11.13 11.13 11.12 11.12 0 0 1-11.13 11.13z" fill="url(#py-b)"/>
  </svg>
);

const typeInfo: Record<string, { label: string; icon: typeof Server; color: string; desc: string }> = {
  vps: { label: 'VPS', icon: Monitor, color: '#3b82f6', desc: 'Wirtualne serwery prywatne z pełnym dostępem SSH' },
  fivem: { label: 'FiveM', icon: Gamepad2, color: '#f97316', desc: 'Serwery GTA V FiveM z ochroną anty-DDoS' },
  minecraft: { label: 'Minecraft', icon: Gamepad2, color: '#22c55e', desc: 'Serwery Minecraft z auto-instalacją modów' },
  bot: { label: 'Bot Discord', icon: Bot, color: '#8b5cf6', desc: 'Hosting botów Discord — Node.js lub Python' },
};

const allShopTypes = ['vps', 'fivem', 'minecraft', 'bot'] as const;



export function ShopPage() {
  const navigate = useNavigate();
  const store = useStoreState();
  const user = getCurrentUser();

  const disabledOffers = store.adminSettings.disabledOffers || [];
  const shopTypes = allShopTypes.filter(t => !disabledOffers.includes(t));
  const defaultType = shopTypes[0] || 'vps';

  const [selectedType, setSelectedType] = useState<ServerType>(defaultType);
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [selectedOs, setSelectedOs] = useState('Ubuntu 22.04 LTS');
  const [selectedBotRuntime, setSelectedBotRuntime] = useState<'nodejs' | 'python'>('nodejs');
  const [serverName, setServerName] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  // Reset selected type if it gets disabled
  if (!shopTypes.includes(selectedType as any) && shopTypes.length > 0) {
    setSelectedType(shopTypes[0] as ServerType);
  }

  // Custom configurator state
  const [showCustom, setShowCustom] = useState(false);
  const [customCpu, setCustomCpu] = useState(2);
  const [customRam, setCustomRam] = useState(4);
  const [customDisk, setCustomDisk] = useState(40);
  const [customName, setCustomName] = useState('');

  if (!user) return null;

  const cfg = store.customConfig[selectedType];
  const calcCustomPrice = (cores: number, ramGb: number, diskGb: number) =>
    Math.round((cores * cfg.pricePerCore + ramGb * cfg.pricePerGbRam + diskGb * cfg.pricePerGbDisk) * 100) / 100;

  const plans = store.servicePlans.filter(p => p.type === selectedType);
  const isVpsType = selectedType === 'vps' || selectedType === 'vds';
  const isBotType = selectedType === 'bot';
  const customPrice = calcCustomPrice(customCpu, customRam, customDisk);

  const handlePurchase = () => {
    if (!selectedPlan || !serverName.trim()) {
      toast.error('Brak nazwy', 'Podaj nazwę serwera');
      return;
    }
    setPurchasing(true);
    const result = purchaseServer(user.id, selectedPlan.id, serverName.trim(),
      isBotType ? { botRuntime: selectedBotRuntime } : undefined);
    if (result.success) {
      toast.success('Serwer zakupiony!', 'Trwa instalacja...');
      setServerName('');
      setSelectedPlan(null);
      setTimeout(() => {
        navigate(`/dashboard/servers/${result.serverId}`);
      }, 1500);
    } else {
      toast.error('Błąd zakupu', result.error || 'Nie udało się zakupić serwera');
    }
    setPurchasing(false);
  };

  const handleCustomPurchase = () => {
    if (!customName.trim()) {
      toast.error('Brak nazwy', 'Podaj nazwę serwera');
      return;
    }
    setPurchasing(true);
    const result = purchaseCustomServer(
      user.id, selectedType, customName.trim(),
      customCpu, customRam * 1024, customDisk, customPrice,
      isVpsType ? selectedOs : undefined,
      isBotType ? selectedBotRuntime : undefined,
    );
    if (result.success) {
      toast.success('Serwer zakupiony!', 'Trwa instalacja...');
      setCustomName('');
      setTimeout(() => {
        navigate(`/dashboard/servers/${result.serverId}`);
      }, 1500);
    } else {
      toast.error('Błąd zakupu', result.error || 'Nie udało się zakupić serwera');
    }
    setPurchasing(false);
  };

  const openCustom = () => {
    setShowCustom(true);
    setSelectedPlan(null);
  };

  // ── Custom configurator full page ──
  if (showCustom) {
    return (
      <div className="animate-fadeIn">
        <div style={{ marginBottom: 24 }} className="animate-fadeInDown">
          <button onClick={() => setShowCustom(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
            <ArrowLeft size={16} /> Powrót do pakietów
          </button>
          <h1 className="dash-page__title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SlidersHorizontal size={24} style={{ color: typeInfo[selectedType].color }} />
            Konfigurator {typeInfo[selectedType].label}
          </h1>
          <p className="dash-page__subtitle">Skonfiguruj własny pakiet dopasowany do Twoich potrzeb</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Left — sliders */}
          <div style={{ display: 'grid', gap: 16 }}>
            {/* CPU */}
            <div className="dash-card animate-slideInUp anim-delay-1">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={20} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Procesor (vCPU)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setCustomCpu(Math.max(cfg.minCpu, customCpu - 1))}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', minWidth: 40, textAlign: 'center', color: 'var(--accent)' }}>{customCpu}</span>
                  <button onClick={() => setCustomCpu(Math.min(cfg.maxCpu, customCpu + 1))}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <input type="range" min={cfg.minCpu} max={cfg.maxCpu} value={customCpu} onChange={e => setCustomCpu(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                <span>{cfg.minCpu} vCPU</span><span>{cfg.maxCpu} vCPU</span>
              </div>
            </div>

            {/* RAM */}
            <div className="dash-card animate-slideInUp anim-delay-2">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MemoryStick size={20} style={{ color: '#8b5cf6' }} />
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Pamięć RAM</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setCustomRam(Math.max(cfg.minRamGb, customRam - 1))}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', minWidth: 50, textAlign: 'center', color: '#8b5cf6' }}>{customRam} GB</span>
                  <button onClick={() => setCustomRam(Math.min(cfg.maxRamGb, customRam + 1))}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <input type="range" min={cfg.minRamGb} max={cfg.maxRamGb} value={customRam} onChange={e => setCustomRam(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#8b5cf6' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                <span>{cfg.minRamGb} GB</span><span>{cfg.maxRamGb} GB</span>
              </div>
            </div>

            {/* Disk */}
            <div className="dash-card animate-slideInUp anim-delay-3">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <HardDrive size={20} style={{ color: '#f97316' }} />
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Dysk SSD</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setCustomDisk(Math.max(cfg.minDiskGb, customDisk - cfg.diskStep))}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', minWidth: 60, textAlign: 'center', color: '#f97316' }}>{customDisk} GB</span>
                  <button onClick={() => setCustomDisk(Math.min(cfg.maxDiskGb, customDisk + cfg.diskStep))}
                    style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <input type="range" min={cfg.minDiskGb} max={cfg.maxDiskGb} step={cfg.diskStep} value={customDisk} onChange={e => setCustomDisk(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
                <span>{cfg.minDiskGb} GB</span><span>{cfg.maxDiskGb} GB</span>
              </div>
            </div>

            {/* OS for VPS/VDS */}
            {isVpsType && (
              <div className="dash-card animate-slideInUp anim-delay-4">
                <h3 style={{ fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Monitor size={18} /> System operacyjny
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                  {osOptions.map((os) => (
                    <button key={os.name} onClick={() => setSelectedOs(os.name)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 14px', background: selectedOs === os.name ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                        border: `2px solid ${selectedOs === os.name ? 'var(--accent)' : 'var(--border-primary)'}`,
                        borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)',
                        fontWeight: selectedOs === os.name ? 700 : 500, fontSize: '0.85rem', transition: 'all 0.2s ease',
                      }}>
                      <span style={{ display: 'flex', alignItems: 'center' }}><os.icon size={20} /></span> {os.name}
                      {selectedOs === os.name && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bot runtime selector in custom config */}
            {isBotType && (
              <div className="dash-card animate-slideInUp anim-delay-4">
                <h3 style={{ fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bot size={18} style={{ color: '#8b5cf6' }} /> Środowisko bota
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                  {([
                    { id: 'nodejs' as const, name: 'Node.js', icon: <NodeJsIcon size={28} />, desc: 'discord.js v14', version: 'Node.js 20 LTS' },
                    { id: 'python' as const, name: 'Python', icon: <PythonIcon size={28} />, desc: 'discord.py v2.3', version: 'Python 3.12' },
                  ]).map((rt) => (
                    <button key={rt.id} onClick={() => setSelectedBotRuntime(rt.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '14px 16px',
                        background: selectedBotRuntime === rt.id ? 'rgba(139,92,246,0.08)' : 'var(--bg-tertiary)',
                        border: `2px solid ${selectedBotRuntime === rt.id ? '#8b5cf6' : 'var(--border-primary)'}`,
                        borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--text-primary)',
                        transition: 'all 0.2s ease', textAlign: 'left',
                      }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, flexShrink: 0 }}>{rt.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{rt.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{rt.desc}</div>
                      </div>
                      {selectedBotRuntime === rt.id && <Check size={16} style={{ color: '#8b5cf6' }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — summary / purchase */}
          <div style={{ position: 'sticky', top: 24 }}>
            <div className="dash-card animate-fadeInRight" style={{ border: '2px solid var(--accent)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={18} /> Podsumowanie
              </h3>

              <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}><Cpu size={14} style={{ color: 'var(--accent)' }} /> CPU</span>
                  <span style={{ fontWeight: 700 }}>{customCpu} vCPU</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}><MemoryStick size={14} style={{ color: '#8b5cf6' }} /> RAM</span>
                  <span style={{ fontWeight: 700 }}>{customRam} GB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}><HardDrive size={14} style={{ color: '#f97316' }} /> Dysk</span>
                  <span style={{ fontWeight: 700 }}>{customDisk} GB SSD</span>
                </div>
                {isVpsType && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}><Monitor size={14} style={{ color: '#3b82f6' }} /> System</span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{selectedOs.split(' ')[0]}</span>
                  </div>
                )}
                {isBotType && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}><Bot size={14} style={{ color: '#8b5cf6' }} /> Runtime</span>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: '#8b5cf6' }}>{selectedBotRuntime === 'nodejs' ? 'Node.js' : 'Python'}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.88rem' }}>Typ</span>
                  <span style={{ fontWeight: 700, color: typeInfo[selectedType].color }}>{typeInfo[selectedType].label}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginBottom: 20, padding: '16px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginBottom: 4 }}>Cena miesięczna</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)' }}>{customPrice.toFixed(2)} <span style={{ fontSize: '1rem' }}>zł</span></div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="dash-label">Nazwa serwera</label>
                <input className="dash-input" placeholder="np. Mój serwer VPS" value={customName}
                  onChange={e => setCustomName(e.target.value)} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Twoje saldo:</span>
                <span style={{ fontWeight: 700, color: user.balance >= customPrice ? '#22c55e' : '#ef4444' }}>{user.balance.toFixed(2)} zł</span>
              </div>

              {user.balance < customPrice && (
                <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.82rem' }}>
                  Brakuje {(customPrice - user.balance).toFixed(2)} zł.{' '}
                  <button onClick={() => navigate('/dashboard/wallet')}
                    style={{ color: 'var(--accent)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                    Doładuj
                  </button>
                </div>
              )}

              <button
                className="btn btn--primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
                disabled={purchasing || user.balance < customPrice || !customName.trim()}
                onClick={handleCustomPurchase}>
                <Zap size={16} /> {purchasing ? 'Przetwarzanie...' : `Kup za ${customPrice.toFixed(2)} zł`}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title">Sklep</h1>
        <p className="dash-page__subtitle">Wybierz usługę i rozpocznij w minutę</p>
      </div>

      {/* Type selector */}
      <div className="dash-grid" style={{ marginBottom: 28, gridTemplateColumns: `repeat(${shopTypes.length}, 1fr)` }}>
        {shopTypes.map((type, idx) => {
          const info = typeInfo[type];
          const Icon = info.icon;
          const isActive = selectedType === type;
          return (
            <button
              key={type}
              className={`dash-card animate-slideInUp anim-delay-${idx + 1}`}
              onClick={() => { setSelectedType(type); setSelectedPlan(null); }}
              style={{
                cursor: 'pointer', textAlign: 'center',
                padding: '28px 20px',
                color: 'var(--text-primary)',
                borderColor: isActive ? info.color : 'var(--border-primary)',
                borderWidth: isActive ? 2 : 1,
                background: isActive ? `${info.color}12` : undefined,
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: info.color,
                }} />
              )}
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${info.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
              }}>
                <Icon size={26} style={{ color: info.color }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6, color: 'var(--text-primary)' }}>{info.label}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{info.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Plans */}
      <div className="dash-grid dash-grid--3" style={{ marginBottom: 16 }}>
        {plans.map((plan, idx) => (
          <div
            key={plan.id}
            className={`dash-card animate-scaleIn anim-delay-${idx + 1}`}
            onClick={() => setSelectedPlan(plan)}
            style={{
              cursor: 'pointer',
              borderColor: selectedPlan?.id === plan.id ? 'var(--accent)' : plan.popular ? 'var(--accent)' : 'var(--border-primary)',
              position: 'relative',
              background: selectedPlan?.id === plan.id ? 'var(--accent-glow)' : undefined,
              transition: 'all 0.3s ease',
              transform: selectedPlan?.id === plan.id ? 'scale(1.02)' : undefined,
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--gradient-accent)', color: '#fff', padding: '3px 14px',
                borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Star size={10} /> Popularny
              </div>
            )}
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{plan.name}</h3>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{plan.price.toFixed(2)}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> zł/mies.</span>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}><Cpu size={14} /> {plan.cpuCores} vCore</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}><MemoryStick size={14} /> {(plan.ramMb / 1024).toFixed(0)} GB</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', color: 'var(--text-secondary)' }}><HardDrive size={14} /> {plan.diskGb} GB</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {plan.features.map((f, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                  <Check size={14} style={{ color: '#22c55e', flexShrink: 0 }} /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Custom package button */}
      {cfg.enabled && (
      <div className="animate-fadeInUp" style={{ marginBottom: 24 }}>
        <button
          onClick={openCustom}
          className="dash-card"
          style={{
            width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '18px 24px', borderStyle: 'dashed', borderWidth: 2,
            borderColor: 'var(--accent)', background: 'var(--accent-glow)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.01)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <SlidersHorizontal size={22} style={{ color: 'var(--accent)' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Skonfiguruj własny pakiet</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Ustaw dokładnie ile RAM, CPU i dysku potrzebujesz</div>
          </div>
          <ArrowLeft size={18} style={{ color: 'var(--accent)', transform: 'rotate(180deg)', marginLeft: 'auto' }} />
        </button>
      </div>
      )}

      {/* OS Selection for VPS/VDS */}
      {selectedPlan && isVpsType && (
        <div className="dash-card animate-fadeInUp" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Monitor size={18} /> Wybierz system operacyjny
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {osOptions.map((os, idx) => (
              <button
                key={os.name}
                onClick={() => setSelectedOs(os.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px',
                  background: selectedOs === os.name ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                  border: `2px solid ${selectedOs === os.name ? 'var(--accent)' : 'var(--border-primary)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontWeight: selectedOs === os.name ? 700 : 500,
                  fontSize: '0.88rem',
                  transition: 'all 0.2s ease',
                  animation: `slideInUp 0.3s ease forwards`,
                  animationDelay: `${idx * 0.04}s`,
                  opacity: 0,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center' }}><os.icon size={22} /></span>
                {os.name}
                {selectedOs === os.name && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purchase form */}
      {selectedPlan && (
        <div className="dash-card animate-fadeInUp" style={{ maxWidth: 600 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} /> Finalizacja zakupu
          </h3>
          <div style={{ marginBottom: 12, padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{selectedPlan.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {selectedPlan.cpuCores} vCore | {(selectedPlan.ramMb / 1024).toFixed(0)} GB RAM | {selectedPlan.diskGb} GB SSD
                {isVpsType && <> | {selectedOs}</>}
                {isBotType && <> | {selectedBotRuntime === 'nodejs' ? 'Node.js' : 'Python'}</>}
              </div>
            </div>
            <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.2rem' }}>{selectedPlan.price.toFixed(2)} zł</div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="dash-label">Nazwa serwera</label>
            <input className="dash-input" placeholder={isBotType ? 'np. Mój bot Discord' : 'np. Mój serwer FiveM'} value={serverName}
              onChange={e => setServerName(e.target.value)} />
          </div>

          {/* Bot runtime selector inside purchase form */}
          {isBotType && (
            <div style={{ marginBottom: 16 }}>
              <label className="dash-label">Środowisko</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {([
                  { id: 'nodejs' as const, name: 'Node.js', icon: <NodeJsIcon size={22} />, desc: 'discord.js v14' },
                  { id: 'python' as const, name: 'Python', icon: <PythonIcon size={22} />, desc: 'discord.py v2.3' },
                ] as const).map((rt) => (
                  <button
                    key={rt.id}
                    onClick={() => setSelectedBotRuntime(rt.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px',
                      background: selectedBotRuntime === rt.id ? 'rgba(139,92,246,0.08)' : 'var(--bg-tertiary)',
                      border: `2px solid ${selectedBotRuntime === rt.id ? '#8b5cf6' : 'var(--border-primary)'}`,
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, flexShrink: 0 }}>{rt.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{rt.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{rt.desc}</div>
                    </div>
                    {selectedBotRuntime === rt.id && <Check size={14} style={{ color: '#8b5cf6', flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Twoje saldo:</span>
            <span style={{ fontWeight: 700, color: user.balance >= selectedPlan.price ? '#22c55e' : '#ef4444' }}>{user.balance.toFixed(2)} zł</span>
          </div>

          {user.balance < selectedPlan.price && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
              Niewystarczające środki. Brakuje {(selectedPlan.price - user.balance).toFixed(2)} zł.
              <button onClick={() => navigate('/dashboard/wallet')}
                style={{ marginLeft: 8, color: 'var(--accent)', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                Doładuj portfel
              </button>
            </div>
          )}

          <button
            className="btn btn--primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
            disabled={purchasing || user.balance < selectedPlan.price}
            onClick={handlePurchase}
          >
            <Zap size={16} /> {purchasing ? 'Przetwarzanie...' : `Kup za ${selectedPlan.price.toFixed(2)} zł`}
          </button>
        </div>
      )}
    </div>
  );
}
