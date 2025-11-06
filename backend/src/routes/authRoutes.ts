import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/sso/login', authController.ssoLogin);
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authController.logout);

export default router;
