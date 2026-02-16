import { useState, useEffect, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

// ── Toast types ────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  removing?: boolean;
}

// ── Toast store (singleton) ────────────────────────────────
let toasts: Toast[] = [];
let listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach(fn => fn());
}

export function toast(type: ToastType, title: string, message?: string, duration = 4000) {
  const id = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const t: Toast = { id, type, title, message, duration };
  toasts = [...toasts, t];
  notifyListeners();

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

export function removeToast(id: string) {
  // Mark as removing for exit animation
  toasts = toasts.map(t => t.id === id ? { ...t, removing: true } : t);
  notifyListeners();
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 300);
}

// Convenience methods
toast.success = (title: string, message?: string, duration?: number) => toast('success', title, message, duration);
toast.error = (title: string, message?: string, duration?: number) => toast('error', title, message, duration);
toast.warning = (title: string, message?: string, duration?: number) => toast('warning', title, message, duration);
toast.info = (title: string, message?: string, duration?: number) => toast('info', title, message, duration);

// ── Hook ───────────────────────────────────────────────────
function useToasts(): Toast[] {
  const [, setTick] = useState(0);

  useEffect(() => {
    const fn = () => setTick(t => t + 1);
    listeners.push(fn);
    return () => { listeners = listeners.filter(l => l !== fn); };
  }, []);

  return toasts;
}

// ── Icons ──────────────────────────────────────────────────
const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

// ── Single toast item ──────────────────────────────────────
function ToastItem({ t }: { t: Toast }) {
  const [progress, setProgress] = useState(100);
  const [visible, setVisible] = useState(false);
  const startRef = useRef(Date.now());
  const Icon = icons[t.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    if (!t.duration || t.duration <= 0) return;
    let raf: number;
    const animate = () => {
      const elapsed = Date.now() - startRef.current;
      const p = Math.max(0, 100 - (elapsed / t.duration!) * 100);
      setProgress(p);
      if (p > 0) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [t.duration]);

  return (
    <div className={`toast toast--${t.type} ${t.removing ? 'toast--removing' : ''} ${visible ? 'toast--visible' : ''}`}>
      <div className="toast__glow" />
      <div className="toast__body">
        <div className="toast__icon-wrap">
          <div className="toast__icon-ring" />
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <div className="toast__content">
          <div className="toast__title">{t.title}</div>
          {t.message && <div className="toast__message">{t.message}</div>}
        </div>
        <button className="toast__close" onClick={() => removeToast(t.id)} aria-label="Close">
          <X size={14} />
        </button>
      </div>
      {t.duration && t.duration > 0 && (
        <div className="toast__progress">
          <div className="toast__progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

// ── Container (mount once in App) ──────────────────────────
export function ToastContainer() {
  const items = useToasts();

  if (items.length === 0) return null;

  return (
    <div className="toast-container">
      {items.map(t => (
        <ToastItem key={t.id} t={t} />
      ))}
    </div>
  );
}
