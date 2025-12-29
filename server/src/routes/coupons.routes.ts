import { Router } from 'express';
import * as couponsController from '../controllers/coupons.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireGroupMember, requireGroupRole } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireGroupMember); // All routes require group membership

router.get('/', couponsController.getCoupons);
router.post('/', requireGroupRole(['editor', 'admin']), couponsController.createCouponController);
router.get('/:couponId', couponsController.getCoupon);
router.put('/:couponId', requireGroupRole(['editor', 'admin']), couponsController.updateCouponController);
router.delete('/:couponId', requireGroupRole(['admin']), couponsController.deleteCouponController);
router.post('/:couponId/usage', requireGroupRole(['editor', 'admin']), couponsController.updateUsage);
router.post('/:couponId/cancel', requireGroupRole(['editor', 'admin']), couponsController.cancelCoupon);

export default router;
