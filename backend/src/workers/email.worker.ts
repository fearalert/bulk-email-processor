// src/workers/email.worker.ts
import { Worker } from 'bullmq';
import { connection } from '../db/redisClient';
import { EmailRepository } from '../repositories/email.repository';
import logger from '../utils/logger';
import { sendMail } from '../utils/mailer';
import { SocketServer } from '../socket/server';

export function startEmailWorker() {
  const emailRepo = new EmailRepository();

  const worker = new Worker(
    'emailQueue',
    async (job) => {
      const { logId, email, subject, body, userId } = job.data;

      try {
        await sendMail(email, subject, body);
        await emailRepo.updateLogStatus(logId, 'sent');

        // Safely get io instance
        let io;
        try {
          io = SocketServer.getInstance().getIO();
        } catch {
          logger.warn('Socket.IO not initialized yet, skipping real-time update');
        }

        if (io) {
          io.to(`user_${userId}`).emit('emailStatusUpdate', {
            logId,
            status: 'sent',
            email,
          });
        }
      } catch (err: any) {
        await emailRepo.updateLogStatus(logId, 'failed', err.message);
        logger.error(`Email sending failed for email=${email}, ${err}`);

        let io;
        try {
          io = SocketServer.getInstance().getIO();
        } catch {
          logger.warn('Socket.IO not initialized yet, skipping real-time failure update');
        }

        if (io) {
          io.to(`user_${userId}`).emit('emailStatusUpdate', {
            logId,
            status: 'failed',
            email,
            error: err.message,
          });
        }

        throw err;
      }
    },
    {
      connection,
      concurrency: process.env.EMAIL_CONCURRENCY
        ? parseInt(process.env.EMAIL_CONCURRENCY)
        : 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Email job completed for ${job.data.email}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Email job failed for ${job?.data.email}: ${err}`);
  });

  logger.info(`Email worker started with concurrency ${worker.opts.concurrency}`);
}
