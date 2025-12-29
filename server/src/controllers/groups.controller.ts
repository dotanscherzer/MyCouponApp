import { Request, Response } from 'express';
import { Group } from '../models/Group.model';
import { GroupMember } from '../models/GroupMember.model';
import { Types } from 'mongoose';

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    // Create group
    const group = await Group.create({
      name,
      ownerUserId: req.user.userId,
    });

    // Create group member record for owner with admin role
    await GroupMember.create({
      groupId: group._id,
      userId: req.user.userId,
      role: 'admin',
      status: 'active',
    });

    res.status(201).json({
      id: group._id,
      name: group.name,
      ownerUserId: group.ownerUserId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
};

export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Find all groups where user is a member
    const memberships = await GroupMember.find({
      userId: req.user.userId,
      status: 'active',
    }).populate('groupId');

    const groups = memberships.map((membership: any) => ({
      id: membership.groupId._id,
      name: membership.groupId.name,
      ownerUserId: membership.groupId.ownerUserId,
      role: membership.role,
      createdAt: membership.groupId.createdAt,
      updatedAt: membership.groupId.updatedAt,
    }));

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Failed to get groups' });
  }
};

export const getGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.json({
      id: group._id,
      name: group.name,
      ownerUserId: group.ownerUserId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to get group' });
  }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Group name is required' });
      return;
    }

    const group = await Group.findByIdAndUpdate(
      groupId,
      { name },
      { new: true, runValidators: true }
    );

    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    res.json({
      id: group._id,
      name: group.name,
      ownerUserId: group.ownerUserId,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ error: 'Group not found' });
      return;
    }

    // Check if user is owner or admin
    if (group.ownerUserId.toString() !== req.user?.userId) {
      const member = await GroupMember.findOne({
        groupId: new Types.ObjectId(groupId),
        userId: req.user?.userId,
        role: 'admin',
        status: 'active',
      });

      if (!member) {
        res.status(403).json({ error: 'Only owner or admin can delete group' });
        return;
      }
    }

    await Group.findByIdAndDelete(groupId);
    
    // Delete all group members
    await GroupMember.deleteMany({ groupId: new Types.ObjectId(groupId) });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
};
