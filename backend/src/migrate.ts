import fs from 'fs';
import path from 'path';
import db from './db/pgClient';
import logger from './utils/logger';

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      logger.info('Running migration', `file=${file}`);
      await db.query(sql);
      logger.info('Migration completed', `file=${file}`);
    }

    logger.info('All migrations executed successfully.');
    process.exit(0);
  } catch (err: any) {
    logger.error('Migration failed', `error=${err.message || err}`);
    process.exit(1);
  }
}

runMigrations();