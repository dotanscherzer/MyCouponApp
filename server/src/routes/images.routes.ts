import { Router } from 'express';
import * as imagesController from '../controllers/images.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireGroupMember, requireGroupRole } from '../middlewares/rbac.middleware';

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireGroupMember); // All routes require group membership

router.post('/init-upload', requireGroupRole(['editor', 'admin']), imagesController.initUpload);
router.post('/', requireGroupRole(['editor', 'admin']), imagesController.associateImage);
router.delete('/:imageId', requireGroupRole(['editor', 'admin']), imagesController.deleteImageController);

export default router;
