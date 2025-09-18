import db from '../db/pgClient';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

export class UserRepository {
  async createUser(email: string, passwordHash: string) {
    try {
      const result = await db.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [email, passwordHash]
      );
      return result.rows[0];
    } catch (error: any) {
      logger.error(`Error creating user`, `email=${email}, error=${error.message || error}`);
      throw new AppError('Error creating user', 500);
    }
  }

  async findByEmail(email: string) {
    try {
      const result = await db.query(
        'SELECT id, email, verified FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      logger.error(`Error finding user by email`, `email=${email}, error=${error.message || error}`);
      throw new AppError('Error finding user', 500);
    }
  }

  async findByEmailWithPassword(email: string) {
    try {
      const result = await db.query(
        'SELECT id, email, password_hash, verified FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      logger.error(`Error finding user by email and password`, `email=${email}, error=${error.message || error}`);
      throw new AppError('Error finding user', 500);
    }
  }

  async verifyUser(email: string) {
    try {
      const result = await db.query(
        'UPDATE users SET verified = true WHERE email = $1 RETURNING id, email',
        [email]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      logger.error(`Error verifying user`, `email=${email}, error=${error.message || error}`);
      throw new AppError('Error verifying user', 500);
    }
  }

  async findById(id: number) {
    const result = await db.query('SELECT id, email FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async updatePassword(email: string, passwordHash: string) {
    try {
      const result = await db.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
        [passwordHash, email]
      );
      return result.rows[0] || null;
    } catch (error: any) {
      logger.error(`Error updating password`, `email=${email}, error=${error.message || error}`);
      throw new AppError('Error updating password', 500);
    }
  }
}