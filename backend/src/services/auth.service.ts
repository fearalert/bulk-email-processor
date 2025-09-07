import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/errors';
import { hashPassword, comparePassword } from '../utils/hash';
import logger from '../utils/logger';
import { sendMail } from '../utils/mailer';
import { getVerificationEmailTemplate } from '../utils/emailTemplate';
import e from 'cors';

const userRepo = new UserRepository();

export class AuthService {
  async register(email: string, password: string) {
    try {
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) throw new AppError('Email already in use', 400);

      const passwordHash = await hashPassword(password);
      const user = await userRepo.createUser(email, passwordHash);
      const token = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' });
      const verificationLink = `${process.env.APP_BASE_URL}/auth/verify?token=${token}`;

      const emailTemplate = getVerificationEmailTemplate(verificationLink, email);
      
      await sendMail(email, 'Verify your account', emailTemplate);
      logger.info(`User registered: ${email}`);
      
      return { id: user.id, email: user.email, token: token };
    } catch (err: any) {
      logger.error(`Registration failed for ${email}: ${err.message || err}`);
      throw err instanceof AppError ? err : new AppError('Registration failed', 500);
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string };
      const user = await userRepo.verifyUser(decoded.email);
      if (!user) throw new AppError('User not found', 404);

      logger.info(`Email verified for: ${decoded.email}`);
      return { id: user.id, email: user.email };
    } catch (err: any) {
      logger.error(`Email verification failed for token ${token}: ${err.message || err}`);
      throw new AppError('Invalid or expired token', 400);
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await userRepo.findByEmailWithPassword(email);
      if (!user) throw new AppError('Invalid email or password', 401);

      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) throw new AppError('Invalid email or password', 401);
      if (!user.verified) throw new AppError('Email not verified', 403);

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
      logger.info(`User logged in: ${email}`);
      
      return { user: { id: user.id, email: user.email }, token };
    } catch (err: any) {
      logger.error(`Login failed for ${email}: ${err.message || err}`);
      throw err instanceof AppError ? err : new AppError('Login failed', 500);
    }
  }
}