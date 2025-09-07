import { Worker } from 'bullmq';
import { connection } from '../db/redisClient';
import { EmailRepository } from '../repositories/email.repository';
import logger from '../utils/logger';
import { sendMail } from '../utils/mailer';

export function startEmailWorker() {
  const emailRepo = new EmailRepository();

  const worker = new Worker(
    'emailQueue',
    async (job) => {
      const { logId, email, subject, body } = job.data;
      try {
        await sendMail(email, subject, body);
        await emailRepo.updateLogStatus(logId, 'sent');
      } catch (err: any) {
        await emailRepo.updateLogStatus(logId, 'failed', err.message);
        logger.error(`Email sending failed for email=${email}, ${err}`);
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
