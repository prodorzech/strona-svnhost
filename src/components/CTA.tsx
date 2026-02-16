import { useApp } from '../context';
import { ArrowRight } from 'lucide-react';
import './CTA.css';

export function CTA() {
  const { t } = useApp();

  return (
    <section className="cta-section section" id="contact">
      <div className="container">
        <div className="cta-section__card">
          <div className="cta-section__glow" />
          <h2 className="cta-section__title">{t.cta.title}</h2>
          <p className="cta-section__subtitle">{t.cta.subtitle}</p>
          <div className="cta-section__buttons">
            <a href="#pricing" className="btn btn-primary">
              {t.cta.btn}
              <ArrowRight size={18} />
            </a>
            <a href="#" className="btn btn-secondary">
              {t.cta.discord}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
