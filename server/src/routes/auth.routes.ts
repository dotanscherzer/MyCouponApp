import { Router } from 'express';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/google/start', authController.googleStart);
router.get('/google/callback', authController.googleCallback);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
