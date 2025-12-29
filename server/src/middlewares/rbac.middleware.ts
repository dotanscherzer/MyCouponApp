import { Request, Response, NextFunction } from 'express';
import { getUserGroupRole, checkGroupPermission, GroupRole, AppRole } from '../services/rbac.service';

export const requireRole = (requiredRole: AppRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (req.user.appRole !== requiredRole) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requireGroupMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const groupId = req.params.groupId;
    if (!groupId) {
      res.status(400).json({ error: 'Group ID is required' });
      return;
    }

    const role = await getUserGroupRole(req.user.userId, groupId);
    if (!role) {
      res.status(403).json({ error: 'You are not a member of this group' });
      return;
    }

    // Attach group role to request for later use
    (req as any).groupRole = role;
    next();
  } catch (error) {
    console.error('requireGroupMember error:', error);
    res.status(500).json({ error: 'Failed to check group membership' });
  }
};

export const requireGroupRole = (requiredRoles: GroupRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const groupId = req.params.groupId;
      if (!groupId) {
        res.status(400).json({ error: 'Group ID is required' });
        return;
      }

      const hasPermission = await checkGroupPermission(req.user.userId, groupId, requiredRoles);
      if (!hasPermission) {
        res.status(403).json({ error: 'Insufficient group permissions' });
        return;
      }

      const role = await getUserGroupRole(req.user.userId, groupId);
      (req as any).groupRole = role;
      next();
    } catch (error) {
      console.error('requireGroupRole error:', error);
      res.status(500).json({ error: 'Failed to check group permissions' });
    }
  };
};
