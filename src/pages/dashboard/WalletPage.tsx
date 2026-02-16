import { useState } from 'react';
import { getCurrentUser, topUpWallet, redeemPromoCode } from '../../store/store';
import { useStoreState } from '../../store/useStore';
import { toast } from '../../components/Toast';
import {
  Wallet, CreditCard, Gift, ArrowUpRight, ArrowDownRight, Plus,
} from 'lucide-react';

const topUpAmounts = [10, 25, 50, 100, 200, 500];

export function WalletPage() {
  const store = useStoreState();
  const user = getCurrentUser();
  const [topUpAmount, setTopUpAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');

  if (!user) return null;

  const myTransactions = store.transactions.filter(t => t.userId === user.id).reverse();

  const handleTopUp = () => {
    const amount = customAmount ? parseFloat(customAmount) : topUpAmount;
    if (!amount || amount <= 0 || amount > 10000) return;
    topUpWallet(user.id, amount);
    setCustomAmount('');
    toast.success('Doładowano portfel', `+${amount.toFixed(2)} zł zostało dodane do Twojego salda`);
  };

  const handlePromo = () => {
    if (!promoCode.trim()) return;
    const result = redeemPromoCode(user.id, promoCode.trim());
    if (result.success) {
      toast.success('Kod aktywowany!', 'Środki zostały dodane do portfela');
      setPromoCode('');
    } else {
      toast.error('Błąd kodu', result.error || 'Nieprawidłowy kod');
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="dash-page__header animate-fadeInDown">
        <h1 className="dash-page__title">Portfel</h1>
        <p className="dash-page__subtitle">Zarządzaj swoimi środkami</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Balance card */}
        <div className="dash-card animate-scaleIn anim-delay-1" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wallet size={28} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>Aktualne saldo</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent)' }}>
                {user.balance.toFixed(2)} zł
              </div>
            </div>
          </div>
        </div>

        {/* Top-up card */}
        <div className="dash-card animate-fadeInUp anim-delay-2">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} /> Doładuj portfel
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {topUpAmounts.map(amount => (
              <button
                key={amount}
                onClick={() => { setTopUpAmount(amount); setCustomAmount(''); }}
                style={{
                  padding: '12px', border: '1px solid', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  borderColor: topUpAmount === amount && !customAmount ? 'var(--accent)' : 'var(--border-primary)',
                  background: topUpAmount === amount && !customAmount ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                  color: topUpAmount === amount && !customAmount ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {amount} zł
              </button>
            ))}
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="dash-label">Lub wpisz kwotę</label>
            <input className="dash-input" type="number" min="1" max="10000" placeholder="Kwota w zł..."
              value={customAmount} onChange={e => setCustomAmount(e.target.value)} />
          </div>
          <button className="btn btn--primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}
            onClick={handleTopUp}>
            <Plus size={16} /> Doładuj {customAmount ? parseFloat(customAmount).toFixed(2) : topUpAmount.toFixed(2)} zł
          </button>
        </div>

        {/* Promo code card */}
        <div className="dash-card animate-fadeInUp anim-delay-3">
          <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gift size={18} /> Kod promocyjny
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
            Masz kod promocyjny? Wpisz go poniżej, aby otrzymać bonus.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="dash-input" placeholder="Wpisz kod..." value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handlePromo()}
              style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }} />
            <button className="btn btn--primary" style={{ padding: '10px 20px', whiteSpace: 'nowrap' }} onClick={handlePromo}>
              Aktywuj
            </button>
          </div>
        </div>
      </div>

      {/* Transaction history */}
      <div className="dash-card animate-fadeInUp anim-delay-4">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Historia transakcji</h3>
        {myTransactions.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 40 }}>Brak transakcji</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dash-table">
              <thead>
                <tr><th>Opis</th><th>Kwota</th><th>Saldo po</th><th>Data</th></tr>
              </thead>
              <tbody>
                {myTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td style={{ color: 'var(--text-primary)' }}>{tx.description}</td>
                    <td>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600,
                        color: tx.amount >= 0 ? '#22c55e' : '#ef4444',
                      }}>
                        {tx.amount >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)} zł
                      </span>
                    </td>
                    <td>{tx.balanceAfter.toFixed(2)} zł</td>
                    <td style={{ fontSize: '0.8rem' }}>{new Date(tx.createdAt).toLocaleString('pl-PL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
