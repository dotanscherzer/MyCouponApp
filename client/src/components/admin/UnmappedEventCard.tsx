import { useState } from 'react';
import type { UnmappedEvent } from '../../api/admin/unmapped-events.api';

interface UnmappedEventCardProps {
  event: UnmappedEvent;
  onUpdate: (data: { status?: 'open' | 'handled' | 'ignored'; notes?: string }) => void;
  loading: boolean;
}

export const UnmappedEventCard: React.FC<UnmappedEventCardProps> = ({ event, onUpdate, loading }) => {
  const [notes, setNotes] = useState(event.notes || '');
  const [showNotesForm, setShowNotesForm] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#dc3545';
      case 'handled':
        return '#28a745';
      case 'ignored':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const handleStatusChange = (newStatus: 'open' | 'handled' | 'ignored') => {
    onUpdate({ status: newStatus });
  };

  const handleNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({ notes: notes.trim() || undefined });
    setShowNotesForm(false);
  };

  const couponData = typeof event.couponId === 'object' ? event.couponId : { title: event.couponId };
  const groupData = typeof event.groupId === 'object' ? event.groupId : { name: event.groupId };
  const userData = typeof event.createdByUserId === 'object' ? event.createdByUserId : { email: event.createdByUserId };

  return (
    <div
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 10px 0' }}>Multi-Coupon: {event.multiCouponName}</h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div>Coupon: {couponData.title || 'N/A'}</div>
            <div>Group: {groupData.name || 'N/A'}</div>
            <div>Created by: {userData.email || userData.displayName || 'N/A'}</div>
            <div>Created: {new Date(event.createdAt).toLocaleString()}</div>
          </div>
        </div>
        <div>
          <span
            style={{
              backgroundColor: getStatusColor(event.status),
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              textTransform: 'uppercase',
            }}
          >
            {event.status}
          </span>
        </div>
      </div>

      {event.notes && !showNotesForm && (
        <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: 'white', borderRadius: '4px' }}>
          <strong>Notes:</strong> {event.notes}
        </div>
      )}

      {showNotesForm && (
        <form onSubmit={handleNotesSubmit} style={{ marginBottom: '15px' }}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes..."
            rows={3}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '10px' }}
            disabled={loading}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Notes'}
            </button>
            <button type="button" onClick={() => setShowNotesForm(false)} disabled={loading}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {event.status !== 'handled' && (
          <button onClick={() => handleStatusChange('handled')} disabled={loading} style={{ backgroundColor: '#28a745', color: 'white' }}>
            Mark as Handled
          </button>
        )}
        {event.status !== 'ignored' && (
          <button onClick={() => handleStatusChange('ignored')} disabled={loading} style={{ backgroundColor: '#6c757d', color: 'white' }}>
            Mark as Ignored
          </button>
        )}
        {event.status !== 'open' && (
          <button onClick={() => handleStatusChange('open')} disabled={loading} style={{ backgroundColor: '#dc3545', color: 'white' }}>
            Reopen
          </button>
        )}
        <button onClick={() => setShowNotesForm(!showNotesForm)} disabled={loading}>
          {showNotesForm ? 'Cancel Notes' : 'Add/Edit Notes'}
        </button>
      </div>
    </div>
  );
};

