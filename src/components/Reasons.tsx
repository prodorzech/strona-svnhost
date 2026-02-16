import { useApp } from '../context';
import { Droplets, Building2, ShieldCheck, HardDrive, Network } from 'lucide-react';
import './Reasons.css';

const icons = [Droplets, Building2, ShieldCheck, HardDrive, Network];

export function Reasons() {
  const { t } = useApp();

  return (
    <section className="reasons section">
      <div className="container">
        <h2 className="section-title">{t.reasons.title}</h2>
        <p className="section-subtitle">{t.reasons.subtitle}</p>

        <div className="reasons__grid">
          {t.reasons.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <div className="reasons__card" key={i}>
                <div className="reasons__card-inner">
                  <div className="reasons__card-number">{i + 1}</div>
                  <div className="reasons__card-icon">
                    <Icon size={24} />
                  </div>
                  <h3 className="reasons__card-title">{item.title}</h3>
                  <p className="reasons__card-desc">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
