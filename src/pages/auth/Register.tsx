import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { backendApi, setToken } from '../../services/backendApi';
import { setCurrentUserFromApi } from '../../store/store';
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { getLogoForAccent } from '../../utils/logo';
import './Auth.css';

export function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Hasła się nie zgadzają');
      return;
    }

    setLoading(true);
    try {
      const res = await backendApi.auth.register(email, username, password);
      if (res.success && res.data) {
        setToken(res.data.token);
        setCurrentUserFromApi(res.data.user);
        navigate('/dashboard');
      } else {
        setError(res.error || 'Rejestracja nie powiodła się');
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
        <h1 className="auth__title">Rejestracja</h1>
        <p className="auth__subtitle">Utwórz konto i zacznij korzystać z naszych usług.</p>

        {error && <div className="auth__error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth__form">
          <div className="auth__field">
            <label>Nazwa użytkownika</label>
            <div className="auth__input-wrap">
              <User size={18} />
              <input
                type="text"
                placeholder="Twoja nazwa"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>
          </div>

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
                placeholder="Min. 6 znaków"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button type="button" className="auth__eye" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="auth__field">
            <label>Powtórz hasło</label>
            <div className="auth__input-wrap">
              <Lock size={18} />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="Powtórz hasło"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth__submit" disabled={loading}>
            <UserPlus size={18} />
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="auth__footer">
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
}
