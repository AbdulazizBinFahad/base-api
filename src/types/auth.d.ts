import { Request } from 'express';

export interface TokenPayload {
  id: string;
  email: string;
  role?: string;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
}