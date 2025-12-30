import { Request, Response } from 'express';
import { GroupMember } from '../models/GroupMember.model';

export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;

    const members = await GroupMember.find({
      groupId,
      status: 'active',
    }).populate('userId', 'email displayName photoUrl');

    const membersList = members.map((member: any) => ({
      userId: member.userId._id,
      email: member.userId.email,
      displayName: member.userId.displayName,
      photoUrl: member.userId.photoUrl,
      role: member.role,
      joinedAt: member.createdAt,
    }));

    res.json(membersList);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to get members' });
  }
};

export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, userId } = req.params;
    const { role } = req.body;

    if (!role || !['viewer', 'editor', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Valid role is required' });
      return;
    }

    const member = await GroupMember.findOneAndUpdate(
      {
        groupId,
        userId,
        status: 'active',
      },
      { role },
      { new: true }
    );

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json({
      userId: member.userId,
      role: member.role,
      status: member.status,
    });
  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({ error: 'Failed to update member role' });
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, userId } = req.params;

    // Don't allow removing yourself (should be handled by leaving group if needed)
    if (userId === req.user?.userId) {
      res.status(400).json({ error: 'Cannot remove yourself. Leave the group instead.' });
      return;
    }

    const member = await GroupMember.findOneAndUpdate(
      {
        groupId,
        userId,
        status: 'active',
      },
      { status: 'removed' },
      { new: true }
    );

    if (!member) {
      res.status(404).json({ error: 'Member not found' });
      return;
    }

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
