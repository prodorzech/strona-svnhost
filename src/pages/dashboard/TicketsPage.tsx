import { useState } from 'react';
import { getCurrentUser, createTicket, replyTicket, closeTicket } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { toast } from '../../components/Toast';
import { CustomSelect } from '../../components/CustomSelect';
import type { TicketPriority, TicketCategory } from '../../store/types';
import {
  Ticket, Plus, MessageSquare, X, Send, Clock, CheckCircle, AlertCircle,
  ArrowLeft, Tag, AlertTriangle, Info, HelpCircle, Zap, ChevronDown,
  Hash, Calendar, Shield,
} from 'lucide-react';

const PRIORITY_MAP: Record<TicketPriority, { label: string; color: string; bg: string; icon: typeof Info }> = {
  low: { label: 'Niski', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Info },
  medium: { label: 'Średni', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle },
  high: { label: 'Wysoki', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertTriangle },
  critical: { label: 'Krytyczny', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: Zap },
};

const CATEGORY_MAP: Record<TicketCategory, { label: string; icon: typeof HelpCircle }> = {
  general: { label: 'Ogólne', icon: HelpCircle },
  technical: { label: 'Techniczne', icon: Tag },
  billing: { label: 'Płatności', icon: Tag },
  abuse: { label: 'Nadużycie', icon: AlertTriangle },
  other: { label: 'Inne', icon: Tag },
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  open: { label: 'Otwarty', color: '#eab308', bg: 'rgba(234,179,8,0.1)', icon: Clock },
  answered: { label: 'Odpowiedź', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  closed: { label: 'Zamknięty', color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)', icon: AlertCircle },
};

export function TicketsPage() {
  const store = useStoreState();
  const user = getCurrentUser();
  const [showNew, setShowNew] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [category, setCategory] = useState<TicketCategory>('general');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'answered' | 'closed'>('all');

  if (!user) return null;

  const myTickets = store.tickets.filter(t => t.userId === user.id);
  const filtered = filterStatus === 'all' ? myTickets : myTickets.filter(t => t.status === filterStatus);
  const activeTicket = selectedTicket ? store.tickets.find(t => t.id === selectedTicket) : null;

  const openCount = myTickets.filter(t => t.status === 'open').length;
  const answeredCount = myTickets.filter(t => t.status === 'answered').length;
  const closedCount = myTickets.filter(t => t.status === 'closed').length;

  const handleCreate = () => {
    if (!subject.trim()) { toast.error('Brak tematu', 'Podaj temat zgłoszenia'); return; }
    if (!message.trim()) { toast.error('Brak wiadomości', 'Opisz swój problem'); return; }
    const id = createTicket(user.id, subject.trim(), message.trim(), priority, category);
    setSubject('');
    setMessage('');
    setPriority('medium');
    setCategory('general');
    setShowNew(false);
    setSelectedTicket(id);
    toast.success('Ticket utworzony', 'Twoje zgłoszenie zostało wysłane');
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    replyTicket(selectedTicket, user.id, replyText.trim(), false);
    setReplyText('');
    toast.success('Wysłano', 'Twoja odpowiedź została dodana');
  };

  // ── Detail view ──────────────────────────────────────
  if (activeTicket) {
    const st = STATUS_MAP[activeTicket.status];
    const pr = PRIORITY_MAP[activeTicket.priority || 'medium'];
    const cat = CATEGORY_MAP[activeTicket.category || 'general'];
    const StIcon = st.icon;
    const PrIcon = pr.icon;
    const CatIcon = cat.icon;

    return (
      <div className="animate-fadeIn">
        <button onClick={() => setSelectedTicket(null)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
          <ArrowLeft size={16} /> Powrót do ticketów
        </button>

        {/* Ticket header */}
        <div className="dash-card animate-fadeInDown" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: 6, lineHeight: 1.4 }}>
                {activeTicket.subject}
              </h2>
              {activeTicket.adminLabel && (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, marginBottom: 6 }}>
                  <Tag size={12} style={{ marginRight: 4 }} />{activeTicket.adminLabel}
                </div>
              )}
              {activeTicket.description && (
                <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', marginBottom: 8, lineHeight: 1.5 }}>
                  {activeTicket.description}
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Hash size={12} /> {activeTicket.id.slice(0, 8)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={12} /> {new Date(activeTicket.createdAt).toLocaleString('pl-PL')}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CatIcon size={12} /> {cat.label}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.76rem', fontWeight: 600,
                background: pr.bg, color: pr.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <PrIcon size={12} /> {pr.label}
              </span>
              <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.76rem', fontWeight: 600,
                background: st.bg, color: st.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                <StIcon size={12} /> {st.label}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
          {activeTicket.messages.map((msg, idx) => {
            const msgUser = store.users.find(u => u.id === msg.userId);
            return (
              <div key={msg.id} className="animate-fadeInUp"
                style={{
                  padding: 16, animationDelay: `${idx * 0.06}s`,
                  borderRadius: 'var(--radius-lg)',
                  background: msg.isAdmin ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)',
                  border: `1px solid ${msg.isAdmin ? 'rgba(239,68,68,0.15)' : 'var(--border-primary)'}`,
                  marginLeft: msg.isAdmin ? 0 : 20,
                  marginRight: msg.isAdmin ? 20 : 0,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700,
                      background: msg.isAdmin ? 'rgba(239,68,68,0.1)' : 'var(--bg-tertiary)',
                      color: msg.isAdmin ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {msg.isAdmin ? <Shield size={14} /> : (msgUser?.username?.charAt(0).toUpperCase() || '?')}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: msg.isAdmin ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {msg.isAdmin ? 'Support SVNHost' : (msgUser?.username || 'Ty')}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {new Date(msg.createdAt).toLocaleString('pl-PL')}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-wrap', paddingLeft: 36 }}>
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply box */}
        {activeTicket.status !== 'closed' ? (
          <div className="dash-card">
            <label className="dash-label" style={{ marginBottom: 8 }}>Twoja odpowiedź</label>
            <textarea className="dash-input" rows={3} placeholder="Napisz odpowiedź..."
              value={replyText} onChange={e => setReplyText(e.target.value)}
              style={{ resize: 'vertical', marginBottom: 12 }} />
            <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
              onClick={handleReply}>
              <Send size={16} /> Wyślij odpowiedź
            </button>
          </div>
        ) : (
          <div className="dash-card" style={{ textAlign: 'center', padding: 24, color: 'var(--text-tertiary)' }}>
            <AlertCircle size={20} style={{ marginBottom: 6 }} />
            <p style={{ fontSize: '0.88rem' }}>Ten ticket został zamknięty{activeTicket.closedAt ? ` dnia ${new Date(activeTicket.closedAt).toLocaleDateString('pl-PL')}` : ''}</p>
          </div>
        )}
      </div>
    );
  }

  // ── Create new ticket modal/form ─────────────────────
  if (showNew) {
    const selectedPr = PRIORITY_MAP[priority];
    const PrSelIcon = selectedPr.icon;

    return (
      <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 800 }}>
          <button onClick={() => setShowNew(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
            <ArrowLeft size={16} /> Powrót do ticketów
          </button>

          {/* Header card */}
          <div className="dash-card animate-fadeInDown" style={{ marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: '2px solid var(--accent)', padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)',
                boxShadow: '0 0 20px rgba(239,68,68,0.1)',
              }}>
                <Plus size={22} />
              </div>
              <div>
                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: 2 }}>Nowe zgłoszenie</h2>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', margin: 0 }}>Opisz swój problem, a nasz zespół odpowie jak najszybciej</p>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="dash-card animate-fadeInUp" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0, padding: '28px 32px' }}>
            <div style={{ display: 'grid', gap: 22 }}>
              {/* Subject */}
              <div>
                <label className="dash-label" style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  Temat zgłoszenia <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input className="dash-input" placeholder="np. Problem z serwerem FiveM"
                  value={subject} onChange={e => setSubject(e.target.value)}
                  style={{ padding: '12px 16px', fontSize: '0.92rem' }} />
              </div>

              {/* Category + Priority as visual cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="dash-label" style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>Kategoria</label>
                  <CustomSelect
                    value={category}
                    onChange={val => setCategory(val as TicketCategory)}
                    options={Object.entries(CATEGORY_MAP).map(([key, val]) => ({ value: key, label: val.label }))}
                  />
                </div>
                <div>
                  <label className="dash-label" style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>Priorytet</label>
                  <CustomSelect
                    value={priority}
                    onChange={val => setPriority(val as TicketPriority)}
                    options={Object.entries(PRIORITY_MAP).map(([key, val]) => ({ value: key, label: val.label }))}
                  />
                </div>
              </div>

              {/* Priority preview badges */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {(Object.entries(PRIORITY_MAP) as [TicketPriority, typeof PRIORITY_MAP[TicketPriority]][]).map(([key, val]) => {
                  const Icon = val.icon;
                  const active = priority === key;
                  return (
                    <button key={key} onClick={() => setPriority(key)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 14px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem', fontWeight: 600,
                        background: active ? val.bg : 'var(--bg-tertiary)',
                        color: active ? val.color : 'var(--text-tertiary)',
                        border: active ? `1.5px solid ${val.color}` : '1.5px solid transparent',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}>
                      <Icon size={12} /> {val.label}
                    </button>
                  );
                })}
              </div>

              {/* Message */}
              <div>
                <label className="dash-label" style={{ fontSize: '0.84rem', fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  Opis problemu <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <textarea className="dash-input" rows={7} placeholder="Opisz problem szczegółowo. Im więcej informacji podasz, tym szybciej pomożemy..."
                  value={message} onChange={e => setMessage(e.target.value)}
                  style={{ resize: 'vertical', minHeight: 160, padding: '14px 16px', fontSize: '0.9rem', lineHeight: 1.6 }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: 'var(--text-tertiary)', marginTop: 6 }}>
                  <Info size={12} />
                  Podaj jak najwięcej szczegółów: nazwa serwera, logi błędów, kroki do odtworzenia problemu
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid var(--border-secondary)', justifyContent: 'flex-end' }}>
                <button className="btn btn--outline" style={{ padding: '11px 24px', fontSize: '0.88rem' }}
                  onClick={() => setShowNew(false)}>
                  Anuluj
                </button>
                <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 28px', fontSize: '0.88rem', fontWeight: 700 }}
                  onClick={handleCreate}>
                  <Send size={16} /> Wyślij zgłoszenie
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Ticket list ──────────────────────────────────────
  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="dash-page__title">Wsparcie</h1>
          <p className="dash-page__subtitle">Zgłoszenia i kontakt z zespołem technicznym</p>
        </div>
        <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
          onClick={() => setShowNew(true)}>
          <Plus size={16} /> Nowy ticket
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Wszystkie', count: myTickets.length, color: 'var(--text-primary)', filter: 'all' as const },
          { label: 'Otwarte', count: openCount, color: '#eab308', filter: 'open' as const },
          { label: 'Odpowiedzi', count: answeredCount, color: '#22c55e', filter: 'answered' as const },
          { label: 'Zamknięte', count: closedCount, color: '#a1a1aa', filter: 'closed' as const },
        ].map(s => (
          <button key={s.filter} onClick={() => setFilterStatus(s.filter)}
            className="dash-card animate-fadeInUp"
            style={{
              cursor: 'pointer', textAlign: 'center', padding: '14px 12px', border: 'none',
              outline: filterStatus === s.filter ? `2px solid ${s.color}` : undefined,
              background: filterStatus === s.filter ? 'var(--bg-card)' : 'var(--bg-card)',
            }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Your user ID */}
      <div style={{ marginBottom: 16, fontSize: '0.78rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Hash size={12} /> Twoje ID: <code style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>{user.id}</code>
      </div>

      {/* Tickets list */}
      {filtered.length === 0 ? (
        <div className="dash-card dash-empty animate-scaleIn">
          <Ticket size={48} />
          <p style={{ marginTop: 8 }}>
            {filterStatus === 'all' ? 'Nie masz jeszcze żadnych ticketów' : `Brak ticketów ze statusem "${STATUS_MAP[filterStatus]?.label}"`}
          </p>
          {filterStatus === 'all' && (
            <button className="btn btn--primary" style={{ marginTop: 12, padding: '8px 16px', fontSize: '0.85rem' }}
              onClick={() => setShowNew(true)}>
              <Plus size={14} style={{ marginRight: 4 }} /> Utwórz pierwsze zgłoszenie
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.slice().reverse().map((ticket, idx) => {
            const st = STATUS_MAP[ticket.status];
            const pr = PRIORITY_MAP[ticket.priority || 'medium'];
            const StIcon = st.icon;
            const PrIcon = pr.icon;
            const lastMsg = ticket.messages[ticket.messages.length - 1];
            return (
              <div key={ticket.id}
                className="dash-card animate-fadeInUp"
                style={{ cursor: 'pointer', padding: '16px 20px', animationDelay: `${idx * 0.04}s`, transition: 'border-color 0.15s ease' }}
                onClick={() => setSelectedTicket(ticket.id)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-primary)')}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                        {ticket.subject}
                      </span>
                      {ticket.adminLabel && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--accent)', fontWeight: 600, background: 'var(--accent-glow)',
                          padding: '2px 7px', borderRadius: 'var(--radius-full)' }}>
                          {ticket.adminLabel}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>
                      {lastMsg?.text}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                      background: pr.bg, color: pr.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <PrIcon size={10} /> {pr.label}
                    </span>
                    <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                      background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                      <MessageSquare size={12} /> {ticket.messages.length}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  <span>#{ticket.id.slice(0, 8)}</span>
                  <span>{new Date(ticket.createdAt).toLocaleDateString('pl-PL')}</span>
                  <span>{CATEGORY_MAP[ticket.category || 'general'].label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
