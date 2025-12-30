import { useMutation, useQueryClient } from '@tanstack/react-query';
import { membersApi, Member } from '../api/members.api';

interface MembersListProps {
  members: Member[];
  groupId: string;
  isAdmin: boolean;
  currentUserId: string;
}

export const MembersList: React.FC<MembersListProps> = ({ members, groupId, isAdmin, currentUserId }) => {
  const queryClient = useQueryClient();

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'viewer' | 'editor' | 'admin' }) =>
      membersApi.updateMemberRole(groupId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => membersApi.removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', groupId] });
    },
  });

  const handleRoleChange = (userId: string, newRole: 'viewer' | 'editor' | 'admin') => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };

  const handleRemove = (userId: string, displayName: string) => {
    if (confirm(`Are you sure you want to remove ${displayName} from this group?`)) {
      removeMemberMutation.mutate(userId);
    }
  };

  if (members.length === 0) {
    return <div>No members yet.</div>;
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>Role</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>Joined</th>
            {isAdmin && <th style={{ textAlign: 'left', padding: '10px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.userId} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '10px' }}>{member.displayName}</td>
              <td style={{ padding: '10px' }}>{member.email}</td>
              <td style={{ padding: '10px' }}>
                {isAdmin && member.userId !== currentUserId ? (
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.userId, e.target.value as 'viewer' | 'editor' | 'admin')
                    }
                    disabled={updateRoleMutation.isPending}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span>{member.role}</span>
                )}
              </td>
              <td style={{ padding: '10px' }}>{new Date(member.joinedAt).toLocaleDateString()}</td>
              {isAdmin && (
                <td style={{ padding: '10px' }}>
                  {member.userId !== currentUserId && (
                    <button
                      onClick={() => handleRemove(member.userId, member.displayName)}
                      style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px' }}
                      disabled={removeMemberMutation.isPending}
                    >
                      Remove
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

