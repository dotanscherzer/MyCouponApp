import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { storesApi } from '../../api/admin/stores.api';
import type { Store } from '../../api/admin/stores.api';
import { StoreForm } from '../../components/admin/StoreForm';

export const StoresPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);

  const { data: stores, isLoading, error } = useQuery<Store[]>({
    queryKey: ['admin-stores'],
    queryFn: () => storesApi.getStores(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; isActive?: boolean }) => storesApi.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      queryClient.invalidateQueries({ queryKey: ['store-suggestions'] });
      setShowCreateForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: { name?: string; isActive?: boolean } }) =>
      storesApi.updateStore(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      queryClient.invalidateQueries({ queryKey: ['store-suggestions'] });
      setEditingStore(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (storeId: string) => storesApi.deleteStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
      queryClient.invalidateQueries({ queryKey: ['store-suggestions'] });
    },
  });

  if (isLoading) {
    return <div>Loading stores...</div>;
  }

  if (error) {
    return <div>Error loading stores. Please try again.</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Stores Management</h2>
        <button onClick={() => setShowCreateForm(true)}>Create Store</button>
      </div>

      {showCreateForm && (
        <StoreForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
          loading={createMutation.isPending}
        />
      )}

      {editingStore && (
        <StoreForm
          initialData={editingStore}
          onSubmit={(data) => updateMutation.mutate({ storeId: editingStore.id, data })}
          onCancel={() => setEditingStore(null)}
          loading={updateMutation.isPending}
        />
      )}

      {stores && stores.length === 0 ? (
        <div>No stores yet. Create your first store.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Created</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores?.map((store) => (
                <tr key={store.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{store.name}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        backgroundColor: store.isActive ? '#28a745' : '#6c757d',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {store.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{new Date(store.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setEditingStore(store)}>Edit</button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${store.name}"?`)) {
                            deleteMutation.mutate(store.id);
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

