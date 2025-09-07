import Redis from "ioredis";

export class RedisConnection {
  private static instance: Redis;
  
  private constructor() {}
  
  public static getInstance(): Redis {
    if (!RedisConnection.instance) {
      const port = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;
      const host = process.env.REDIS_HOST || 'localhost';
      
      if (isNaN(port) || port <= 0 || port >= 65536) {
        throw new Error(`Invalid Redis port: ${process.env.REDIS_PORT}. Must be between 1 and 65535`);
      }
      
      RedisConnection.instance = new Redis({
        host,
        port,
        maxRetriesPerRequest: null,
        lazyConnect: true,
      });
    }
    return RedisConnection.instance;
  }
}

export const connection = RedisConnection.getInstance();