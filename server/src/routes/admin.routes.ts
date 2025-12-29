import { Router } from 'express';
import storesRoutes from './admin/stores.routes';
import multiCouponsRoutes from './admin/multi-coupons.routes';
import unmappedEventsRoutes from './admin/unmapped-events.routes';

const router = Router();

router.use('/stores', storesRoutes);
router.use('/multi-coupons', multiCouponsRoutes);
router.use('/unmapped-multi-events', unmappedEventsRoutes);

export default router;
