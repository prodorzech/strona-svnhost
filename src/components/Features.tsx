import { useApp } from '../context';
import { Cpu, Shield, Database, Headphones } from 'lucide-react';
import './Features.css';

const icons = [Cpu, Shield, Database, Headphones];

export function Features() {
  const { t } = useApp();

  return (
    <section className="features section" id="features">
      <div className="container">
        <h2 className="section-title">
          {t.features.title}
        </h2>
        <p className="section-subtitle">{t.features.subtitle}</p>

        <div className="features__grid">
          {t.features.cards.map((card, i) => {
            const Icon = icons[i];
            return (
              <div className="features__card" key={i}>
                <div className="features__card-icon">
                  <Icon size={28} />
                </div>
                <h3 className="features__card-title">{card.title}</h3>
                <p className="features__card-desc">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
