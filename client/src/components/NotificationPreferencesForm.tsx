import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, NotificationPreferences } from '../api/users.api';

export const NotificationPreferencesForm: React.FC = () => {
  const queryClient = useQueryClient();
  const [enabled, setEnabled] = useState(false);
  const [daysBefore, setDaysBefore] = useState<number[]>([]);
  const [timezone, setTimezone] = useState('Asia/Jerusalem');
  const [emailDigest, setEmailDigest] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { data: preferences, isLoading } = useQuery<NotificationPreferences>({
    queryKey: ['notification-preferences'],
    queryFn: () => usersApi.getNotificationPreferences(),
  });

  const updateMutation = useMutation({
    mutationFn: (data: NotificationPreferences) => usersApi.updateNotificationPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setSuccess('Notification preferences updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update preferences');
    },
  });

  useEffect(() => {
    if (preferences) {
      setEnabled(preferences.enabled);
      setDaysBefore(preferences.daysBefore || []);
      setTimezone(preferences.timezone || 'Asia/Jerusalem');
      setEmailDigest(preferences.emailDigest || false);
    }
  }, [preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    updateMutation.mutate({
      enabled,
      daysBefore,
      timezone,
      emailDigest,
    });
  };

  const toggleDay = (day: number) => {
    if (daysBefore.includes(day)) {
      setDaysBefore(daysBefore.filter((d) => d !== day));
    } else {
      setDaysBefore([...daysBefore, day].sort((a, b) => a - b));
    }
  };

  const availableDays = [1, 3, 7, 14, 30];

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2>Notification Preferences</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px', padding: '10px', backgroundColor: '#fee' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '10px', padding: '10px', backgroundColor: '#efe' }}>{success}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={updateMutation.isPending}
            />
            Enable expiry notifications
          </label>
        </div>

        {enabled && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                Notify me when coupons expire in (days):
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {availableDays.map((day) => (
                  <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="checkbox"
                      checked={daysBefore.includes(day)}
                      onChange={() => toggleDay(day)}
                      disabled={updateMutation.isPending}
                    />
                    {day} day{day !== 1 ? 's' : ''}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>
                Timezone:
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={updateMutation.isPending}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                >
                  <option value="Asia/Jerusalem">Asia/Jerusalem (IST)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                </select>
              </label>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  disabled={updateMutation.isPending}
                />
                Send daily email digest
              </label>
            </div>
          </>
        )}

        <button type="submit" disabled={updateMutation.isPending}>
          {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
};

