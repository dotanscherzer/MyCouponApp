import { Request, Response } from 'express';
import { runDailyExpiryJob } from '../jobs/daily-expiry.job';

export const runDailyJob = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await runDailyExpiryJob();
    res.json(result);
  } catch (error) {
    console.error('Daily job execution error:', error);
    res.status(500).json({ error: 'Failed to run daily job' });
  }
};
