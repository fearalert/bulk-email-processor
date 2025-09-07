import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authRateLimiter } from '../middlewares/rateLimitter.middleware';

const router = Router();
const authController = AuthController.getInstance();

router.post('/register',
    // authRateLimiter,
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

export default router;
