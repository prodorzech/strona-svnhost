import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { Language } from './i18n';
import { translations } from './i18n';
import { AppContext } from './context';
import type { Theme } from './context';
import { getCurrentUser, loadCurrentUser } from './store/store';
import { useStoreState } from './store/useStore';
import { getToken } from './services/backendApi';

// Landing page
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Services } from './components/Services';
import { Panel } from './components/Panel';
import { Pricing } from './components/Pricing';
import { Stats } from './components/Stats';
import { Reviews } from './components/Reviews';
import { Reasons } from './components/Reasons';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

// Auth
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Dashboard
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { ServersPage } from './pages/dashboard/ServersPage';
import { ServerDetail } from './pages/dashboard/ServerDetail';
import { WalletPage } from './pages/dashboard/WalletPage';
import { ShopPage } from './pages/dashboard/ShopPage';
import { TicketsPage } from './pages/dashboard/TicketsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { WikiPage } from './pages/dashboard/WikiPage';

// Admin
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminServers } from './pages/admin/AdminServers';
import { AdminCodes } from './pages/admin/AdminCodes';
import { AdminTickets } from './pages/admin/AdminTickets';
import { AdminInfrastructure } from './pages/admin/AdminInfrastructure';
import { AdminPlans } from './pages/admin/AdminPlans';
import { AdminPricing } from './pages/admin/AdminPricing';
import { AdminSettingsPage } from './pages/admin/AdminSettings';
import { ToastContainer } from './components/Toast';

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Services />
        <Panel />
        <Pricing />
        <Stats />
        <Reviews />
        <Reasons />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function ProtectedRoute({ children, authLoading }: { children: React.ReactNode; authLoading: boolean }) {
  const _store = useStoreState();
  const user = getCurrentUser();
  if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Ładowanie...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children, authLoading }: { children: React.ReactNode; authLoading: boolean }) {
  const _store = useStoreState();
  const user = getCurrentUser();
  if (authLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>Ładowanie...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('svnhost-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('svnhost-lang') as Language;
    return saved && translations[saved] ? saved : 'pl';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('svnhost-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('svnhost-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // ── Restore session from backend token on startup ────
  const [authLoading, setAuthLoading] = useState(() => !!getToken());
  useEffect(() => {
    if (!getToken()) return;
    loadCurrentUser().finally(() => setAuthLoading(false));
  }, []);

  const t = translations[language];

  return (
    <AppContext.Provider value={{ theme, setTheme, toggleTheme, language, setLanguage, t }}>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute authLoading={authLoading}><DashboardLayout /></ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="servers" element={<ServersPage />} />
            <Route path="servers/:id" element={<ServerDetail />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="wiki" element={<WikiPage />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <AdminRoute authLoading={authLoading}><AdminLayout /></AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="servers" element={<AdminServers />} />
            <Route path="codes" element={<AdminCodes />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="infrastructure" element={<AdminInfrastructure />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="pricing" element={<AdminPricing />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
