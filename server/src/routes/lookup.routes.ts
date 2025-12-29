import { Router } from 'express';
import * as lookupController from '../controllers/lookup.controller';

const router = Router();

router.get('/stores', lookupController.lookupStores);
router.get('/multi-coupons', lookupController.lookupMultiCoupons);

export default router;
