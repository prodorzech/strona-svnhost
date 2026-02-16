import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../store/store';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { getLogoForAccent } from '../../utils/logo';
import './Auth.css';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="auth">
      <div className="auth__bg">
        <div className="auth__glow auth__glow--1" />
        <div className="auth__glow auth__glow--2" />
      </div>
      <div className="auth__card">
        <Link to="/" className="auth__logo">
          <img src={getLogoForAccent()} alt="SVNHost" className="auth__logo-img" />
        </Link>
        <h1 className="auth__title">Zaloguj się</h1>
        <p className="auth__subtitle">Witaj z powrotem! Zaloguj się do panelu klienta.</p>

        {error && <div className="auth__error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth__form">
          <div className="auth__field">
            <label>Email</label>
            <div className="auth__input-wrap">
              <Mail size={18} />
              <input
                type="email"
                placeholder="twoj@email.pl"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth__field">
            <label>Hasło</label>
            <div className="auth__input-wrap">
              <Lock size={18} />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" className="auth__eye" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth__submit" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className="auth__footer">
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  );
}
