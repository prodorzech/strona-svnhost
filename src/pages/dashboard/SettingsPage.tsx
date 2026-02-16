import { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile, updateUserSettings, updateUserBilling, removeSession, removeAllOtherSessions, deleteAccount, defaultUserSettings, exportUserData, logout } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { useApp } from '../../context';
import { toast } from '../../components/Toast';
import { CustomSelect } from '../../components/CustomSelect';
import { useNavigate } from 'react-router-dom';
import { updateFavicon } from '../../utils/logo';
import {
  User, Lock, Save, Bell, Shield, Globe, Monitor, Palette,
  Mail, CreditCard, Trash2, LogOut, Smartphone, KeyRound,
  Eye, EyeOff, Clock, ChevronRight, AlertTriangle, Download, Hash, Copy, Moon, Sun, Camera,
} from 'lucide-react';
import './SettingsPage.css';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'appearance' | 'sessions' | 'billing' | 'danger';

const NAV_ITEMS: { id: SettingsTab; label: string; icon: React.ReactNode; group: string }[] = [
  { id: 'profile', label: 'Profil', icon: <User size={16} />, group: 'Konto' },
  { id: 'security', label: 'Bezpieczeństwo', icon: <Shield size={16} />, group: 'Konto' },
  { id: 'sessions', label: 'Sesje', icon: <Monitor size={16} />, group: 'Konto' },
  { id: 'notifications', label: 'Powiadomienia', icon: <Bell size={16} />, group: 'Preferencje' },
  { id: 'appearance', label: 'Wygląd', icon: <Palette size={16} />, group: 'Preferencje' },
  { id: 'billing', label: 'Płatności', icon: <CreditCard size={16} />, group: 'Preferencje' },
  { id: 'danger', label: 'Strefa zagrożeń', icon: <AlertTriangle size={16} />, group: 'Inne' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="settings__toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="settings__toggle-track" />
      <span className="settings__toggle-thumb" />
    </label>
  );
}

