import { Request, Response, NextFunction } from 'express';

export const requireJobSecret = (req: Request, res: Response, next: NextFunction): void => {
  const providedSecret = req.headers['x-job-secret'];
  const expectedSecret = process.env.JOB_SECRET;

  if (!expectedSecret) {
    console.error('JOB_SECRET is not configured');
    res.status(500).json({ error: 'Job authentication not configured' });
    return;
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    res.status(401).json({ error: 'Invalid job secret' });
    return;
  }

  next();
};
