import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rateLimitter.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authController = AuthController.getInstance();

router.post('/register',
    authRateLimiter,
    (req, res) => authController.register(req, res)
);
router.get('/verify', 
    authRateLimiter,
    (req, res) => authController.verify(req, res)
);

router.post('/login', 
    authRateLimiter,
    (req, res) => authController.login(req, res)
);

router.get('/me', 
    authMiddleware,
    (req, res) => authController.me(req, res)
);

router.post('/logout', 
    authMiddleware,
    (req, res) => authController.logout(req, res)
);

export default router;
