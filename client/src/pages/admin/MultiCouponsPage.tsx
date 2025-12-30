import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { multiCouponsApi, MultiCouponDefinition } from '../../api/admin/multi-coupons.api';
import { storesApi } from '../../api/admin/stores.api';
import { MultiCouponForm } from '../../components/admin/MultiCouponForm';
import { ResolveUnmappedButton } from '../../components/admin/ResolveUnmappedButton';

export const MultiCouponsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMultiCoupon, setEditingMultiCoupon] = useState<MultiCouponDefinition | null>(null);

  const { data: multiCoupons, isLoading, error } = useQuery<MultiCouponDefinition[]>({
    queryKey: ['admin-multi-coupons'],
    queryFn: () => multiCouponsApi.getMultiCoupons(),
  });

  const { data: stores } = useQuery({
    queryKey: ['admin-stores'],
    queryFn: () => storesApi.getStores(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; storeIds: string[]; isActive?: boolean }) =>
      multiCouponsApi.createMultiCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-multi-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['multi-coupon-suggestions'] });
      setShowCreateForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; storeIds?: string[]; isActive?: boolean } }) =>
      multiCouponsApi.updateMultiCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-multi-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['multi-coupon-suggestions'] });
      setEditingMultiCoupon(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => multiCouponsApi.deleteMultiCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-multi-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['multi-coupon-suggestions'] });
    },
  });

  if (isLoading) {
    return <div>Loading multi-coupons...</div>;
  }

  if (error) {
    return <div>Error loading multi-coupons. Please try again.</div>;
  }

  const getStoreNames = (storeIds: string[]): string[] => {
    if (!stores) return storeIds;
    return storeIds.map((id) => stores.find((s) => s.id === id)?.name || id);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Multi-Coupon Definitions</h2>
        <button onClick={() => setShowCreateForm(true)}>Create Multi-Coupon</button>
      </div>

      {showCreateForm && stores && (
        <MultiCouponForm
          stores={stores}
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
          loading={createMutation.isPending}
        />
      )}

      {editingMultiCoupon && stores && (
        <MultiCouponForm
          stores={stores}
          initialData={editingMultiCoupon}
          onSubmit={(data) => updateMutation.mutate({ id: editingMultiCoupon.id, data })}
          onCancel={() => setEditingMultiCoupon(null)}
          loading={updateMutation.isPending}
        />
      )}

      {multiCoupons && multiCoupons.length === 0 ? (
        <div>No multi-coupon definitions yet. Create your first definition.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Stores</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Created</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {multiCoupons?.map((multiCoupon) => (
                <tr key={multiCoupon.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{multiCoupon.name}</td>
                  <td style={{ padding: '12px' }}>
                    {getStoreNames(multiCoupon.storeIds).join(', ') || 'No stores'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        backgroundColor: multiCoupon.isActive ? '#28a745' : '#6c757d',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {multiCoupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(multiCoupon.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button onClick={() => setEditingMultiCoupon(multiCoupon)}>Edit</button>
                      <ResolveUnmappedButton definitionId={multiCoupon.id} definitionName={multiCoupon.name} />
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${multiCoupon.name}"?`)) {
                            deleteMutation.mutate(multiCoupon.id);
                          }
                        }}
                        style={{ backgroundColor: '#dc3545', color: 'white' }}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

