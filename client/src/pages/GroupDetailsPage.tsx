import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { groupsApi } from '../api/groups.api';
import { membersApi } from '../api/members.api';
import { useAuth } from '../auth/AuthContext';
import { MembersList } from '../components/MembersList';
import { InviteMember } from '../components/InviteMember';
import { GroupForm } from '../components/GroupForm';

export const GroupDetailsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'coupons' | 'members' | 'settings'>('coupons');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: members } = useQuery({
    queryKey: ['members', groupId],
    queryFn: () => membersApi.getMembers(groupId!),
    enabled: !!groupId && activeTab === 'members',
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string }) => groupsApi.updateGroup(groupId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowEditForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => groupsApi.deleteGroup(groupId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      navigate('/groups');
    },
  });

  const isAdmin = group?.role === 'admin' || user?.id === group?.ownerUserId;

  if (isLoading) {
    return <div>Loading group...</div>;
  }

  if (error || !group) {
    return <div>Error loading group. Please try again.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/groups')} style={{ marginBottom: '10px' }}>
          ← Back to Groups
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{group.name}</h1>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowEditForm(true)}>Edit</button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this group?')) {
                    deleteMutation.mutate();
                  }
                }}
                style={{ backgroundColor: '#dc3545', color: 'white' }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('coupons')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'coupons' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Coupons
        </button>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'members' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Members
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: activeTab === 'settings' ? '#f0f0f0' : 'transparent',
              cursor: 'pointer',
            }}
          >
            Settings
          </button>
        )}
      </div>

      {activeTab === 'coupons' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={() => navigate(`/groups/${groupId}/coupons`)}>View All Coupons</button>
          </div>
          <p>Click the button above to view and manage coupons for this group.</p>
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          {isAdmin && (
            <div style={{ marginBottom: '20px' }}>
              <button onClick={() => setShowInviteForm(true)}>Invite Member</button>
            </div>
          )}
          <MembersList
            members={members || []}
            groupId={groupId!}
            isAdmin={isAdmin || false}
            currentUserId={user?.id || ''}
          />
        </div>
      )}

      {activeTab === 'settings' && isAdmin && (
        <div>
          <h2>Group Settings</h2>
          <p>Group settings will be available here.</p>
        </div>
      )}

      {showEditForm && (
        <GroupForm
          initialData={{ name: group.name }}
          onSubmit={(data) => updateMutation.mutate(data)}
          onCancel={() => setShowEditForm(false)}
          loading={updateMutation.isPending}
        />
      )}

      {showInviteForm && (
        <InviteMember
          groupId={groupId!}
          onSuccess={() => {
            setShowInviteForm(false);
            queryClient.invalidateQueries({ queryKey: ['members', groupId] });
          }}
          onCancel={() => setShowInviteForm(false)}
        />
      )}
    </div>
  );
};

