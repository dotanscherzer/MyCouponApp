import { Router } from 'express';
import * as membersController from '../controllers/members.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireGroupRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(requireAuth);

router.get('/groups/:groupId/members', requireGroupRole(['admin']), membersController.getMembers);
router.patch('/groups/:groupId/members/:userId', requireGroupRole(['admin']), membersController.updateMemberRole);
router.delete('/groups/:groupId/members/:userId', requireGroupRole(['admin']), membersController.removeMember);

export default router;
