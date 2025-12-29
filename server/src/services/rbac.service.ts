import { GroupMember } from '../models/GroupMember.model';
import { Types } from 'mongoose';

export type GroupRole = 'viewer' | 'editor' | 'admin';
export type AppRole = 'user' | 'super_admin';

export async function getUserGroupRole(userId: string, groupId: string): Promise<GroupRole | null> {
  const member = await GroupMember.findOne({
    groupId: new Types.ObjectId(groupId),
    userId: new Types.ObjectId(userId),
    status: 'active',
  });

  return member ? (member.role as GroupRole) : null;
}

export async function checkGroupPermission(
  userId: string,
  groupId: string,
  requiredRoles: GroupRole[]
): Promise<boolean> {
  const role = await getUserGroupRole(userId, groupId);
  if (!role) return false;
  return requiredRoles.includes(role);
}
