import { Router } from 'express';
import * as groupsController from '../controllers/groups.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireGroupMember, requireGroupRole } from '../middlewares/rbac.middleware';
import couponsRoutes from './coupons.routes';
import imagesRoutes from './images.routes';

const router = Router();

router.use(requireAuth); // All routes require authentication

router.post('/', groupsController.createGroup);
router.get('/', groupsController.getGroups);
router.get('/:groupId', requireGroupMember, groupsController.getGroup);
router.put('/:groupId', requireGroupMember, requireGroupRole(['admin']), groupsController.updateGroup);
router.delete('/:groupId', requireGroupMember, groupsController.deleteGroup); // Check in controller for owner/admin

// Coupons routes nested under groups
router.use('/:groupId/coupons', couponsRoutes);
// Images routes nested under coupons
router.use('/:groupId/coupons/:couponId/images', imagesRoutes);

export default router;
