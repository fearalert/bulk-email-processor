import db from '../db/pgClient';
import logger from '../utils/logger';

export class EmailRepository {
  async createLog(userId: number, emailTo: string, templateId: number) {
    try {
      logger.debug(`Attempting to create email log`, `userId=${userId}, emailTo=${emailTo}, templateId=${templateId}`);
      
      if (!userId || userId <= 0) {
        throw new Error(`Invalid userId: ${userId}`);
      }
      if (!emailTo || !emailTo.trim()) {
        throw new Error(`Invalid emailTo: ${emailTo}`);
      }
      if (!templateId || templateId <= 0) {
        throw new Error(`Invalid templateId: ${templateId}`);
      }

      await this.validateForeignKeys(userId, templateId);

      const result = await db.query(
        'INSERT INTO email_logs (user_id, email_to, template_id) VALUES ($1, $2, $3) RETURNING *',
        [userId, emailTo.trim(), templateId]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error('INSERT query returned no rows');
      }

      const createdLog = result.rows[0];
      logger.info(`Created email log`, `userId=${userId}, templateId=${templateId}, logId=${createdLog.id}, emailTo=${emailTo}`);
      return createdLog;

    } catch (err: any) {
      if (err.code === '23503') {
        if (err.detail?.includes('user_id')) {
          logger.error(`User not found`, `userId=${userId}, error=User with id ${userId} does not exist`);
          throw new Error(`User with id ${userId} does not exist`);
        }
        if (err.detail?.includes('template_id')) {
          logger.error(`Template not found`, `templateId=${templateId}, error=Template with id ${templateId} does not exist`);
          throw new Error(`Template with id ${templateId} does not exist`);
        }
      }

      logger.error(`Failed to create email log`, `userId=${userId}, emailTo=${emailTo}, templateId=${templateId}, error=${err.message || err}, code=${err.code || 'NO_CODE'}, detail=${err.detail || 'No details'}`);
      throw err;
    }
  }

  private async validateForeignKeys(userId: number, templateId: number) {
    try {
      const userResult = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
      if (userResult.rows.length === 0) {
        throw new Error(`User with id ${userId} does not exist in users table`);
      }

      const templateResult = await db.query('SELECT id FROM email_templates WHERE id = $1', [templateId]);
      if (templateResult.rows.length === 0) {
        throw new Error(`Template with id ${templateId} does not exist in email_templates table`);
      }

      logger.debug(`Foreign key validation passed`, `userId=${userId}, templateId=${templateId}`);
    } catch (err: any) {
      logger.error(`Foreign key validation failed`, `userId=${userId}, templateId=${templateId}, error=${err.message || err}`);
      throw err;
    }
  }

  async ensureDefaultTemplate(): Promise<number> {
    try {
      const existingTemplate = await db.query('SELECT id FROM email_templates LIMIT 1');
      
      if (existingTemplate.rows.length > 0) {
        return existingTemplate.rows[0].id;
      }

      const result = await db.query(`
        INSERT INTO email_templates (name, subject, body) 
        VALUES ($1, $2, $3) 
        RETURNING id
      `, ['Default Template', 'Default Subject', 'Default email body']);

      const templateId = result.rows[0].id;
      logger.info(`Created default email template`, `templateId=${templateId}`);
      return templateId;

    } catch (err: any) {
      logger.error(`Failed to ensure default template`, `error=${err.message || err}`);
      throw err;
    }
  }

  async updateLogStatus(id: number, status: string, errorMessage: string | null = null) {
    try {
      logger.debug(`Attempting to update email log status`, `id=${id}, status=${status}, hasErrorMessage=${!!errorMessage}`);

      const result = await db.query(
        'UPDATE email_logs SET status=$1, error_message=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
        [status.trim(), errorMessage, id]
      );

      if (!result.rows || result.rows.length === 0) {
        throw new Error(`No email log found with id: ${id}`);
      }

      const updatedLog = result.rows[0];
      logger.info(`Updated email log`, `id=${id}, status=${status}`);
      return updatedLog;

    } catch (err: any) {
      logger.error(`Failed to update email log`, `id=${id}, status=${status}, error=${err.message || err}, code=${err.code || 'NO_CODE'}`);
      throw err;
    }
  }

  async getLogsByUser(userId: number) {
    try {
      const result = await db.query(
        'SELECT * FROM email_logs WHERE user_id=$1 ORDER BY created_at DESC',
        [userId]
      );

      const count = result.rowCount || 0;
      logger.debug(`Fetched logs for user`, `userId=${userId}, count=${count}`);
      return result.rows;

    } catch (err: any) {
      logger.error(`Failed to fetch logs for user`, `userId=${userId}, error=${err.message || err}, code=${err.code || 'NO_CODE'}`);
      throw err;
    }
  }

  async getLogById(id: number) {
    try {
      const result = await db.query('SELECT * FROM email_logs WHERE id=$1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      logger.debug(`Fetched email log`, `id=${id}`);
      return result.rows[0];

    } catch (err: any) {
      logger.error(`Failed to fetch email log`, `id=${id}, error=${err.message || err}, code=${err.code || 'NO_CODE'}`);
      throw err;
    }
  }

  async deleteLog(id: number) {
    try {
      const result = await db.query('DELETE FROM email_logs WHERE id=$1 RETURNING id', [id]);

      if (result.rowCount === 0) {
        throw new Error(`No email log found with id: ${id}`);
      }

      logger.info(`Deleted email log`, `id=${id}`);
      return true;

    } catch (err: any) {
      logger.error(`Failed to delete email log`, `id=${id}, error=${err.message || err}, code=${err.code || 'NO_CODE'}`);
      throw err;
    }
  }

  async listLogs(limit: number, offset: number) {
    try {
      const result = await db.query(
        'SELECT * FROM email_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );

      const count = result.rowCount || 0;
      logger.debug(`Fetched logs`, `count=${count}, limit=${limit}, offset=${offset}`);
      return result.rows;

    } catch (err: any) {
      logger.error(`Failed to list logs`, `limit=${limit}, offset=${offset}, error=${err.message || err}, code=${err.code || 'NO_CODE'}`);
      throw err;
    }
  }

  // Debu
  async debugDataIntegrity() {
    try {
      const results = await Promise.all([
        db.query('SELECT COUNT(*) as count FROM users'),
        db.query('SELECT COUNT(*) as count FROM email_templates'),
        db.query('SELECT COUNT(*) as count FROM email_logs'),
        db.query('SELECT id, email FROM users ORDER BY id LIMIT 5'),
        db.query('SELECT id, name FROM email_templates ORDER BY id LIMIT 5'),
        db.query(`
          SELECT el.id, el.user_id, el.template_id, el.status, 
                 u.email as user_email, et.name as template_name
          FROM email_logs el
          LEFT JOIN users u ON el.user_id = u.id
          LEFT JOIN email_templates et ON el.template_id = et.id
          ORDER BY el.created_at DESC
          LIMIT 5
        `)
      ]);

      const debugInfo = {
        userCount: results[0].rows[0].count,
        templateCount: results[1].rows[0].count,
        logCount: results[2].rows[0].count,
        sampleUsers: results[3].rows,
        sampleTemplates: results[4].rows,
        sampleLogs: results[5].rows
      };

      logger.info(`Database integrity check`, `users=${debugInfo.userCount}, templates=${debugInfo.templateCount}, logs=${debugInfo.logCount}`);
      return debugInfo;

    } catch (err: any) {
      logger.error(`Database integrity check failed`, `error=${err.message || err}`);
      throw err;
    }
  }
}