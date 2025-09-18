import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { AppError } from '../utils/errors';
import { hashPassword, comparePassword } from '../utils/hash';
import logger from '../utils/logger';
import { sendMail } from '../utils/mailer';
import { getEmailTemplate } from '../utils/emailTemplate';

const userRepo = new UserRepository();
const resetTokens = new Map<string, { email: string; expiresAt: number }>();
export class AuthService {
  async register(email: string, password: string) {
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) throw new AppError('Email already in use', 400);

    const passwordHash = await hashPassword(password);
    const user = await userRepo.createUser(email, passwordHash);

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET as Secret,
      { expiresIn: '1d' }
    );
    const verificationLink = `${process.env.APP_BASE_URL}/auth/verify?token=${token}`;

    const emailTemplate = getEmailTemplate({
          title: 'Verify Your Email',
          message: `Hi there! Please verify your email address to complete your registration.`,
          buttonText: 'Verify Email',
          buttonLink: verificationLink,
          recipientEmail: user.email,
          securityNote: 'This link expires in 24 hours for security.'
        });

    await sendMail(user.email, 'Verify Your Email', emailTemplate);

    logger.info(`User registered: ${email}`);
    return { id: user.id, email: user.email, token };
  }

  async verifyEmail(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as { email: string };
    const user = await userRepo.verifyUser(decoded.email);
    if (!user) throw new AppError('User not found', 404);

    logger.info(`Email verified for: ${decoded.email}`);
    return { id: user.id, email: user.email };
  }

  async login(email: string, password: string) {
    const user = await userRepo.findByEmailWithPassword(email);
    if (!user) throw new AppError('Invalid email or password', 401);

    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) throw new AppError('Invalid email or password', 401);
    if (!user.verified) throw new AppError('Email not verified', 403);

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as Secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as SignOptions
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET as Secret,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as SignOptions
    );

    logger.info(`User logged in: ${email}`);
    return { user: { id: user.id, email: user.email }, accessToken, refreshToken };
  }

  async getUserFromToken(token: string) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as { userId: number };
    const user = await userRepo.findById(decoded.userId);
    if (!user) throw new AppError('User not found', 404);

    return { id: user.id, email: user.email };
  }

  async forgotPassword(email: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new AppError('User not found', 404);

    const token = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    resetTokens.set(token, { email: user.email, expiresAt });

    const emailTemplate = getEmailTemplate({
      title: 'Verify Your Email',
      message: `Hi there! Please verify your email address to complete your registration. Your token is: \n ${token}`,
      buttonText: token,
      buttonLink: `${process.env.APP_BASE_URL}/reset-password`,
      recipientEmail: user.email,
      securityNote: 'This code expires in 15 minutes for security.'
    });

    await sendMail(user.email, 'Password Reset Request', emailTemplate);
    logger.info(`Password reset email sent: ${user.email}`);

    return { message: 'Password reset email sent' };
  }

 async resetPassword(token: string, newPassword: string) {
    const record = resetTokens.get(token);
    if (!record) throw new AppError('Invalid or expired token', 400);

    if (record.expiresAt < Date.now()) {
      resetTokens.delete(token);
      throw new AppError('Token expired', 400);
    }

    const user = await userRepo.findByEmail(record.email);
    if (!user) throw new AppError('User not found', 404);

    const passwordHash = await hashPassword(newPassword);
    await userRepo.updatePassword(user.email, passwordHash);

    // Invalidate token
    resetTokens.delete(token);

    logger.info(`Password reset for user: ${user.email}`);
    return { message: 'Password reset successful' };
  }
  
  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as Secret
      ) as { userId: number };

      const user = await userRepo.findById(decoded.userId);
      if (!user) throw new AppError('User not found', 404);

      const newAccessToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as Secret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' } as SignOptions
      );

      const newRefreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET as Secret,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as SignOptions
      );

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err: any) {
      logger.error(`Refresh token failed: ${err.message || err}`);
      throw new AppError('Invalid or expired refresh token', 401);
    }
  }
}
