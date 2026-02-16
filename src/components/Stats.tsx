import { useEffect, useRef, useState } from 'react';
import { useApp } from '../context';
import { useStoreState } from '../store/useStore';
import './Stats.css';

function AnimatedValue({ target }: { target: string }) {
  const [display, setDisplay] = useState(target);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Extract number from target
          const numMatch = target.match(/[\d.]+/);
          if (numMatch) {
            const num = parseFloat(numMatch[0]);
            const prefix = target.slice(0, target.indexOf(numMatch[0]));
            const suffix = target.slice(target.indexOf(numMatch[0]) + numMatch[0].length);
            const duration = 1500;
            const startTime = performance.now();

            const animate = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(eased * num * 10) / 10;
              
              if (Number.isInteger(num)) {
                setDisplay(`${prefix}${Math.round(eased * num)}${suffix}`);
              } else {
                setDisplay(`${prefix}${current.toFixed(1)}${suffix}`);
              }

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                setDisplay(target);
              }
            };

            requestAnimationFrame(animate);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <div ref={ref} className="stats__value">{display}</div>;
}

export function Stats() {
  const { t, language } = useApp();
  const store = useStoreState();

  // Real data from store
  const totalClients = store.users.length;
  const activeServers = store.servers.filter(s => s.status === 'running').length;
  const totalServers = store.servers.length;

  // Override first two stats with real data, keep rest from i18n
  const items = t.stats.items.map((item, i) => {
    if (i === 0) return { ...item, value: `${totalClients}` };
    if (i === 1) return { ...item, value: `${activeServers}/${totalServers}` };
    return item;
  });

  // Rename labels for real data
  const labelOverrides: Record<string, Record<number, string>> = {
    pl: { 1: 'Aktywnych serwerów' },
    en: { 1: 'Active servers' },
    de: { 1: 'Aktive Server' },
    ua: { 1: 'Активних серверів' },
  };

  return (
    <section className="stats section">
      <div className="container">
        <h2 className="section-title">{t.stats.title}</h2>
        <p className="section-subtitle">{t.stats.subtitle}</p>

        <div className="stats__grid">
          {items.map((item, i: number) => {
            const overrideLabel = labelOverrides[language]?.[i];
            return (
              <div className="stats__card" key={i}>
                <AnimatedValue target={item.value} />
                <div className="stats__label">{overrideLabel || item.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
