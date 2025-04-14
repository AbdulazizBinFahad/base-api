import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { TokenPayload } from '../types/auth';

dotenv.config();

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authorize = (requiredRole?: string) => (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
      req.user = decoded;

      if (requiredRole && decoded.role !== requiredRole) {
        res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        return;
      }

      next();
    } catch (err) {
      res.status(403).json({ message: 'Invalid or expired token.' });
    }
};