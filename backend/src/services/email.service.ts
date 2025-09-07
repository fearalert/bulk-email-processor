import { emailQueue } from "../queues/email.queue";
import { EmailRepository } from "../repositories/email.repository";
import logger from "../utils/logger";
import pLimit from "p-limit";
import validator from "validator";
import { AppError } from "../utils/errors";
import { SocketServer } from "../socket/server";

const emailRepo = new EmailRepository();
const CONCURRENCY_LIMIT = Number(process.env.EMAIL_CONCURRENCY) || 10;
const limit = pLimit(CONCURRENCY_LIMIT);

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async queueBulkEmails(
    userId: number,
    emails: string[],
    templateId: number,
    subject: string,
    body: string
  ) {
    if (!emails || emails.length === 0) {
      throw new AppError("No emails provided", 400);
    }

    logger.info(
      `Starting bulk email processing`,
      `userId=${userId}, totalEmails=${emails.length}, templateId=${templateId}`
    );

    try {
      await this.validateUserAndTemplate(userId, templateId);

      const validEmails = emails.filter(email => {
        const trimmed = email.trim();
        return trimmed && validator.isEmail(trimmed);
      });

      const invalidEmails = emails.filter(email => {
        const trimmed = email.trim();
        return !trimmed || !validator.isEmail(trimmed);
      });

      if (invalidEmails.length > 0) {
        logger.warn(
          `Skipped invalid emails`,
          `userId=${userId}, invalidCount=${invalidEmails.length}, invalidEmails=${invalidEmails.join(
            ", "
          )}`
        );
      }

      if (validEmails.length === 0) {
        throw new AppError("No valid email addresses found", 400);
      }

      let processedCount = 0;
      const totalValidEmails = validEmails.length;

      const tasks = validEmails.map(email =>
        limit(async () => {
          try {
            const trimmedEmail = email.trim();
            const log = await emailRepo.createLog(userId, trimmedEmail, templateId);
            await emailQueue.add("sendEmail", {
              logId: log.id,
              email: trimmedEmail,
              subject,
              body,
              userId
            });
            logger.debug(
              `Queued email`,
              `userId=${userId}, logId=${log.id}, email=${trimmedEmail}`
            );

            // Emit progress update safely
            processedCount++;
            try {
              const io = SocketServer.getInstance().getIO();
              io.to(`user_${userId}`).emit("bulkEmailProgress", {
                processed: processedCount,
                total: totalValidEmails,
                userId
              });
            } catch {
              logger.warn("Socket.IO not initialized yet, skipping progress update");
            }

            return { success: true, email: trimmedEmail, logId: log.id };
          } catch (err: any) {
            logger.error(
              `Failed to queue email`,
              `userId=${userId}, email=${email}, error=${err.message || err}`
            );

            // Emit progress update even on failure
            processedCount++;
            try {
              const io = SocketServer.getInstance().getIO();
              io.to(`user_${userId}`).emit("bulkEmailProgress", {
                processed: processedCount,
                total: totalValidEmails,
                userId
              });
            } catch {
              logger.warn("Socket.IO not initialized yet, skipping progress update");
            }

            return { success: false, email, error: err.message };
          }
        })
      );

      const results = await Promise.all(tasks);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      logger.info(
        `Bulk email queue complete`,
        `userId=${userId}, total=${emails.length}, valid=${validEmails.length}, invalid=${invalidEmails.length}, successful=${successful}, failed=${failed}`
      );

      return {
        total: emails.length,
        valid: validEmails.length,
        invalid: invalidEmails,
        successful,
        failed
      };
    } catch (err: any) {
      logger.error(
        `Bulk email processing failed`,
        `userId=${userId}, templateId=${templateId}, error=${err.message || err}`
      );
      throw err;
    }
  }

  private async validateUserAndTemplate(userId: number, templateId: number) {
    try {
      logger.debug(`Validating user and template`, `userId=${userId}, templateId=${templateId}`);
      const userResult = await emailRepo["validateForeignKeys"](userId, templateId);
      logger.debug(`User and template validation passed`, `userId=${userId}, templateId=${templateId}`);
    } catch (err: any) {
      if (err.message.includes("User with id")) {
        throw new AppError(`Invalid user: ${err.message}`, 400);
      }
      if (err.message.includes("Template with id")) {
        logger.warn(`Template not found, checking for alternatives`, `templateId=${templateId}`);
        throw new AppError(
          `Invalid template: ${err.message}. Please create a template first or use an existing template ID.`,
          400
        );
      }
      throw err;
    }
  }

  public async getLogs(userId: number) {
    try {
      return await emailRepo.getLogsByUser(userId);
    } catch (err: any) {
      logger.error(`Failed to fetch email logs`, `userId=${userId}, error=${err.message || err}`);
      throw new AppError("Failed to fetch email logs", 500);
    }
  }

  public async debugUserInfo(userId: number) {
    try {
      const debugInfo = await emailRepo.debugDataIntegrity();
      logger.info(`Debug info requested`, `userId=${userId}`);
      return debugInfo;
    } catch (err: any) {
      logger.error(`Failed to get debug info`, `userId=${userId}, error=${err.message || err}`);
      throw new AppError("Failed to get debug info", 500);
    }
  }
}
