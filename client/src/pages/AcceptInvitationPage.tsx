import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { invitationsApi } from '../api/invitations.api';

export const AcceptInvitationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [error, setError] = useState('');

  const acceptMutation = useMutation({
    mutationFn: (token: string) => invitationsApi.acceptInvitation(token),
    onSuccess: () => {
      navigate('/groups');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to accept invitation');
    },
  });

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      return;
    }

    if (confirm('Do you want to accept this invitation?')) {
      acceptMutation.mutate(token);
    } else {
      navigate('/groups');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (acceptMutation.isPending) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
        <div>Accepting invitation...</div>
      </div>
    );
  }

  if (error || acceptMutation.isError) {
    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
        <h1>Invitation Error</h1>
        <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>
        <button onClick={() => navigate('/groups')}>Go to Groups</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      <div>Redirecting...</div>
    </div>
  );
};

