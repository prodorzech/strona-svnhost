import { useApp } from '../context';
import { ArrowRight, LayoutDashboard, Users, Clock, Headphones } from 'lucide-react';
import './Hero.css';

export function Hero() {
  const { t } = useApp();

  return (
    <section className="hero" id="home">
      <div className="hero__bg">
        <div className="hero__glow hero__glow--1" />
        <div className="hero__glow hero__glow--2" />
        <div className="hero__grid" />
      </div>

      <div className="container hero__content">
        <div className="hero__badge">
          <span className="hero__badge-dot" />
          {t.hero.badge}
        </div>

        <h1 className="hero__title">
          {t.hero.title1}
          <span className="accent-text">{t.hero.titleAccent}</span>
          {t.hero.title2}
        </h1>

        <p className="hero__subtitle">{t.hero.subtitle}</p>

        <div className="hero__buttons">
          <a href="#pricing" className="btn btn-primary">
            {t.hero.cta}
            <ArrowRight size={18} />
          </a>
          <a href="#" className="btn btn-secondary">
            <LayoutDashboard size={18} />
            {t.hero.dashboard}
          </a>
        </div>

        <div className="hero__stats">
          <div className="hero__stat">
            <Users size={20} className="hero__stat-icon" />
            <div>
              <div className="hero__stat-value">{t.hero.stat1Value}</div>
              <div className="hero__stat-label">{t.hero.stat1Label}</div>
            </div>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <Clock size={20} className="hero__stat-icon" />
            <div>
              <div className="hero__stat-value">{t.hero.stat2Value}</div>
              <div className="hero__stat-label">{t.hero.stat2Label}</div>
            </div>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <Headphones size={20} className="hero__stat-icon" />
            <div>
              <div className="hero__stat-value">{t.hero.stat3Value}</div>
              <div className="hero__stat-label">{t.hero.stat3Label}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
