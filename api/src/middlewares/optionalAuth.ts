import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  sub: string;
  username: string;
  iat: number;
  exp: number;
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return next();
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'diatinf-x-super-secret-key-change-in-production';

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    req.userId = decoded.sub;
  } catch {
    // Se o token for inválido, prossegue como anônimo sem bloquear
  }

  return next();
}

