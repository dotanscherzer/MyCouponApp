import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.use(requireAuth); // All routes require authentication

router.get('/me', usersController.getMe);
router.put('/me', usersController.updateMe);
router.get('/me/notifications', usersController.getNotificationPreferences);
router.put('/me/notifications', usersController.updateNotificationPreferences);

export default router;
