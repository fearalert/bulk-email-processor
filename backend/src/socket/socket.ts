import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

interface DecodedToken {
  userId: number;
  email: string;
}

export const initSocketIO = (io: SocketIOServer) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new AppError('Authentication error: Token not provided', 401));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      logger.error(`Socket authentication failed: ${err}`);
      next(new AppError('Authentication error: Invalid token', 401));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    logger.info(`User connected via WebSocket: ${user.email} (ID: ${user.userId})`);

    socket.on('joinRoom', (roomName: string) => {
      socket.join(roomName);
      logger.info(`User ${user.email} joined room: ${roomName}`);
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected from WebSocket: ${user.email} (ID: ${user.userId})`);
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for user ${user.email}: ${err}`);
    });
  });

  logger.info('Socket.IO initialized and listening for connections.');
};
