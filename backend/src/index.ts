// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import emailRoutes from './routes/email.routes';
import { AppError } from './utils/errors';
import logger, { morganStream } from './utils/logger';
import db from './db/pgClient';
import { startEmailWorker } from './workers/email.worker';
import { SocketServer } from './socket/server';
import { initSocketIO } from './socket/socket';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const socketServer = SocketServer.getInstance();
const io = socketServer.init(httpServer);

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

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
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

app.use(cookieParser());

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(morgan('combined', { stream: morganStream }));

// app.use(
//   rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100,
//     message: { error: 'Too many requests' },
//     standardHeaders: true,
//     legacyHeaders: false,
//   })
// );

app.get('/favicon.ico', (_req, res) => res.sendStatus(204));
app.use('/auth', authRoutes);
app.use('/email', emailRoutes);

app.get('/', (_req, res) => {
  logger.info('Health check endpoint hit');
  return res.status(200).json({
    status: 'OK',
    message: 'Bulk Email Service is running',
    timestamp: new Date().toISOString(),
  });
});

app.use((req: Request, _res, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  logger.error(err);
  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = err.message || 'Internal server error';
  res.status(statusCode).json({ error: message });
});

process.on('unhandledRejection', (reason) =>
  logger.error(`Unhandled Rejection: ${reason}`)
);
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err}`);
  process.exit(1);
});

const PORT = Number(process.env.PORT) || 5000;

httpServer.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);

  initSocketIO(io);

  startEmailWorker();

  try {
    const res = await db.query('SELECT NOW()');
    logger.info('Database connected');
    console.log(res.rows[0]);
  } catch (err) {
    logger.error(`DB connection failed: ${err}`);
  }
});
