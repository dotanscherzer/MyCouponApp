import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users.api';
import type { User } from '../api/users.api';

export const ProfileForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['user-me'],
    queryFn: () => usersApi.getMe(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { displayName?: string; photoUrl?: string }) => usersApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-me'] });
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update profile');
    },
  });

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setPhotoUrl(user.photoUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    updateMutation.mutate({
      displayName: displayName.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
    });
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2>Profile Settings</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#efe' }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label>
            Display Name:
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              disabled={updateMutation.isPending}
            />
          </label>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>
            Photo URL:
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              disabled={updateMutation.isPending}
            />
          </label>
          {photoUrl && (
            <img
              src={photoUrl}
              alt="Profile preview"
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginTop: '10px' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

