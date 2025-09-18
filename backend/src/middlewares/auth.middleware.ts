import type { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import { AuthService } from '../services/auth.service';

export interface AuthRequest extends Request {
  user?: { userId: number; email?: string };
  newAccessToken?: string;
}

const authService = new AuthService();

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const refreshTokenHeader = req.headers['x-refresh-token'] as string | undefined;

  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('JWT secrets not defined in environment');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: token missing' });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as Secret) as {
      userId: number;
      email?: string;
    };
    req.user = decoded;
    return next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError' && refreshTokenHeader) {
      try {
        const tokens = await authService.refreshToken(refreshTokenHeader);
        const decoded = jwt.verify(tokens.accessToken, process.env.JWT_SECRET as Secret) as {
          userId: number;
          email?: string;
        };

        req.user = decoded;
        req.newAccessToken = tokens.accessToken;

        res.setHeader('x-access-token', tokens.accessToken);
        res.setHeader('x-refresh-token', tokens.refreshToken);

        return next();
      } catch (refreshErr: any) {
        console.error('Refresh token error:', refreshErr.message || refreshErr);
        return res.status(401).json({ error: 'Unauthorized: invalid refresh token' });
      }
    }

    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }
};
