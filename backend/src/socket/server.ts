import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import logger from '../utils/logger';

export class SocketServer {
  private static instance: SocketServer;
  private io!: SocketIOServer;

  private constructor() {}

  public static getInstance(): SocketServer {
    if (!SocketServer.instance) {
      SocketServer.instance = new SocketServer();
    }
    return SocketServer.instance;
  }

  public init(httpServer: HTTPServer) {
    if (this.io) return this.io;

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || [
          'http://localhost:3000',
          'http://localhost:5173',
        ],
        credentials: true,
      },
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('disconnect', (reason) => {
        logger.info(`Socket disconnected: ${socket.id}, reason: ${reason}`);
      });

    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io not initialized. Call init() first.');
    }
    return this.io;
  }
}
