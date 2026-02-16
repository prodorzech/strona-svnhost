import { useApp } from '../context';
import { Server, Gamepad2, Blocks, Bot, Check, ArrowRight } from 'lucide-react';
import './Services.css';

const icons = [Server, Gamepad2, Blocks, Bot];
const cardColors = ['#3b82f6', '#f97316', '#22c55e', '#8b5cf6'];

export function Services() {
  const { t } = useApp();

  return (
    <section className="services section" id="services">
      <div className="container">
        <h2 className="section-title">{t.services.title}</h2>
        <p className="section-subtitle">{t.services.subtitle}</p>

        <div className="services__grid">
          {t.services.cards.map((card: { name: string; description: string; features: string[]; price: string; period: string }, i: number) => {
            const Icon = icons[i] || Server;
            const color = cardColors[i] || '#ef4444';
            return (
              <div className="services__card" key={i} style={{ '--card-accent': color } as React.CSSProperties}>
                <div className="services__card-header">
                  <div className="services__card-icon" style={{ background: `${color}15`, color }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="services__card-name">{card.name}</h3>
                </div>
                <p className="services__card-desc">{card.description}</p>
                <ul className="services__card-features">
                  {card.features.map((feat: string, j: number) => (
                    <li key={j}>
                      <Check size={16} className="services__check" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <div className="services__card-footer">
                  <div className="services__card-price">
                    {card.price}
                    <span className="services__card-period">{card.period}</span>
                  </div>
                  <a href="#pricing" className="services__card-btn">
                    <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
