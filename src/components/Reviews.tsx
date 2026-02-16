import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import './Reviews.css';

export function Reviews() {
  const { t } = useApp();
  const [active, setActive] = useState(0);
  const total = t.reviews.items.length;

  const next = useCallback(() => setActive((prev) => (prev + 1) % total), [total]);
  const prev = useCallback(() => setActive((prev) => (prev - 1 + total) % total), [total]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="reviews section" id="reviews">
      <div className="container">
        <h2 className="section-title">{t.reviews.title}</h2>
        <p className="section-subtitle">{t.reviews.subtitle}</p>

        <div className="reviews__carousel">
          <button className="reviews__arrow reviews__arrow--left" onClick={prev} aria-label="Previous">
            <ChevronLeft size={24} />
          </button>

          <div className="reviews__track">
            {t.reviews.items.map((item: { name: string; role: string; text: string }, i: number) => (
              <div
                className={`reviews__card ${i === active ? 'reviews__card--active' : ''}`}
                key={i}
              >
                <Quote size={32} className="reviews__quote" />
                <div className="reviews__stars">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={16} fill="var(--accent)" color="var(--accent)" />
                  ))}
                </div>
                <p className="reviews__text">{item.text}</p>
                <div className="reviews__author">
                  <div className="reviews__avatar">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <div className="reviews__name">{item.name}</div>
                    <div className="reviews__role">{item.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="reviews__arrow reviews__arrow--right" onClick={next} aria-label="Next">
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="reviews__dots">
          {t.reviews.items.map((_: { name: string; role: string; text: string }, i: number) => (
            <button
              key={i}
              className={`reviews__dot ${i === active ? 'reviews__dot--active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
