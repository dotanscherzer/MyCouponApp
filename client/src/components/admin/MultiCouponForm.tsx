import { useState, useEffect } from 'react';
import type { MultiCouponDefinition } from '../../api/admin/multi-coupons.api';
import type { Store } from '../../api/admin/stores.api';

interface MultiCouponFormProps {
  stores: Store[];
  onSubmit: (data: { name: string; storeIds: string[]; isActive?: boolean }) => void;
  onCancel: () => void;
  initialData?: MultiCouponDefinition;
  loading?: boolean;
}

export const MultiCouponForm: React.FC<MultiCouponFormProps> = ({
  stores,
  onSubmit,
  onCancel,
  initialData,
  loading = false,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>(initialData?.storeIds || []);
  const [isActive, setIsActive] = useState(initialData?.isActive !== undefined ? initialData.isActive : true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSelectedStoreIds(initialData.storeIds);
      setIsActive(initialData.isActive);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Multi-coupon name is required');
      return;
    }

    if (selectedStoreIds.length === 0) {
      setError('Please select at least one store');
      return;
    }

    onSubmit({ name: name.trim(), storeIds: selectedStoreIds, isActive });
  };

  const toggleStore = (storeId: string) => {
    if (selectedStoreIds.includes(storeId)) {
      setSelectedStoreIds(selectedStoreIds.filter((id) => id !== storeId));
    } else {
      setSelectedStoreIds([...selectedStoreIds, storeId]);
    }
  };

  const activeStores = stores.filter((s) => s.isActive);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '20px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>{initialData ? 'Edit Multi-Coupon' : 'Create Multi-Coupon'}</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label>
              Multi-Coupon Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Stores: * (Select at least one)
            </label>
            <div
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '10px',
              }}
            >
              {activeStores.length === 0 ? (
                <div>No active stores available. Please create stores first.</div>
              ) : (
                activeStores.map((store) => (
                  <label
                    key={store.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStoreIds.includes(store.id)}
                      onChange={() => toggleStore(store.id)}
                      disabled={loading}
                      style={{ marginRight: '10px' }}
                    />
                    {store.name}
                  </label>
                ))
              )}
            </div>
            {selectedStoreIds.length > 0 && (
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                Selected: {selectedStoreIds.length} store(s)
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={loading}
              />
              Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

