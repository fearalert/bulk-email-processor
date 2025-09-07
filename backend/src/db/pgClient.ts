import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

class PGClient {
  private static instance: Pool;

  private constructor() {}

  public static getInstance(): Pool {
    if (!PGClient.instance) {
      PGClient.instance = new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });
    }
    return PGClient.instance;
  }
}

export default PGClient.getInstance();
