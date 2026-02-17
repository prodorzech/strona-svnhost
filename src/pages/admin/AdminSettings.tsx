import { useState, useEffect } from 'react';
import { useStoreState } from '../../store/useStore';
import { updateAdminSettings } from '../../store/store';
import type { ServerType } from '../../store/types';
import { backendApi } from '../../services/backendApi';
import {
  Settings, CreditCard, Eye, EyeOff, Save, CheckCircle2,
  AlertTriangle, ExternalLink, HardDrive, ShoppingBag,
  Monitor, Gamepad2, Bot, LogIn,
} from 'lucide-react';

export function AdminSettingsPage() {
  const store = useStoreState();
  const s = store.adminSettings;

  const [stripePublicKey, setStripePublicKey] = useState(s.stripePublicKey);
  const [stripeSecretKey, setStripeSecretKey] = useState(s.stripeSecretKey);
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState(s.stripeWebhookSecret);
  const [stripeEnabled, setStripeEnabled] = useState(s.stripeEnabled);
  const [phpMyAdminUrl, setPhpMyAdminUrl] = useState(s.phpMyAdminUrl);
  const [phpMyAdminEnabled, setPhpMyAdminEnabled] = useState(s.phpMyAdminEnabled);
  const [disabledOffers, setDisabledOffers] = useState<ServerType[]>(s.disabledOffers || []);
  const [loginEnabled, setLoginEnabled] = useState(s.loginEnabled);

  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loginSaving, setLoginSaving] = useState(false);

  // Sync loginEnabled from backend on mount
  useEffect(() => {
    backendApi.settings.getPublic().then(res => {
      if (res.success && res.data) {
        const val = res.data.loginEnabled;
        setLoginEnabled(val);
        updateAdminSettings({ loginEnabled: val });
      }
    });
  }, []);

  const handleLoginToggle = async (enabled: boolean) => {
    const prev = loginEnabled;
    setLoginSaving(true);
    setLoginEnabled(enabled);
    try {
      const res = await backendApi.settings.update({ loginEnabled: String(enabled) });
      if (!res.success) throw new Error('save failed');
      updateAdminSettings({ loginEnabled: enabled });
    } catch {
      setLoginEnabled(prev); // revert on error
    }
    setLoginSaving(false);
  };

  const handleSave = () => {
    updateAdminSettings({
      stripePublicKey,
      stripeSecretKey,
      stripeWebhookSecret,
      stripeEnabled,
      phpMyAdminUrl,
      phpMyAdminEnabled,
      disabledOffers,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const hasStripeKeys = stripePublicKey.startsWith('pk_') && stripeSecretKey.startsWith('sk_');

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 700 }}>
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Settings size={24} style={{ color: 'var(--accent)' }} /> Ustawienia
        </h1>
        <p className="dash-page__subtitle">Konfiguracja Stripe API, phpMyAdmin i inne ustawienia hostingu</p>
      </div>

      {/* ═══ STRIPE SECTION ═══ */}
      <div className="dash-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #635bff, #7c3aed)',
          }}>
            <CreditCard size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Stripe API</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Konfiguracja płatności online</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
              background: stripeEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: stripeEnabled ? '#22c55e' : '#ef4444',
            }}>
              {stripeEnabled ? 'Aktywne' : 'Wyłączone'}
            </span>
          </div>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          {/* Info box */}
          <div style={{ padding: 14, borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertTriangle size={16} style={{ color: '#6366f1', flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Klucze API znajdziesz w <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                Dashboard Stripe → Developers → API Keys <ExternalLink size={11} style={{ verticalAlign: 'middle' }} />
              </a>.
              Użyj kluczy <strong>testowych</strong> podczas developmentu (zaczynają się od <code>pk_test_</code> / <code>sk_test_</code>).
            </div>
          </div>

          <div>
            <label className="dash-label">Klucz publiczny (Publishable Key)</label>
            <input className="dash-input" placeholder="pk_test_..." value={stripePublicKey}
              onChange={e => setStripePublicKey(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
          </div>

          <div>
            <label className="dash-label">Klucz sekretny (Secret Key)</label>
            <div style={{ position: 'relative' }}>
              <input className="dash-input" placeholder="sk_test_..."
                type={showSecret ? 'text' : 'password'}
                value={stripeSecretKey}
                onChange={e => setStripeSecretKey(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.82rem', paddingRight: 40 }} />
              <button onClick={() => setShowSecret(!showSecret)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="dash-label">Webhook Secret</label>
            <div style={{ position: 'relative' }}>
              <input className="dash-input" placeholder="whsec_..."
                type={showWebhook ? 'text' : 'password'}
                value={stripeWebhookSecret}
                onChange={e => setStripeWebhookSecret(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: '0.82rem', paddingRight: 40 }} />
              <button onClick={() => setShowWebhook(!showWebhook)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
                {showWebhook ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Ustawisz go w Dashboard Stripe → Webhooks → Endpoint → Signing Secret
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem' }}>
            <input type="checkbox" checked={stripeEnabled} onChange={e => setStripeEnabled(e.target.checked)}
              style={{ accentColor: 'var(--accent)', width: 18, height: 18 }} />
            <span>Włącz płatności Stripe</span>
          </label>

          {stripeEnabled && !hasStripeKeys && stripePublicKey.length > 0 && (
            <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', fontSize: '0.82rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> Klucze API wyglądają niepoprawnie. Publiczny powinien zaczynać się od "pk_", a sekretny od "sk_".
            </div>
          )}
        </div>
      </div>

      {/* ═══ PHPMYADMIN SECTION ═══ */}
      <div className="dash-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #f97316, #eab308)',
          }}>
            <HardDrive size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>phpMyAdmin</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zarządzanie bazami danych przez przeglądarkę</p>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
              background: phpMyAdminEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: phpMyAdminEnabled ? '#22c55e' : '#ef4444',
            }}>
              {phpMyAdminEnabled ? 'Aktywne' : 'Wyłączone'}
            </span>
          </div>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 16 }}>
          <div>
            <label className="dash-label">URL phpMyAdmin</label>
            <input className="dash-input" placeholder="http://IP_SERWERA:8080" value={phpMyAdminUrl}
              onChange={e => setPhpMyAdminUrl(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
              Adres URL pod którym dostępny jest phpMyAdmin. Poradnik instalacji znajdziesz w Infrastruktura → phpMyAdmin.
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem' }}>
            <input type="checkbox" checked={phpMyAdminEnabled} onChange={e => setPhpMyAdminEnabled(e.target.checked)}
              style={{ accentColor: 'var(--accent)', width: 18, height: 18 }} />
            <span>Włącz phpMyAdmin (widoczny dla klientów w zakładce baz danych)</span>
          </label>
        </div>
      </div>

      {/* ═══ LOGIN TOGGLE SECTION ═══ */}
      <div className="dash-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: loginEnabled ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
          }}>
            <LogIn size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Logowanie klientów</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Zablokuj lub odblokuj dostęp do panelu klienta</p>
          </div>
        </div>

        <div style={{ padding: 20 }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            padding: '14px 18px', borderRadius: 10,
            background: loginEnabled ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
            border: `1px solid ${loginEnabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
            transition: 'all 0.2s',
          }}>
            <input type="checkbox" checked={loginEnabled}
              onChange={e => handleLoginToggle(e.target.checked)}
              disabled={loginSaving}
              style={{ accentColor: loginEnabled ? '#22c55e' : '#ef4444', width: 20, height: 20, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {loginEnabled ? 'Logowanie włączone' : 'Logowanie wyłączone'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                {loginEnabled
                  ? 'Klienci mogą się logować i rejestrować. Przycisk "Panel Klienta" na stronie głównej jest aktywny.'
                  : 'Klienci NIE mogą się logować ani rejestrować. Przycisk "Panel Klienta" jest wyszarzony. Admin nadal może się logować.'}
              </div>
            </div>
            <span style={{
              padding: '4px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700,
              background: loginEnabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
              color: loginEnabled ? '#22c55e' : '#ef4444',
            }}>
              {loginSaving ? '...' : loginEnabled ? 'ON' : 'OFF'}
            </span>
          </label>
        </div>
      </div>

      {/* ═══ OFFER TOGGLES SECTION ═══ */}
      <div className="dash-card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
          }}>
            <ShoppingBag size={18} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Oferty</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Włącz lub wyłącz poszczególne kategorie usług w sklepie</p>
          </div>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 12 }}>
          {([
            { type: 'vps' as ServerType, label: 'VPS', icon: Monitor, color: '#3b82f6', desc: 'Wirtualne serwery prywatne' },
            { type: 'fivem' as ServerType, label: 'FiveM', icon: Gamepad2, color: '#f97316', desc: 'Serwery GTA V FiveM' },
            { type: 'minecraft' as ServerType, label: 'Minecraft', icon: Gamepad2, color: '#22c55e', desc: 'Serwery Minecraft' },
            { type: 'bot' as ServerType, label: 'Bot Discord', icon: Bot, color: '#8b5cf6', desc: 'Hosting botów Discord' },
          ]).map(({ type, label, icon: Icon, color, desc }) => {
            const enabled = !disabledOffers.includes(type);
            return (
              <label key={type} style={{
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                padding: '12px 16px', borderRadius: 10,
                background: enabled ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
                border: `1px solid ${enabled ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                transition: 'all 0.2s',
              }}>
                <input type="checkbox" checked={enabled}
                  onChange={() => {
                    setDisabledOffers(prev =>
                      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                    );
                  }}
                  style={{ accentColor: color, width: 18, height: 18, flexShrink: 0 }} />
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${color}18`,
                }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{desc}</div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600,
                  background: enabled ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  color: enabled ? '#22c55e' : '#ef4444',
                }}>
                  {enabled ? 'Aktywne' : 'Wyłączone'}
                </span>
              </label>
            );
          })}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
            Wyłączone oferty nie będą widoczne w sklepie dla klientów.
          </p>
        </div>
      </div>

      {/* Save button */}
      <button className="btn btn--primary" onClick={handleSave}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px',
          fontSize: '0.92rem', fontWeight: 600,
        }}>
        {saved ? <><CheckCircle2 size={18} /> Zapisano!</> : <><Save size={18} /> Zapisz ustawienia</>}
      </button>
    </div>
  );
}
