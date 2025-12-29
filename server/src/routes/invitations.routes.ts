import { Router } from 'express';
import * as invitationsController from '../controllers/invitations.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireGroupRole } from '../middlewares/rbac.middleware';

const router = Router();

router.use(requireAuth);

router.post('/groups/:groupId/invitations', requireGroupRole(['admin']), invitationsController.createInvitationController);
router.post('/accept', invitationsController.acceptInvitation);

export default router;
