import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { unmappedEventsApi, UnmappedEvent } from '../../api/admin/unmapped-events.api';
import { UnmappedEventCard } from '../../components/admin/UnmappedEventCard';

export const UnmappedEventsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: events, isLoading, error } = useQuery<UnmappedEvent[]>({
    queryKey: ['admin-unmapped-events', statusFilter],
    queryFn: () => unmappedEventsApi.getUnmappedEvents(statusFilter || undefined),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; notes?: string } }) =>
      unmappedEventsApi.updateUnmappedEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-unmapped-events'] });
    },
  });

  if (isLoading) {
    return <div>Loading unmapped events...</div>;
  }

  if (error) {
    return <div>Error loading unmapped events. Please try again.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Unmapped Multi-Coupon Events</h2>
        <div>
          <label>
            Filter by Status:
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="">All</option>
              <option value="open">Open</option>
              <option value="handled">Handled</option>
              <option value="ignored">Ignored</option>
            </select>
          </label>
        </div>
      </div>

      {events && events.length === 0 ? (
        <div>No unmapped events found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {events?.map((event) => (
            <UnmappedEventCard
              key={event.id}
              event={event}
              onUpdate={(data) => updateMutation.mutate({ id: event.id, data })}
              loading={updateMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

