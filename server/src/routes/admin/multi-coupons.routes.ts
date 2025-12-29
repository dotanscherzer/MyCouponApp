import { Router } from 'express';
import * as multiCouponsController from '../../controllers/admin/multi-coupons.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole('super_admin')); // All routes require super_admin

router.get('/', multiCouponsController.getMultiCoupons);
router.post('/', multiCouponsController.createMultiCoupon);
router.put('/:id', multiCouponsController.updateMultiCoupon);
router.delete('/:id', multiCouponsController.deleteMultiCoupon);
router.post('/:id/resolve-unmapped', multiCouponsController.resolveUnmapped);

export default router;
