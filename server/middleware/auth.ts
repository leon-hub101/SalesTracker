import { Request, Response, NextFunction } from 'express';

// Middleware to require authentication
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log('[AUTH] Session check:', {
    path: req.path,
    method: req.method,
    sessionID: req.sessionID,
    userId: req.session.userId,
    hasSession: !!req.session,
    cookie: req.headers.cookie ? 'present' : 'missing'
  });
  
  if (!req.session.userId) {
    console.log('[AUTH] Authentication failed - no userId in session');
    return res.status(401).json({ error: "Authentication required" });
  }
  
  console.log('[AUTH] Authentication successful for user:', req.session.userId);
  next();
};

// Middleware to require admin role
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (req.session.userRole !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
