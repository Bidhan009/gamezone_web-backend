import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

// 1. Extend the Request type to include the user payload
export interface AuthRequest extends Request {
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

// 2. The core authentication middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = decoded; // The payload must include the 'role' property
    next();
  });
};

// 3. The Role-Based Authorization Middleware (The "Admin" implementation)
export const authorizeRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Ensure the user is authenticated first
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Check if the user's role matches the required role
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Requires ${requiredRole} role` 
      });
    }

    next();
  };
};