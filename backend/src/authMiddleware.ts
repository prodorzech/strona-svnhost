import { Request, Response, NextFunction } from 'express';
import { findSession, touchSession, getSafeUserById, SafeUser } from './database';

/** Extend Express Request to carry the authenticated user */
export interface AuthRequest extends Request {
  user?: SafeUser;
  token?: string;
}

/**
 * Middleware that verifies the Bearer token from the Authorization header.
 * Attaches `req.user` and `req.token` if valid.
 * Returns 401 if the token is missing or invalid.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Brak tokenu autoryzacji' });
    return;
  }

  const token = authHeader.slice(7);
  const session = findSession(token);
  if (!session) {
    res.status(401).json({ success: false, error: 'Sesja wygasła lub jest nieprawidłowa' });
    return;
  }

  const user = getSafeUserById(session.userId);
  if (!user) {
    res.status(401).json({ success: false, error: 'Użytkownik nie istnieje' });
    return;
  }

  // Touch session (update lastActive)
  touchSession(token);

  req.user = user;
  req.token = token;
  next();
}

/**
 * Middleware that requires admin role.
 * Must be used AFTER authMiddleware.
 */
export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, error: 'Brak uprawnień administratora' });
    return;
  }
  next();
}
