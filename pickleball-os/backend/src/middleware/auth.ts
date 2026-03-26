import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'PLAYER' | 'ADMIN' | 'SUPERADMIN';
  };
}

/**
 * Auth Middleware
 * Validates incoming JWT or Session Token and binds user to the Request.
 */
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Phase 2 STUB: Replace with actual Firebase Admin `verifyIdToken` or JWT decode
    // const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user = { id: decodedToken.uid, role: decodedToken.role };

    // Fake Auth
    req.user = { id: 'dummy-player-id', role: 'PLAYER' };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

/**
 * RBAC Middleware
 * Ensures the user holds required privileges.
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}
