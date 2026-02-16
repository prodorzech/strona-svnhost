import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { Moon, Sun, Menu, X, Globe, ChevronDown, LogIn } from 'lucide-react';
import type { Language } from '../i18n';
import { languageNames, languageFlags } from '../i18n';
import { getCurrentUser } from '../store/store';
import { getLogoForAccent } from '../utils/logo';
import './Navbar.css';

export function Navbar() {
  const { theme, toggleTheme, language, setLanguage, t } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const navLinks = [
    { label: t.nav.home, href: '#' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.features, href: '#features' },
    { label: t.nav.reviews, href: '#reviews' },
  ];

  const languages: Language[] = ['pl', 'en', 'de', 'uk'];

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <a href="#" className="navbar__logo">
          <img src={getLogoForAccent(getCurrentUser()?.settings?.accentColor)} alt="SVNHost" className="navbar__logo-img" />
        </a>

        <ul className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.href + link.label}>
              <a
                href={link.href}
                className="navbar__link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="navbar__actions">
          {/* Panel Klienta button */}
          <a
            href={getCurrentUser() ? '/dashboard' : '/login'}
            className="navbar__panel-btn"
          >
            <LogIn size={16} />
            <span>{t.nav.dashboard}</span>
          </a>

          {/* Language switcher */}
          <div className="navbar__lang" ref={langRef}>
            <button
              className="navbar__lang-btn"
              onClick={() => setLangOpen(!langOpen)}
              aria-label="Change language"
            >
              <Globe size={18} />
              <span>{languageFlags[language]}</span>
              <ChevronDown size={14} className={langOpen ? 'rotated' : ''} />
            </button>
            {langOpen && (
              <div className="navbar__lang-dropdown">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    className={`navbar__lang-option ${lang === language ? 'active' : ''}`}
                    onClick={() => {
                      setLanguage(lang);
                      setLangOpen(false);
                    }}
                  >
                    <span>{languageFlags[lang]}</span>
                    <span>{languageNames[lang]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            className="navbar__theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Mobile menu button */}
          <button
            className="navbar__mobile-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
