import { Router, Response } from 'express';
import {
  findUserByEmail,
  findUserByUsername,
  createUser,
  verifyPassword,
  getUserById,
  createSession,
  deleteSession,
  deleteUserSessions,
  getSafeUserById,
  updateUser,
  changePassword,
  getAllUsers,
  deleteUser,
  getUserSessions,
  getAllServers,
} from './database';
import { AuthRequest, authMiddleware, adminMiddleware } from './authMiddleware';
import { getSetting } from './database';

const authRouter = Router();

// ═══════════════════════════════════════════════════════
//  PUBLIC ROUTES (no token needed)
// ═══════════════════════════════════════════════════════

// ── Register ───────────────────────────────────────────
authRouter.post('/register', (req: AuthRequest, res: Response) => {
  try {
    if (getSetting('loginEnabled') === 'false') {
      res.status(403).json({ success: false, error: 'Logowanie jest tymczasowo wyłączone' });
      return;
    }
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ success: false, error: 'Email, nazwa użytkownika i hasło są wymagane' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Hasło musi mieć minimum 6 znaków' });
      return;
    }

    if (findUserByEmail(email)) {
      res.status(409).json({ success: false, error: 'Ten email jest już zajęty' });
      return;
    }
    if (findUserByUsername(username)) {
      res.status(409).json({ success: false, error: 'Ta nazwa użytkownika jest już zajęta' });
      return;
    }

    const user = createUser(email, username, password);
    const token = createSession(user.id, {
      ip: req.ip,
      browser: req.headers['user-agent'] || undefined,
    });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err: any) {
    console.error('[AUTH] Register error:', err);
    res.status(500).json({ success: false, error: 'Błąd rejestracji' });
  }
});

// ── Login ──────────────────────────────────────────────
authRouter.post('/login', (req: AuthRequest, res: Response) => {
  try {
    if (getSetting('loginEnabled') === 'false') {
      // Allow admin login even when disabled
      const { email, password } = req.body;
      const adminUser = findUserByEmail(email);
      if (!adminUser || adminUser.role !== 'admin') {
        res.status(403).json({ success: false, error: 'Logowanie jest tymczasowo wyłączone' });
        return;
      }
    }
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email i hasło są wymagane' });
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Nieprawidłowy email lub hasło' });
      return;
    }

    if (!verifyPassword(user, password)) {
      res.status(401).json({ success: false, error: 'Nieprawidłowy email lub hasło' });
      return;
    }

    const token = createSession(user.id, {
      ip: req.ip,
      browser: req.headers['user-agent'] || undefined,
    });

    // Return safe user (no password hash)
    const { passwordHash, ...safeUser } = user;

    res.json({ success: true, data: { user: safeUser, token } });
  } catch (err: any) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({ success: false, error: 'Błąd logowania' });
  }
});

// ═══════════════════════════════════════════════════════
//  PROTECTED ROUTES (token required)
// ═══════════════════════════════════════════════════════

// ── Get current user ───────────────────────────────────
authRouter.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: req.user });
});

// ── Logout ─────────────────────────────────────────────
authRouter.post('/logout', authMiddleware, (req: AuthRequest, res: Response) => {
  deleteSession(req.token!);
  res.json({ success: true, data: { message: 'Wylogowano' } });
});

// ── Logout all sessions ───────────────────────────────
authRouter.post('/logout-all', authMiddleware, (req: AuthRequest, res: Response) => {
  deleteUserSessions(req.user!.id);
  res.json({ success: true, data: { message: 'Wylogowano ze wszystkich urządzeń' } });
});

// ── Update profile ─────────────────────────────────────
authRouter.put('/profile', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { username, fullName, bio, phone, language, timezone, avatar, twoFa, loginAlerts } = req.body;
    const updated = updateUser(req.user!.id, {
      ...(username !== undefined && { username }),
      ...(fullName !== undefined && { fullName }),
      ...(bio !== undefined && { bio }),
      ...(phone !== undefined && { phone }),
      ...(language !== undefined && { language }),
      ...(timezone !== undefined && { timezone }),
      ...(avatar !== undefined && { avatar }),
      ...(twoFa !== undefined && { twoFa: twoFa ? 1 : 0 }),
      ...(loginAlerts !== undefined && { loginAlerts: loginAlerts ? 1 : 0 }),
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('[AUTH] Profile update error:', err);
    res.status(500).json({ success: false, error: 'Błąd aktualizacji profilu' });
  }
});

// ── Change password ────────────────────────────────────
authRouter.post('/change-password', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, error: 'Podaj aktualne i nowe hasło' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ success: false, error: 'Nowe hasło musi mieć minimum 6 znaków' });
      return;
    }

    // Need to get full user with password hash
    const fullUser = getUserById(req.user!.id);
    if (!fullUser || !verifyPassword(fullUser, currentPassword)) {
      res.status(401).json({ success: false, error: 'Nieprawidłowe aktualne hasło' });
      return;
    }

    changePassword(req.user!.id, newPassword);
    // Optionally invalidate other sessions
    deleteUserSessions(req.user!.id);
    // Create new session for current device
    const token = createSession(req.user!.id, {
      ip: req.ip,
      browser: req.headers['user-agent'] || undefined,
    });

    res.json({ success: true, data: { message: 'Hasło zmienione', token } });
  } catch (err: any) {
    console.error('[AUTH] Password change error:', err);
    res.status(500).json({ success: false, error: 'Błąd zmiany hasła' });
  }
});

// ── Get my sessions ────────────────────────────────────
authRouter.get('/sessions', authMiddleware, (req: AuthRequest, res: Response) => {
  const sessions = getUserSessions(req.user!.id);
  res.json({ success: true, data: sessions });
});

// ═══════════════════════════════════════════════════════
//  ADMIN ROUTES
// ═══════════════════════════════════════════════════════

// ── List all users ─────────────────────────────────────
authRouter.get('/admin/users', authMiddleware, adminMiddleware, (_req: AuthRequest, res: Response) => {
  const users = getAllUsers();
  res.json({ success: true, data: users });
});

// ── Get user by id ─────────────────────────────────────
authRouter.get('/admin/users/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const user = getSafeUserById(req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: 'Użytkownik nie znaleziony' });
    return;
  }
  // Include servers count
  const servers = getAllServers().filter((s: any) => s.userId === user.id);
  res.json({ success: true, data: { ...user, serversCount: servers.length } });
});

// ── Admin update user ──────────────────────────────────
authRouter.put('/admin/users/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const { role, balance, username } = req.body;
    const updated = updateUser(req.params.id, {
      ...(role !== undefined && { role }),
      ...(balance !== undefined && { balance }),
      ...(username !== undefined && { username }),
    });
    if (!updated) {
      res.status(404).json({ success: false, error: 'Użytkownik nie znaleziony' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('[AUTH] Admin user update error:', err);
    res.status(500).json({ success: false, error: 'Błąd aktualizacji użytkownika' });
  }
});

// ── Admin delete user ──────────────────────────────────
authRouter.delete('/admin/users/:id', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  try {
    deleteUserSessions(req.params.id);
    deleteUser(req.params.id);
    res.json({ success: true, data: { message: 'Użytkownik usunięty' } });
  } catch (err: any) {
    console.error('[AUTH] Admin user delete error:', err);
    res.status(500).json({ success: false, error: 'Błąd usuwania użytkownika' });
  }
});

export default authRouter;
