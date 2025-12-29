import { Router } from 'express';
import * as storesController from '../../controllers/admin/stores.controller';
import { requireAuth } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/rbac.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole('super_admin')); // All routes require super_admin

router.get('/', storesController.getStores);
router.post('/', storesController.createStore);
router.put('/:storeId', storesController.updateStore);
router.delete('/:storeId', storesController.deleteStore);

export default router;
