import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { getLogoForAccent } from '../../utils/logo';
import {
  Shield, LayoutDashboard, Users, Server, Tag, ArrowLeft,
  Menu, X, LogOut, MessageSquare, Network, Package, Settings, DollarSign,
} from 'lucide-react';
import { useState } from 'react';

export function AdminLayout() {
  const navigate = useNavigate();
  const store = useStoreState();
  const user = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="dash">
      <aside className={`dash__sidebar ${sidebarOpen ? 'dash__sidebar--open' : ''}`}>
        <div className="dash__sidebar-header">
          <a href="/" className="dash__logo">
            <img src={getLogoForAccent(user?.settings?.accentColor)} alt="SVNHost" className="dash__logo-img" />
          </a>
          <button className="dash__sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="dash__nav">
          <div className="dash__nav-section">
            <span className="dash__nav-label">Administracja</span>
            <NavLink to="/admin" end className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/admin/users" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Users size={18} /> Użytkownicy <span className="dash__nav-badge">{store.users.length}</span>
            </NavLink>
            <NavLink to="/admin/servers" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Server size={18} /> Serwery <span className="dash__nav-badge">{store.servers.length}</span>
            </NavLink>
            <NavLink to="/admin/codes" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Tag size={18} /> Kody promocyjne
            </NavLink>
            <NavLink to="/admin/tickets" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <MessageSquare size={18} /> Tickety
              {store.tickets.filter(t => t.status === 'open').length > 0 && (
                <span className="dash__nav-badge" style={{ background: '#eab308', color: '#000' }}>
                  {store.tickets.filter(t => t.status === 'open').length}
                </span>
              )}
            </NavLink>
          </div>

          <div className="dash__nav-section">
            <span className="dash__nav-label">Konfiguracja</span>
            <NavLink to="/admin/infrastructure" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Network size={18} /> Infrastruktura
              <span className="dash__nav-badge">{store.nodes.length}</span>
            </NavLink>
            <NavLink to="/admin/plans" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Package size={18} /> Oferty
            </NavLink>
            <NavLink to="/admin/pricing" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <DollarSign size={18} /> Cennik
            </NavLink>
            <NavLink to="/admin/settings" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Settings size={18} /> Ustawienia
            </NavLink>
          </div>

          <div className="dash__nav-section">
            <span className="dash__nav-label">Nawigacja</span>
            <NavLink to="/dashboard" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <ArrowLeft size={18} /> Panel klienta
            </NavLink>
          </div>
        </nav>

        <div className="dash__sidebar-footer">
          <button className="dash__user-option dash__user-option--logout" style={{ border: 'none', width: '100%' }}
            onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} /> Wyloguj się
          </button>
        </div>
      </aside>

      <div className="dash__main">
        <header className="dash__header">
          <button className="dash__menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="dash__header-right">
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Zalogowany jako <strong style={{ color: 'var(--accent)' }}>{user.username}</strong>
            </span>
          </div>
        </header>
        <div className="dash__content">
          <Outlet />
        </div>
      </div>

      {sidebarOpen && <div className="dash__overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
