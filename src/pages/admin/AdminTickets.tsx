import { useState } from 'react';
import { replyTicket, closeTicket, reopenTicket, updateTicket, getCurrentUser } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { toast } from '../../components/Toast';
import type { TicketPriority, TicketCategory } from '../../store/types';
import { CustomSelect } from '../../components/CustomSelect';
import {
  MessageSquare, Send, Clock, CheckCircle, AlertCircle, X, Tag,
  AlertTriangle, Info, Zap, HelpCircle, ArrowLeft, Shield,
  Hash, Calendar, User, Mail, CreditCard, Search, Filter,
  RotateCcw, Edit3, ChevronDown, Eye,
} from 'lucide-react';

const PRIORITY_MAP: Record<TicketPriority, { label: string; color: string; bg: string; icon: typeof Info }> = {
  low: { label: 'Niski', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Info },
  medium: { label: 'Średni', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle },
  high: { label: 'Wysoki', color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertTriangle },
  critical: { label: 'Krytyczny', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: Zap },
};

const CATEGORY_MAP: Record<TicketCategory, string> = {
  general: 'Ogólne', technical: 'Techniczne', billing: 'Płatności', abuse: 'Nadużycie', other: 'Inne',
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Otwarty', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  answered: { label: 'Odpowiedź', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  closed: { label: 'Zamknięty', color: '#a1a1aa', bg: 'rgba(161,161,170,0.1)' },
};

