import { useApp } from '../context';
import { Check, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../store/store';
import './Pricing.css';

export function Pricing() {
  const { t } = useApp();
  const navigate = useNavigate();

  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    const user = getCurrentUser();
    navigate(user ? '/dashboard' : '/login');
  };

  return (
    <section className="pricing section" id="pricing">
      <div className="container">
        <h2 className="section-title">{t.pricing.title}</h2>
        <p className="section-subtitle">{t.pricing.subtitle}</p>

        <div className="pricing__grid">
          {t.pricing.plans.map((plan: { name: string; price: string; period: string; features: string[] }, i: number) => {
            const isPopular = i === 1;
            return (
              <div
                className={`pricing__card ${isPopular ? 'pricing__card--popular' : ''}`}
                key={i}
              >
                {isPopular && (
                  <div className="pricing__badge">
                    <Star size={14} />
                    {t.pricing.popular}
                  </div>
                )}
                <h3 className="pricing__name">{plan.name}</h3>
                <div className="pricing__price">
                  {plan.price}
                  <span className="pricing__period">{plan.period}</span>
                </div>
                <ul className="pricing__features">
                  {plan.features.map((feat: string, j: number) => (
                    <li key={j}>
                      <Check size={16} className="pricing__check" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleOrder}
                  className={`btn ${isPopular ? 'btn-primary' : 'btn-outline'} pricing__btn`}
                >
                  {t.pricing.btn}
                  <ArrowRight size={16} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
