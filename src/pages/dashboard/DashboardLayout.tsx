import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { getLogoForAccent, updateFavicon } from '../../utils/logo';
import {
  LayoutDashboard, Server, Wallet, ShoppingCart, Ticket, Settings,
  LogOut, Menu, X, Shield, ChevronDown, User, Book,
} from 'lucide-react';
import './DashboardLayout.css';

export function DashboardLayout() {
  const navigate = useNavigate();
  const storeState = useStoreState();
  const user = getCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.settings?.accentColor && user.settings.accentColor !== '#ef4444') {
      const hex = user.settings.accentColor;
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
    }
    updateFavicon(user?.settings?.accentColor);
  }, [user?.settings?.accentColor]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const isAdmin = user.role === 'admin';
  const userServers = storeState.servers.filter(s => s.userId === user.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dash">
      {/* Sidebar */}
      <aside className={`dash__sidebar ${sidebarOpen ? 'dash__sidebar--open' : ''}`}>
        <div className="dash__sidebar-header">
          <a href="/" className="dash__logo">
            <img src={getLogoForAccent(user.settings?.accentColor)} alt="SVNHost" className="dash__logo-img" />
          </a>
          <button className="dash__sidebar-close" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="dash__nav">
          <div className="dash__nav-section">
            <span className="dash__nav-label">Panel</span>
            <NavLink to="/dashboard" end className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>
            <NavLink to="/dashboard/servers" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Server size={18} /> Serwery <span className="dash__nav-badge">{userServers.length}</span>
            </NavLink>
            <NavLink to="/dashboard/wallet" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Wallet size={18} /> Portfel
            </NavLink>
            <NavLink to="/dashboard/shop" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <ShoppingCart size={18} /> Sklep
            </NavLink>
            <NavLink to="/dashboard/tickets" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Ticket size={18} /> Tickety
            </NavLink>
            <NavLink to="/dashboard/settings" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Settings size={18} /> Ustawienia
            </NavLink>
            <NavLink to="/dashboard/wiki" className="dash__nav-link" onClick={() => setSidebarOpen(false)}>
              <Book size={18} /> Wiki
            </NavLink>
          </div>

          {isAdmin && (
            <div className="dash__nav-section">
              <span className="dash__nav-label">Administracja</span>
              <NavLink to="/admin" className="dash__nav-link dash__nav-link--admin" onClick={() => setSidebarOpen(false)}>
                <Shield size={18} /> Panel Admina
              </NavLink>
            </div>
          )}
        </nav>

        <div className="dash__sidebar-footer">
          <div className="dash__balance">
            <Wallet size={16} />
            <span>{user.balance.toFixed(2)} zł</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="dash__main">
        <header className="dash__header">
          <button className="dash__menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="dash__header-right">
            <div className="dash__user-menu">
              <button className="dash__user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="dash__user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : (
                    user.username.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="dash__user-name">{user.username}</span>
                <ChevronDown size={14} />
              </button>
              {userMenuOpen && (
                <div className="dash__user-dropdown">
                  <div className="dash__user-info">
                    <span className="dash__user-email">{user.email}</span>
                    <span className={`dash__user-role ${isAdmin ? 'dash__user-role--admin' : ''}`}>
                      {isAdmin ? 'Administrator' : 'Użytkownik'}
                    </span>
                  </div>
                  <NavLink to="/dashboard/settings" className="dash__user-option" onClick={() => setUserMenuOpen(false)}>
                    <User size={16} /> Profil
                  </NavLink>
                  <button className="dash__user-option dash__user-option--logout" onClick={handleLogout}>
                    <LogOut size={16} /> Wyloguj się
                  </button>
                </div>
              )}
            </div>
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