export function SettingsPage() {
  const store = useStoreState();
  const user = getCurrentUser();
  const { theme, setTheme } = useApp();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SettingsTab>('profile');

  // Profile
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [language, setLanguage] = useState(user?.language || 'pl');
  const [timezone, setTimezone] = useState(user?.timezone || 'Europe/Warsaw');

  // Security
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Billing
  const [billingCompany, setBillingCompany] = useState(user?.billing?.companyName || '');
  const [billingNip, setBillingNip] = useState(user?.billing?.nip || '');
  const [billingAddress, setBillingAddress] = useState(user?.billing?.address || '');
  const [billingCity, setBillingCity] = useState(user?.billing?.city || '');

  // Confirm delete
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);

  if (!user) return null;

  const settings = user.settings || defaultUserSettings();
  const sessions = user.sessions || [];

  const formatRelativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Przed chwilą';
    if (mins < 60) return `${mins} min temu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} godz. temu`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} dni temu`;
    return new Date(iso).toLocaleDateString('pl-PL');
  };

  const handleSaveProfile = () => {
    updateProfile(user.id, {
      username: username.trim() || user.username,
      email: email.trim() || user.email,
      fullName: fullName.trim(),
      bio: bio.trim(),
      phone: phone.trim(),
      language,
      timezone,
    });
    toast.success('Profil zapisany', 'Twoje dane zostały zaktualizowane');
  };

  const handleChangePassword = () => {
    if (currentPw !== user.password) {
      toast.error('Błąd hasła', 'Aktualne hasło jest nieprawidłowe');
      return;
    }
    if (newPw.length < 6) {
      toast.error('Za krótkie hasło', 'Nowe hasło musi mieć minimum 6 znaków');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error('Błąd hasła', 'Hasła nie są takie same');
      return;
    }
    updateProfile(user.id, { password: newPw });
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setShowCurrentPw(false);
    setShowNewPw(false);
    toast.success('Hasło zmienione', 'Twoje hasło zostało zaktualizowane pomyślnie');
  };

  const handleToggle2FA = () => {
    const next = !user.twoFa;
    updateProfile(user.id, { twoFa: next });
    if (next) {
      toast.success('2FA włączone', 'Weryfikacja dwuetapowa została aktywowana');
    } else {
      toast.info('2FA wyłączone', 'Weryfikacja dwuetapowa została dezaktywowana');
    }
  };

  const handleToggleLoginAlerts = () => {
    updateProfile(user.id, { loginAlerts: !(user.loginAlerts !== false) });
  };

  const handleSettingChange = (key: string, value: boolean | string) => {
    updateUserSettings(user.id, { [key]: value });
    // Sync theme with the app context
    if (key === 'theme' && (value === 'dark' || value === 'light')) {
      setTheme(value);
    }
  };

  const handleSaveBilling = () => {
    updateUserBilling(user.id, {
      companyName: billingCompany.trim(),
      nip: billingNip.trim(),
      address: billingAddress.trim(),
      city: billingCity.trim(),
    });
    toast.success('Dane zapisane', 'Dane do faktur zostały zaktualizowane');
  };

  const handleRemoveSession = (sessionId: string) => {
    removeSession(user.id, sessionId);
    toast.success('Sesja zakończona', 'Urządzenie zostało wylogowane');
  };

  const handleRemoveAllSessions = () => {
    removeAllOtherSessions(user.id);
    toast.success('Wszystkie sesje zakończone', 'Pozostałe urządzenia zostały wylogowane');
  };

  const handleExportData = () => {
    const data = exportUserData(user.id);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `svnhost-export-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Eksport gotowy', 'Plik z danymi został pobrany');
  };

  const handleDeleteAccount = () => {
    if (!confirmDeleteAccount) {
      setConfirmDeleteAccount(true);
      return;
    }
    deleteAccount(user.id);
    toast.success('Konto usunięte', 'Twoje konto zostało trwale usunięte');
    navigate('/');
  };

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    updateUserSettings(user.id, { theme: newTheme });
  };

  const applyAccentColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const el = document.documentElement.style;
    el.setProperty('--accent', hex);
    el.setProperty('--accent-hover', hex);
    el.setProperty('--accent-glow', `rgba(${r}, ${g}, ${b}, 0.15)`);
    el.setProperty('--accent-glow-strong', `rgba(${r}, ${g}, ${b}, 0.3)`);
    el.setProperty('--gradient-accent', `linear-gradient(135deg, ${hex} 0%, ${hex}cc 100%)`);
    el.setProperty('--shadow-glow', `0 0 30px rgba(${r}, ${g}, ${b}, 0.15)`);
  };

  useEffect(() => {
    if (settings.accentColor && settings.accentColor !== '#ef4444') {
      applyAccentColor(settings.accentColor);
    }
  }, []);

  const handleAccentColor = (color: string) => {
    updateUserSettings(user.id, { accentColor: color });
    applyAccentColor(color);
    updateFavicon(color);
    toast.success('Motyw zmieniony', `Kolor akcentu zmieniony na ${color}`);
  };

  // Render nav groups
  const renderNav = () => {
    let lastGroup = '';
    return NAV_ITEMS.map((item) => {
      const showLabel = item.group !== lastGroup;
      lastGroup = item.group;
      return (
        <div key={item.id}>
          {showLabel && <div className="settings__nav-label">{item.group}</div>}
          <button
            className={`settings__nav-item${tab === item.id ? ' settings__nav-item--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.icon}
            {item.label}
          </button>
        </div>
      );
    });
  };

  const renderContent = () => {
    switch (tab) {
      case 'profile':
        return (
          <>
            <div className="settings__section">
              <div className="settings__section-header">
                <div className="settings__section-icon settings__section-icon--blue"><User size={18} /></div>
                <div>
                  <div className="settings__section-title">Informacje o profilu</div>
                  <div className="settings__section-desc">Zarządzaj swoimi danymi osobowymi</div>
                </div>
              </div>

              <div className="settings__avatar-row">
                <div className="settings__avatar" style={{ position: 'relative', overflow: 'hidden' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                  <label style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)', opacity: 0, cursor: 'pointer', borderRadius: '50%',
                    transition: 'opacity 0.2s ease',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                    <Camera size={20} color="#fff" />
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error('Za duży plik', 'Maksymalny rozmiar avatara to 2 MB');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        const result = reader.result as string;
                        updateProfile(user.id, { avatar: result });
                        toast.success('Avatar zmieniony', 'Twój avatar został zaktualizowany');
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                </div>
                <div className="settings__avatar-info">
                  <div className="settings__avatar-name">{user.username}</div>
                  <div className="settings__avatar-role">
                    {user.role === 'admin' ? 'Administrator' : 'Użytkownik'} · Konto od {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Hash size={12} /> ID:
                      <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: 4, fontSize: '0.74rem' }}>
                        {user.id}
                      </code>
                    </span>
                    <button onClick={() => { navigator.clipboard.writeText(user.id); toast.success('Skopiowano', 'ID użytkownika skopiowane'); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, display: 'flex' }}>
                      <Copy size={12} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <label className="btn btn--outline" style={{ padding: '5px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>
                      <Camera size={12} style={{ marginRight: 4 }} /> Zmień avatar
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error('Za duży plik', 'Maksymalny rozmiar avatara to 2 MB');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = reader.result as string;
                          updateProfile(user.id, { avatar: result });
                          toast.success('Avatar zmieniony', 'Twój avatar został zaktualizowany');
                        };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                    {user.avatar && (
                      <button className="btn btn--outline" style={{ padding: '5px 12px', fontSize: '0.78rem', color: '#ef4444' }}
                        onClick={() => { updateProfile(user.id, { avatar: undefined }); toast.success('Avatar usunięty', 'Avatar został przywrócony do domyślnego'); }}>
                        Usuń avatar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="settings__form">
                <div className="settings__form-row">
                  <div className="settings__form-group">
                    <label className="dash-label">Nazwa użytkownika</label>
                    <input className="dash-input" value={username} onChange={e => setUsername(e.target.value)} />
                    <span className="settings__form-hint">Widoczna publicznie dla innych użytkowników</span>
                  </div>
                  <div className="settings__form-group">
                    <label className="dash-label">Imię i nazwisko</label>
                    <input className="dash-input" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Jan Kowalski" />
                  </div>
                </div>

                <div className="settings__form-row">
                  <div className="settings__form-group">
                    <label className="dash-label">Adres e-mail</label>
                    <input className="dash-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="settings__form-group">
                    <label className="dash-label">Numer telefonu</label>
                    <input className="dash-input" type="tel" placeholder="+48 000 000 000" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                <div className="settings__form-group settings__form-group--full">
                  <label className="dash-label">Bio</label>
                  <textarea className="dash-input" value={bio} onChange={e => setBio(e.target.value)}
                    placeholder="Napisz kilka słów o sobie..." rows={3}
                    style={{ resize: 'vertical', minHeight: 80 }} />
                </div>

                <div className="settings__form-row">
                  <div className="settings__form-group">
                    <label className="dash-label">Język</label>
                    <CustomSelect value={language} onChange={val => setLanguage(val)}
                      options={[
                        { value: 'pl', label: '🇵🇱 Polski' },
                        { value: 'en', label: '🇬🇧 English' },
                        { value: 'de', label: '🇩🇪 Deutsch' },
                        { value: 'uk', label: '🇺🇦 Українська' },
                      ]}
                    />
                  </div>
                  <div className="settings__form-group">
                    <label className="dash-label">Strefa czasowa</label>
                    <CustomSelect value={timezone} onChange={val => setTimezone(val)}
                      options={[
                        { value: 'Europe/Warsaw', label: 'Europa/Warszawa (UTC+1)' },
                        { value: 'Europe/London', label: 'Europa/Londyn (UTC+0)' },
                        { value: 'Europe/Berlin', label: 'Europa/Berlin (UTC+1)' },
                        { value: 'America/New_York', label: 'Ameryka/Nowy Jork (UTC-5)' },
                      ]}
                    />
                  </div>
                </div>

                <div className="settings__actions">
                  <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
                    onClick={handleSaveProfile}>
                    <Save size={16} /> Zapisz profil
                  </button>
                </div>
              </div>
            </div>
          </>
        );

      case 'security':
        return (
          <>
            {/* Password */}
            <div className="settings__section">
              <div className="settings__section-header">
                <div className="settings__section-icon settings__section-icon--green"><Lock size={18} /></div>
                <div>
                  <div className="settings__section-title">Zmiana hasła</div>
                  <div className="settings__section-desc">Zaktualizuj swoje hasło aby chronić konto</div>
                </div>
              </div>

              <div className="settings__form">
                <div className="settings__form-group">
                  <label className="dash-label">Aktualne hasło</label>
                  <div style={{ position: 'relative' }}>
                    <input className="dash-input" type={showCurrentPw ? 'text' : 'password'}
                      value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                      style={{ paddingRight: 42 }} />
                    <button onClick={() => setShowCurrentPw(!showCurrentPw)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                      {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="settings__form-row">
                  <div className="settings__form-group">
                    <label className="dash-label">Nowe hasło</label>
                    <div style={{ position: 'relative' }}>
                      <input className="dash-input" type={showNewPw ? 'text' : 'password'}
                        value={newPw} onChange={e => setNewPw(e.target.value)}
                        placeholder="Min. 6 znaków" style={{ paddingRight: 42 }} />
                      <button onClick={() => setShowNewPw(!showNewPw)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                        {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="settings__form-group">
                    <label className="dash-label">Potwierdź nowe hasło</label>
                    <input className="dash-input" type="password" value={confirmPw}
                      onChange={e => setConfirmPw(e.target.value)} />
                  </div>
                </div>

                <div className="settings__actions">
                  <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
                    onClick={handleChangePassword}>
                    <KeyRound size={16} /> Zmień hasło
                  </button>
                </div>
              </div>
            </div>

            {/* 2FA & Security */}
            <div className="settings__section">
              <div className="settings__section-header">
                <div className="settings__section-icon settings__section-icon--purple"><Shield size={18} /></div>
                <div>
                  <div className="settings__section-title">Zabezpieczenia konta</div>
                  <div className="settings__section-desc">Dodatkowe warstwy ochrony</div>
                </div>
              </div>

              <div className="settings__toggle-row">
                <div className="settings__toggle-info">
                  <span className="settings__toggle-label">Weryfikacja dwuetapowa (2FA)</span>
                  <span className="settings__toggle-desc">Dodaj dodatkowy krok weryfikacji przy logowaniu</span>
                </div>
                <Toggle checked={user.twoFa === true} onChange={handleToggle2FA} />
              </div>

              <div className="settings__toggle-row">
                <div className="settings__toggle-info">
                  <span className="settings__toggle-label">Alerty logowania</span>
                  <span className="settings__toggle-desc">Otrzymuj powiadomienie przy logowaniu z nowego urządzenia</span>
                </div>
                <Toggle checked={user.loginAlerts !== false} onChange={handleToggleLoginAlerts} />
              </div>

              <div className="settings__toggle-row">
                <div className="settings__toggle-info">
                  <span className="settings__toggle-label">Blokada IP</span>
                  <span className="settings__toggle-desc">Zezwalaj na logowanie tylko z zaufanych adresów IP</span>
                </div>
                <Toggle checked={false} onChange={() => toast.info('Wkrótce', 'Ta funkcja będzie dostępna w przyszłej aktualizacji')} />
              </div>
            </div>
          </>
        );

      case 'sessions':
        return (
          <div className="settings__section">
            <div className="settings__section-header">
              <div className="settings__section-icon settings__section-icon--cyan"><Monitor size={18} /></div>
              <div>
                <div className="settings__section-title">Aktywne sesje</div>
                <div className="settings__section-desc">Zarządzaj urządzeniami na których jesteś zalogowany</div>
              </div>
            </div>

            {sessions.map((session) => (
              <div key={session.id} className={`settings__session${session.current ? ' settings__session-current' : ''}`}>
                <div className="settings__session-info">
                  {session.device.toLowerCase().includes('iphone') || session.device.toLowerCase().includes('android')
                    ? <Smartphone size={18} className="settings__session-icon" />
                    : <Monitor size={18} className="settings__session-icon" />}
                  <div className="settings__session-details">
                    <span className="settings__session-device">{session.device} · {session.browser}</span>
                    <span className="settings__session-meta">
                      {session.current
                        ? <><span style={{ color: '#22c55e', fontWeight: 600 }}>● Aktywna teraz</span> · {session.location} · {session.ip}</>
                        : <>Ostatnia aktywność: {formatRelativeTime(session.lastActive)} · {session.location}</>}
                    </span>
                  </div>
                </div>
                {session.current ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, padding: '4px 10px',
                    background: 'var(--accent-glow)', borderRadius: 'var(--radius-full)' }}>
                    Ta sesja
                  </span>
                ) : (
                  <button className="btn btn--outline" style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                    onClick={() => handleRemoveSession(session.id)}>
                    Wyloguj
                  </button>
                )}
              </div>
            ))}

            {sessions.filter(s => !s.current).length > 0 && (
              <div className="settings__actions">
                <button className="btn btn--outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', color: '#ef4444' }}
                  onClick={handleRemoveAllSessions}>
                  <LogOut size={16} /> Wyloguj wszystkie inne sesje
                </button>
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="settings__section">
            <div className="settings__section-header">
              <div className="settings__section-icon settings__section-icon--orange"><Bell size={18} /></div>
              <div>
                <div className="settings__section-title">Powiadomienia</div>
                <div className="settings__section-desc">Wybierz jakie powiadomienia chcesz otrzymywać</div>
              </div>
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Powiadomienia e-mail</span>
                <span className="settings__toggle-desc">Otrzymuj najważniejsze powiadomienia na e-mail</span>
              </div>
              <Toggle checked={settings.emailNotifs} onChange={(v) => handleSettingChange('emailNotifs', v)} />
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Alerty serwerów</span>
                <span className="settings__toggle-desc">Powiadomienia o statusie serwerów (restart, błędy, obciążenie)</span>
              </div>
              <Toggle checked={settings.serverAlerts} onChange={(v) => handleSettingChange('serverAlerts', v)} />
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Powiadomienia o płatnościach</span>
                <span className="settings__toggle-desc">Informacje o doładowaniach, fakturach i wygasających usługach</span>
              </div>
              <Toggle checked={settings.billingNotifs} onChange={(v) => handleSettingChange('billingNotifs', v)} />
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Odpowiedzi na zgłoszenia</span>
                <span className="settings__toggle-desc">Powiadomienia o nowych odpowiedziach w ticketach</span>
              </div>
              <Toggle checked={settings.ticketNotifs} onChange={(v) => handleSettingChange('ticketNotifs', v)} />
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Przerwy techniczne</span>
                <span className="settings__toggle-desc">Informacje o planowanych przerwach i konserwacjach</span>
              </div>
              <Toggle checked={settings.maintenanceNotifs} onChange={(v) => handleSettingChange('maintenanceNotifs', v)} />
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Newsletter i promocje</span>
                <span className="settings__toggle-desc">Nowości, promocje i specjalne oferty od SVNHost</span>
              </div>
              <Toggle checked={settings.newsNotifs} onChange={(v) => handleSettingChange('newsNotifs', v)} />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="settings__section">
            <div className="settings__section-header">
              <div className="settings__section-icon settings__section-icon--purple"><Palette size={18} /></div>
              <div>
                <div className="settings__section-title">Wygląd i personalizacja</div>
                <div className="settings__section-desc">Dostosuj wygląd panelu do swoich preferencji</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="dash-label">Motyw panelu</label>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button
                  onClick={() => handleThemeChange('dark')}
                  style={{
                    flex: 1, padding: '20px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: '#0a0a0a',
                    border: theme === 'dark' ? '2px solid var(--accent)' : '2px solid #262626',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    color: '#f5f5f5', transition: 'all 0.2s ease',
                    boxShadow: theme === 'dark' ? '0 0 16px rgba(239,68,68,0.15)' : 'none',
                  }}>
                  <div style={{ width: '100%', borderRadius: 6, padding: '10px', marginBottom: 4,
                    background: '#141414', border: '1px solid #262626' }}>
                    <div style={{ height: 6, width: '60%', borderRadius: 3, background: '#333', marginBottom: 6 }} />
                    <div style={{ height: 4, width: '80%', borderRadius: 2, background: '#222' }} />
                  </div>
                  <Moon size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ciemny</span>
                  {theme === 'dark' && <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600 }}>● Aktywny</span>}
                </button>
                <button
                  onClick={() => handleThemeChange('light')}
                  style={{
                    flex: 1, padding: '20px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    background: '#ffffff',
                    border: theme === 'light' ? '2px solid var(--accent)' : '2px solid #e5e5e5',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    color: '#111111', transition: 'all 0.2s ease',
                    boxShadow: theme === 'light' ? '0 0 16px rgba(239,68,68,0.15)' : 'none',
                  }}>
                  <div style={{ width: '100%', borderRadius: 6, padding: '10px', marginBottom: 4,
                    background: '#f8f8f8', border: '1px solid #e5e5e5' }}>
                    <div style={{ height: 6, width: '60%', borderRadius: 3, background: '#ddd', marginBottom: 6 }} />
                    <div style={{ height: 4, width: '80%', borderRadius: 2, background: '#eee' }} />
                  </div>
                  <Sun size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Jasny</span>
                  {theme === 'light' && <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600 }}>● Aktywny</span>}
                </button>
              </div>
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Tryb kompaktowy</span>
                <span className="settings__toggle-desc">Zmniejsz odstępy i elementy interfejsu</span>
              </div>
              <Toggle checked={settings.compactMode} onChange={(v) => handleSettingChange('compactMode', v)} />
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Animacje</span>
                <span className="settings__toggle-desc">Włącz animacje przejść i efekty wizualne</span>
              </div>
              <Toggle checked={settings.animationsEnabled} onChange={(v) => handleSettingChange('animationsEnabled', v)} />
            </div>

            <div className="settings__toggle-row">
              <div className="settings__toggle-info">
                <span className="settings__toggle-label">Pokazuj IP serwerów</span>
                <span className="settings__toggle-desc">Wyświetlaj adresy IP na kartach serwerów</span>
              </div>
              <Toggle checked={settings.showServerIp} onChange={(v) => handleSettingChange('showServerIp', v)} />
            </div>

            <div style={{ marginTop: 20 }}>
              <label className="dash-label">Kolor akcentu</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4'].map(color => (
                  <button key={color} style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                    background: color, border: color === settings.accentColor ? '2px solid #fff' : '2px solid transparent',
                    cursor: 'pointer', transition: 'transform 0.15s ease',
                    boxShadow: color === settings.accentColor ? `0 0 12px ${color}66` : 'none',
                  }}
                    onClick={() => handleAccentColor(color)}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                ))}
              </div>
              <span className="settings__form-hint" style={{ marginTop: 8, display: 'block' }}>
                Aktualny kolor: {settings.accentColor}
              </span>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="settings__section">
            <div className="settings__section-header">
              <div className="settings__section-icon settings__section-icon--green"><CreditCard size={18} /></div>
              <div>
                <div className="settings__section-title">Płatności i faktury</div>
                <div className="settings__section-desc">Zarządzaj metodami płatności i danymi do faktur</div>
              </div>
            </div>

            <div className="settings__form">
              <div style={{ marginTop: 0 }}>
                <label className="dash-label" style={{ marginBottom: 12 }}>Dane do faktur</label>
                <div className="settings__form-row">
                  <div className="settings__form-group">
                    <label className="dash-label">Firma / Imię i nazwisko</label>
                    <input className="dash-input" placeholder="np. Jan Kowalski" value={billingCompany} onChange={e => setBillingCompany(e.target.value)} />
                  </div>
                  <div className="settings__form-group">
                    <label className="dash-label">NIP (opcjonalnie)</label>
                    <input className="dash-input" placeholder="np. 1234567890" value={billingNip} onChange={e => setBillingNip(e.target.value)} />
                  </div>
                </div>
                <div className="settings__form-row" style={{ marginTop: 16 }}>
                  <div className="settings__form-group">
                    <label className="dash-label">Adres</label>
                    <input className="dash-input" placeholder="ul. Przykładowa 1" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
                  </div>
                  <div className="settings__form-group">
                    <label className="dash-label">Miasto i kod pocztowy</label>
                    <input className="dash-input" placeholder="00-001 Warszawa" value={billingCity} onChange={e => setBillingCity(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="settings__actions">
                <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
                  onClick={handleSaveBilling}>
                  <Save size={16} /> Zapisz dane
                </button>
              </div>
            </div>
          </div>
        );

      case 'danger':
        return (
          <div className="settings__section" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
            <div className="settings__section-header">
              <div className="settings__section-icon settings__section-icon--red"><AlertTriangle size={18} /></div>
              <div>
                <div className="settings__section-title" style={{ color: '#ef4444' }}>Strefa zagrożeń</div>
                <div className="settings__section-desc">Nieodwracalne akcje na koncie — zachowaj ostrożność</div>
              </div>
            </div>

            <div className="settings__danger-item">
              <div className="settings__danger-info">
                <span className="settings__danger-title">Eksportuj dane konta</span>
                <span className="settings__danger-desc">Pobierz wszystkie swoje dane, serwery i historię transakcji w formacie JSON</span>
              </div>
              <button className="btn btn--outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', whiteSpace: 'nowrap' }}
                onClick={handleExportData}>
                <Download size={14} /> Eksportuj
              </button>
            </div>

            <div className="settings__danger-item">
              <div className="settings__danger-info">
                <span className="settings__danger-title">Wyloguj ze wszystkich urządzeń</span>
                <span className="settings__danger-desc">Natychmiast zakończ wszystkie aktywne sesje i wyloguj się z konta</span>
              </div>
              <button className="btn btn--outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', whiteSpace: 'nowrap', color: '#f59e0b' }}
                onClick={() => {
                  removeAllOtherSessions(user.id);
                  logout();
                  toast.success('Wylogowano', 'Wszystkie sesje zostały zakończone');
                  navigate('/');
                }}>
                <LogOut size={14} /> Wyloguj
              </button>
            </div>

            <div className="settings__danger-item">
              <div className="settings__danger-info">
                <span className="settings__danger-title">Usuń konto</span>
                <span className="settings__danger-desc">
                  {confirmDeleteAccount
                    ? 'Czy na pewno? Kliknij ponownie aby potwierdzić trwałe usunięcie konta.'
                    : 'Trwale usuń swoje konto, wszystkie serwery i dane. Tej akcji nie można cofnąć.'}
                </span>
              </div>
              <button className="btn btn--outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                whiteSpace: 'nowrap', color: '#ef4444', borderColor: confirmDeleteAccount ? '#ef4444' : 'rgba(239,68,68,0.3)',
                background: confirmDeleteAccount ? 'rgba(239,68,68,0.1)' : 'transparent' }}
                onClick={handleDeleteAccount}>
                <Trash2 size={14} /> {confirmDeleteAccount ? 'Potwierdź usunięcie' : 'Usuń konto'}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title">Ustawienia</h1>
        <p className="dash-page__subtitle">Zarządzaj kontem, bezpieczeństwem i preferencjami</p>
      </div>

      <div className="settings">
        <nav className="settings__nav">
          {renderNav()}
        </nav>

        <div className="settings__content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
