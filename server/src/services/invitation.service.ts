import crypto from 'crypto';
import { Invitation } from '../models/Invitation.model';
import { hashToken } from '../utils/token.utils';

export async function generateInvitationToken(): Promise<string> {
  return crypto.randomBytes(32).toString('hex');
}

export async function createInvitation(
  groupId: string,
  invitedEmail: string,
  role: 'viewer' | 'editor' | 'admin',
  invitedByUserId: string
): Promise<string> {
  const token = await generateInvitationToken();
  const tokenHash = await hashToken(token);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await Invitation.create({
    groupId,
    invitedEmail: invitedEmail.toLowerCase(),
    role,
    tokenHash,
    expiresAt,
    status: 'pending',
    invitedByUserId,
  });

  return token;
}

export async function findInvitationByToken(token: string): Promise<any> {
  const tokenHash = await hashToken(token);
  const invitation = await Invitation.findOne({
    tokenHash,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  }).populate('groupId');

  return invitation;
}
