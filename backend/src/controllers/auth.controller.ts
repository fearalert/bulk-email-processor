import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';
import { registerSchema, verifySchema, loginSchema } from '../utils/validation';

const authService = new AuthService();

export class AuthController {
  private static instance: AuthController;
  
  private constructor() {}
  
  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  public async register(req: Request, res: Response) {
    try {
      const parseResult = registerSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn(`Register validation failed: ${JSON.stringify(parseResult.error)}`);
        return res.status(400).json({ errors: parseResult.error });
      }
      
      const { email, password } = parseResult.data;
      const user = await authService.register(email, password);
      logger.info(`Registration successful for ${email}`);
      res.status(201).json({ message: 'Verification email sent', user });
    } catch (err: any) {
      logger.error(`Registration failed: ${err.message || err}`);
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  }

  public async verify(req: Request, res: Response) {
    try {
      const parseResult = verifySchema.safeParse(req.query);
      if (!parseResult.success) {
        logger.warn(`Email verification validation failed: ${JSON.stringify(parseResult.error)}`);
        return res.status(400).json({ errors: parseResult.error });
      }
      
      const { token } = parseResult.data;
      const user = await authService.verifyEmail(token);
      logger.info(`Email verified for ${user.email}`);
      res.json({ message: 'Email verified', user });
    } catch (err: any) {
      logger.error(`Email verification failed: ${err.message || err}`);
      res.status(400).json({ error: err.message || 'Invalid or expired token' });
    }
  }

  public async login(req: Request, res: Response) {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        logger.warn(`Login validation failed: ${JSON.stringify(parseResult.error)}`);
        return res.status(400).json({ errors: parseResult.error });
      }
      
      const { email, password } = parseResult.data;
      const data = await authService.login(email, password);
      logger.info(`User logged in: ${email}`);
      res.json(data);
    } catch (err: any) {
      logger.warn(`Login failed: ${err.message || err}`);
      res.status(401).json({ error: err.message || 'Login failed' });
    }
  }

  public async me(req: Request, res: Response) {
    try {
      const token = req.cookies['authToken'];
      if (!token) return res.status(401).json({ error: 'Not authenticated' });

      const user = await authService.getUserFromToken(token);
      res.json({ user });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Invalid token' });
    }
  }

  public async logout(req: Request, res: Response) {
    res
      .clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .json({ message: 'Logged out successfully' });
  }
}