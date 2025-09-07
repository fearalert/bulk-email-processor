import express from 'express';
import { EmailController } from '../controllers/email.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { emailRateLimiter } from '../middlewares/rateLimitter.middleware';

const router = express.Router();
const emailController = EmailController.getInstance();

// Upload middleware
const upload = emailController.uploadMiddleware;

router.post(
  '/bulk',
  authMiddleware,       
  emailRateLimiter,   
  upload,              
  (req, res) => emailController.sendBulkEmails(req, res)
);

router.get(
  '/logs/:userId',
  authMiddleware,
  (req, res) => emailController.getLogs(req, res)
);

export default router;
