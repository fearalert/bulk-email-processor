import { Queue } from 'bullmq';
import dotenv from 'dotenv';
import { connection } from '../db/redisClient';
dotenv.config();


export const emailQueue = new Queue('emailQueue', { connection });