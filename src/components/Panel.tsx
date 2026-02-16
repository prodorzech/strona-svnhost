import { useApp } from '../context';
import { Activity, SlidersHorizontal, Download, Plug } from 'lucide-react';
import './Panel.css';

const icons = [Activity, SlidersHorizontal, Download, Plug];

export function Panel() {
  const { t } = useApp();

  return (
    <section className="panel section">
      <div className="container">
        <h2 className="section-title">{t.panel.title}</h2>
        <p className="section-subtitle">{t.panel.subtitle}</p>

        <div className="panel__grid">
          {t.panel.features.map((feat, i) => {
            const Icon = icons[i];
            return (
              <div className="panel__card" key={i}>
                <div className="panel__card-number">{String(i + 1).padStart(2, '0')}</div>
                <div className="panel__card-icon">
                  <Icon size={24} />
                </div>
                <h3 className="panel__card-title">{feat.title}</h3>
                <p className="panel__card-desc">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
