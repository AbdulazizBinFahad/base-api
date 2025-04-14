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

export const authorize = (requiredRole?: string) => (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
        req.user = decoded;

        if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};