import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { backendApi, setToken } from '../../services/backendApi';
import { setCurrentUserFromApi } from '../../store/store';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await backendApi.auth.login(email, password);
      if (res.success && res.data) {
        setToken(res.data.token);
        setCurrentUserFromApi(res.data.user);
        navigate('/dashboard');
      } else {
        setError(res.error || 'Logowanie nie powiodło się');
      }
    } catch {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
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
