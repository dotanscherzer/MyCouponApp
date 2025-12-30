import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { groupsApi } from '../api/groups.api';
import type { Group } from '../api/groups.api';
import { GroupForm } from '../components/GroupForm';

export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: groups, isLoading, error } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getGroups(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => groupsApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowCreateForm(false);
    },
  });

  if (isLoading) {
    return <div>Loading groups...</div>;
  }

  if (error) {
    return <div>Error loading groups. Please try again.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Groups</h1>
        <button onClick={() => setShowCreateForm(true)}>Create Group</button>
      </div>

      {showCreateForm && (
        <GroupForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
          loading={createMutation.isPending}
        />
      )}

      {groups && groups.length === 0 ? (
        <div>No groups yet. Create your first group to get started.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {groups?.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/groups/${group.id}`)}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h2 style={{ margin: '0 0 10px 0' }}>{group.name}</h2>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

