import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import './workers/email.worker';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import { AppError } from './utils/errors';
import logger, { morganStream } from './utils/logger';
import { startEmailWorker } from './workers/email.worker';
import db from './db/pgClient';

dotenv.config();

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
    frameguard: { action: 'deny' },
  })
);

const allowedOrigins =
  process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
  ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new AppError('CORS not allowed', 403));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: process.env.MAX_FILE_SIZE }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(
  morgan("combined", { stream: morganStream })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/favicon.ico', (_req, res) => res.sendStatus(204));

app.use('/auth', authRoutes);
app.use('/email', emailRoutes);

app.get('/', (_req, res) => {
  logger.info('Health check starting endpoint hit');
  return res.status(200).json({ 
    status: 'OK',
    message: 'Bulk Email Service is running',
    timestamp: new Date().toISOString() 
  });
});

app.use((req: Request, _res, next: NextFunction) => {
  const error = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(error);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);

  const statusCode =
    err.statusCode && typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
});

process.on('unhandledRejection', (reason) =>
  logger.error(`Unhandled Rejection:, ${reason}`)
);
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception:, ${err}`);
  process.exit(1);
});

const PORT: number = Number(process.env.PORT) || 5000;

console.log(`Starting server in ${process.env.NODE_ENV} mode on port ${PORT}`);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  startEmailWorker();
});

(async () => {
  try {
    const res = await db.query('SELECT NOW()');
    logger.info(`DB connected:,`);
    console.log(res.rows[0]);
  } catch (err) {
    logger.error(`DB connection failed:, ${err}`);
  }
})();


export default app;
