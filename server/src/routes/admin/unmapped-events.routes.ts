import { Router } from 'express';
import * as unmappedEventsController from '../../controllers/admin/unmapped-events.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole('super_admin')); // All routes require super_admin

router.get('/', unmappedEventsController.getUnmappedEvents);
router.patch('/:id', unmappedEventsController.updateUnmappedEvent);

export default router;
