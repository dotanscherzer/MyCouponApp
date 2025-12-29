import { Request, Response } from 'express';
import { Invitation } from '../models/Invitation.model';
import { GroupMember } from '../models/GroupMember.model';
import { User } from '../models/User.model';
import { createInvitation as createInvitationService, findInvitationByToken } from '../services/invitation.service';
import { sendInvitationEmail } from '../services/email.service';

export const createInvitationController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      res.status(400).json({ error: 'Email and role are required' });
      return;
    }

    if (!['viewer', 'editor', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    // Check if user already exists and is already a member
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      const existingMember = await GroupMember.findOne({
        groupId,
        userId: user._id,
        status: 'active',
      });

      if (existingMember) {
        res.status(409).json({ error: 'User is already a member of this group' });
        return;
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      groupId,
      invitedEmail: email.toLowerCase(),
      status: 'pending',
    });

    if (existingInvitation) {
      res.status(409).json({ error: 'Invitation already sent to this email' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Create invitation
    const token = await createInvitationService(groupId, email, role, req.user.userId);

    // Send invitation email
    try {
      await sendInvitationEmail(email, token, groupId);
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Continue even if email fails
    }

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ error: 'Failed to create invitation' });
  }
};

export const acceptInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Token is required' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Find invitation
    const invitation = await findInvitationByToken(token);
    if (!invitation) {
      res.status(404).json({ error: 'Invalid or expired invitation token' });
      return;
    }

    // Check if email matches
    if (invitation.invitedEmail.toLowerCase() !== req.user.email.toLowerCase()) {
      res.status(403).json({ error: 'This invitation is for a different email address' });
      return;
    }

    // Check if already a member
    const existingMember = await GroupMember.findOne({
      groupId: invitation.groupId,
      userId: req.user.userId,
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        res.status(409).json({ error: 'You are already a member of this group' });
        return;
      } else {
        // Reactivate removed member
        existingMember.status = 'active';
        existingMember.role = invitation.role;
        await existingMember.save();
      }
    } else {
      // Create group member
      await GroupMember.create({
        groupId: invitation.groupId,
        userId: req.user.userId,
        role: invitation.role,
        status: 'active',
      });
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
};
