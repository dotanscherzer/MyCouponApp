import { Router } from 'express';
import * as jobsController from '../../controllers/jobs.controller';
import { requireJobSecret } from '../../middlewares/job-auth.middleware';

const router = Router();

router.use(requireJobSecret); // All routes require job secret

router.post('/daily', jobsController.runDailyJob);

export default router;