export function AdminTickets() {
  const store = useStoreState();
  const admin = getCurrentUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'answered' | 'closed'>('all');
  const [search, setSearch] = useState('');
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelText, setLabelText] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descText, setDescText] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);

  if (!admin) return null;

  const allTickets = store.tickets;
  const filtered = allTickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const tUser = store.users.find(u => u.id === t.userId);
      if (
        !t.subject.toLowerCase().includes(q) &&
        !t.id.toLowerCase().includes(q) &&
        !(t.adminLabel || '').toLowerCase().includes(q) &&
        !(tUser?.username || '').toLowerCase().includes(q) &&
        !(tUser?.email || '').toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  const openCount = allTickets.filter(t => t.status === 'open').length;
  const answeredCount = allTickets.filter(t => t.status === 'answered').length;
  const closedCount = allTickets.filter(t => t.status === 'closed').length;

  const activeTicket = selectedId ? allTickets.find(t => t.id === selectedId) : null;
  const ticketUser = activeTicket ? store.users.find(u => u.id === activeTicket.userId) : null;

  const handleReply = () => {
    if (!replyText.trim() || !selectedId) return;
    replyTicket(selectedId, admin.id, replyText.trim(), true);
    setReplyText('');
    toast.success('Odpowiedź wysłana', 'Wiadomość została dodana do ticketa');
  };

  const handleSaveLabel = () => {
    if (!selectedId) return;
    updateTicket(selectedId, { adminLabel: labelText.trim() || undefined });
    setEditingLabel(false);
    toast.success('Label zapisany', 'Etykieta ticketa została zaktualizowana');
  };

  const handleSaveDesc = () => {
    if (!selectedId) return;
    updateTicket(selectedId, { description: descText.trim() || undefined });
    setEditingDesc(false);
    toast.success('Opis zapisany', 'Opis ticketa został zaktualizowany');
  };

  const handlePriority = (p: TicketPriority) => {
    if (!selectedId) return;
    updateTicket(selectedId, { priority: p });
    toast.info('Priorytet zmieniony', `Nowy priorytet: ${PRIORITY_MAP[p].label}`);
  };

  const handleCategory = (c: TicketCategory) => {
    if (!selectedId) return;
    updateTicket(selectedId, { category: c });
    toast.info('Kategoria zmieniona', `Nowa kategoria: ${CATEGORY_MAP[c]}`);
  };

  // ── Detail view ──────────────────────────────────────
  if (activeTicket) {
    const st = STATUS_MAP[activeTicket.status];
    const pr = PRIORITY_MAP[activeTicket.priority || 'medium'];

    return (
      <div className="animate-fadeIn">
        <button onClick={() => { setSelectedId(null); setShowUserInfo(false); setEditingLabel(false); setEditingDesc(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
          <ArrowLeft size={16} /> Powrót do listy ticketów
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
          {/* Main column */}
          <div>
            {/* Header */}
            <div className="dash-card animate-fadeInDown" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4, lineHeight: 1.4 }}>
                    {activeTicket.subject}
                  </h2>
                  {/* Admin label */}
                  {editingLabel ? (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                      <input className="dash-input" value={labelText} onChange={e => setLabelText(e.target.value)}
                        placeholder="Etykieta admina..." style={{ padding: '5px 10px', fontSize: '0.82rem', maxWidth: 240 }} />
                      <button className="btn btn--primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={handleSaveLabel}>Zapisz</button>
                      <button className="btn btn--outline" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => setEditingLabel(false)}>×</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      {activeTicket.adminLabel ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, background: 'var(--accent-glow)',
                          padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                          <Tag size={10} style={{ marginRight: 3 }} />{activeTicket.adminLabel}
                        </span>
                      ) : null}
                      <button onClick={() => { setLabelText(activeTicket.adminLabel || ''); setEditingLabel(true); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Edit3 size={11} /> {activeTicket.adminLabel ? 'Edytuj' : 'Dodaj etykietę'}
                      </button>
                    </div>
                  )}

                  {/* Description */}
                  {editingDesc ? (
                    <div style={{ marginBottom: 8 }}>
                      <textarea className="dash-input" value={descText} onChange={e => setDescText(e.target.value)}
                        placeholder="Notatka / opis ticketa (widoczna dla użytkownika)..." rows={2}
                        style={{ fontSize: '0.82rem', resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button className="btn btn--primary" style={{ padding: '5px 12px', fontSize: '0.78rem' }} onClick={handleSaveDesc}>Zapisz</button>
                        <button className="btn btn--outline" style={{ padding: '5px 10px', fontSize: '0.78rem' }} onClick={() => setEditingDesc(false)}>×</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {activeTicket.description && (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          {activeTicket.description}
                        </span>
                      )}
                      <button onClick={() => { setDescText(activeTicket.description || ''); setEditingDesc(true); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Edit3 size={11} /> {activeTicket.description ? 'Edytuj opis' : 'Dodaj opis'}
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Hash size={11} />{activeTicket.id.slice(0, 8)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={11} />{new Date(activeTicket.createdAt).toLocaleString('pl-PL')}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                    background: pr.bg, color: pr.color }}>{pr.label}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                    background: st.bg, color: st.color }}>{st.label}</span>
                </div>
              </div>

              {/* Actions bar */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border-secondary)' }}>
                {activeTicket.status !== 'closed' ? (
                  <button className="btn btn--outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => { closeTicket(activeTicket.id); toast.success('Ticket zamknięty', 'Zgłoszenie zostało zamknięte'); }}>
                    <X size={14} /> Zamknij
                  </button>
                ) : (
                  <button className="btn btn--outline" style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                    onClick={() => { reopenTicket(activeTicket.id); toast.success('Ticket otwarty', 'Zgłoszenie zostało ponownie otwarte'); }}>
                    <RotateCcw size={14} /> Otwórz ponownie
                  </button>
                )}
                {/* Priority select */}
                <CustomSelect
                  value={activeTicket.priority || 'medium'}
                  onChange={val => handlePriority(val as TicketPriority)}
                  options={[
                    { value: 'low', label: 'Priorytet: Niski' },
                    { value: 'medium', label: 'Priorytet: Średni' },
                    { value: 'high', label: 'Priorytet: Wysoki' },
                    { value: 'critical', label: 'Priorytet: Krytyczny' },
                  ]}
                  style={{ width: 'auto', minWidth: 180 }}
                />
                {/* Category select */}
                <CustomSelect
                  value={activeTicket.category || 'general'}
                  onChange={val => handleCategory(val as TicketCategory)}
                  options={[
                    { value: 'general', label: 'Kat: Ogólne' },
                    { value: 'technical', label: 'Kat: Techniczne' },
                    { value: 'billing', label: 'Kat: Płatności' },
                    { value: 'abuse', label: 'Kat: Nadużycie' },
                    { value: 'other', label: 'Kat: Inne' },
                  ]}
                  style={{ width: 'auto', minWidth: 180 }}
                />
              </div>
            </div>

            {/* Messages */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {activeTicket.messages.map((msg, idx) => {
                const msgUser = store.users.find(u => u.id === msg.userId);
                return (
                  <div key={msg.id} className="animate-fadeInUp"
                    style={{
                      padding: 16, animationDelay: `${idx * 0.05}s`,
                      borderRadius: 'var(--radius-lg)',
                      background: msg.isAdmin ? 'rgba(239,68,68,0.04)' : 'var(--bg-card)',
                      border: `1px solid ${msg.isAdmin ? 'rgba(239,68,68,0.15)' : 'var(--border-primary)'}`,
                      marginLeft: msg.isAdmin ? 20 : 0,
                      marginRight: msg.isAdmin ? 0 : 20,
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
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: msg.isAdmin ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {msg.isAdmin ? 'Support (Ty)' : (msgUser?.username || 'Użytkownik')}
                          </span>
                          {!msg.isAdmin && msgUser && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: 6 }}>
                              {msgUser.email}
                            </span>
                          )}
                        </div>
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
                <label className="dash-label" style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Shield size={14} style={{ color: 'var(--accent)' }} /> Odpowiedz jako administrator
                </label>
                <textarea className="dash-input" rows={4} placeholder="Wpisz odpowiedź dla użytkownika..."
                  value={replyText} onChange={e => setReplyText(e.target.value)}
                  style={{ resize: 'vertical', marginBottom: 12 }} />
                <button className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }}
                  onClick={handleReply}>
                  <Send size={16} /> Wyślij odpowiedź
                </button>
              </div>
            ) : (
              <div className="dash-card" style={{ textAlign: 'center', padding: 20, color: 'var(--text-tertiary)' }}>
                <AlertCircle size={18} style={{ marginBottom: 4 }} />
                <p style={{ fontSize: '0.85rem' }}>
                  Ticket zamknięty{activeTicket.closedAt ? ` dnia ${new Date(activeTicket.closedAt).toLocaleDateString('pl-PL')}` : ''}
                </p>
                <button className="btn btn--outline" style={{ marginTop: 8, padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={() => { reopenTicket(activeTicket.id); toast.success('Ticket otwarty', 'Zgłoszenie ponownie otwarte'); }}>
                  <RotateCcw size={14} style={{ marginRight: 4 }} /> Otwórz ponownie
                </button>
              </div>
            )}
          </div>

          {/* Sidebar — User info */}
          <div>
            <div className="dash-card animate-fadeInUp" style={{ position: 'sticky', top: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border-primary)' }}>
                <User size={16} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Dane użytkownika</span>
              </div>

              {ticketUser ? (
                <div style={{ display: 'grid', gap: 14 }}>
                  {/* Avatar + name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 700, fontSize: '1rem',
                    }}>
                      {ticketUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{ticketUser.username}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                        {ticketUser.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                      </div>
                    </div>
                  </div>

                  {/* Info rows */}
                  {[
                    { icon: <Hash size={13} />, label: 'ID użytkownika', value: ticketUser.id },
                    { icon: <Mail size={13} />, label: 'E-mail', value: ticketUser.email },
                    { icon: <Calendar size={13} />, label: 'Konto od', value: new Date(ticketUser.createdAt).toLocaleDateString('pl-PL') },
                    { icon: <CreditCard size={13} />, label: 'Saldo', value: `${ticketUser.balance.toFixed(2)} zł` },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--text-tertiary)', marginTop: 2, flexShrink: 0 }}>{row.icon}</div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{row.label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{row.value}</div>
                      </div>
                    </div>
                  ))}

                  {/* User servers count */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--text-tertiary)', marginTop: 2 }}><Eye size={13} /></div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Serwery</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {store.servers.filter(s => s.userId === ticketUser.id).length} serwer(ów)
                      </div>
                    </div>
                  </div>

                  {/* Tickets from this user */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ color: 'var(--text-tertiary)', marginTop: 2 }}><MessageSquare size={13} /></div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tickety</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {store.tickets.filter(t => t.userId === ticketUser.id).length} zgłoszeń łącznie
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Użytkownik nie znaleziony</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ────────────────────────────────────────
  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title">Tickety</h1>
        <p className="dash-page__subtitle">Zarządzaj zgłoszeniami użytkowników</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Wszystkie', count: allTickets.length, color: 'var(--text-primary)', filter: 'all' as const },
          { label: 'Otwarte', count: openCount, color: '#eab308', filter: 'open' as const },
          { label: 'Odpowiedzi', count: answeredCount, color: '#22c55e', filter: 'answered' as const },
          { label: 'Zamknięte', count: closedCount, color: '#a1a1aa', filter: 'closed' as const },
        ].map(s => (
          <button key={s.filter} onClick={() => setFilterStatus(s.filter)}
            className="dash-card"
            style={{
              cursor: 'pointer', textAlign: 'center', padding: '14px 12px', border: '1px solid var(--border-primary)',
              outline: filterStatus === s.filter ? `2px solid ${s.color}` : 'none',
              fontFamily: 'inherit', background: 'var(--bg-card)',
            }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, position: 'relative', maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input className="dash-input" placeholder="Szukaj po temacie, nazwie użytkownika, ID..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 36 }} />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="dash-card dash-empty animate-scaleIn">
          <MessageSquare size={48} />
          <p style={{ marginTop: 8 }}>Brak ticketów{filterStatus !== 'all' ? ` ze statusem "${STATUS_MAP[filterStatus]?.label}"` : ''}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.slice().reverse().map((ticket, idx) => {
            const st = STATUS_MAP[ticket.status];
            const pr = PRIORITY_MAP[ticket.priority || 'medium'];
            const tUser = store.users.find(u => u.id === ticket.userId);
            const lastMsg = ticket.messages[ticket.messages.length - 1];
            const PrIcon = pr.icon;

            return (
              <div key={ticket.id}
                className="dash-card animate-fadeInUp"
                style={{ cursor: 'pointer', padding: '14px 18px', animationDelay: `${Math.min(idx, 15) * 0.03}s`,
                  transition: 'border-color 0.15s ease', borderLeft: `3px solid ${pr.color}` }}
                onClick={() => setSelectedId(ticket.id)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.borderLeftColor = pr.color;
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {ticket.subject}
                      </span>
                      {ticket.adminLabel && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, background: 'var(--accent-glow)',
                          padding: '1px 6px', borderRadius: 'var(--radius-full)' }}>
                          {ticket.adminLabel}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500, marginBottom: 4 }}>
                      {lastMsg?.text}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: '0.74rem', color: 'var(--text-tertiary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <User size={11} /> {tUser?.username || '—'}
                      </span>
                      <span>#{ticket.id.slice(0, 8)}</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString('pl-PL')}</span>
                      <span>{CATEGORY_MAP[ticket.category || 'general']}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ padding: '2px 7px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600,
                      background: pr.bg, color: pr.color, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <PrIcon size={10} />
                    </span>
                    <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600,
                      background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                      <MessageSquare size={12} /> {ticket.messages.length}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
