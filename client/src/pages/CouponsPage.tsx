import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCoupons, useDeleteCoupon } from '../hooks/useCoupons';
import { CouponsTable } from '../components/CouponsTable';
import { CouponFilters } from '../components/CouponFilters';
import { CouponForm } from '../components/CouponForm';
import { useAuth } from '../auth/AuthContext';
import { groupsApi } from '../api/groups.api';
import { useQuery } from '@tanstack/react-query';

export const CouponsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<{
    storeId?: string;
    status?: string;
    mappingStatus?: string;
    expiringInDays?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }>({});

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: coupons, isLoading, error } = useCoupons(groupId!, filters);
  const deleteMutation = useDeleteCoupon(groupId!);

  const isEditor = group?.role === 'editor' || group?.role === 'admin' || user?.id === group?.ownerUserId;

  if (isLoading) {
    return <div>Loading coupons...</div>;
  }

  if (error) {
    return <div>Error loading coupons. Please try again.</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(`/groups/${groupId}`)} style={{ marginBottom: '10px' }}>
          ← Back to Group
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Coupons{group ? ` - ${group.name}` : ''}</h1>
          {isEditor && (
            <button onClick={() => setShowCreateForm(true)}>Create Coupon</button>
          )}
        </div>
      </div>

      <CouponFilters filters={filters} onFiltersChange={setFilters} />

      {showCreateForm && (
        <CouponForm
          groupId={groupId!}
          onSuccess={() => {
            setShowCreateForm(false);
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <CouponsTable
        coupons={coupons || []}
        groupId={groupId!}
        onCouponClick={(couponId) => navigate(`/groups/${groupId}/coupons/${couponId}`)}
        onDelete={(couponId) => {
          if (confirm('Are you sure you want to delete this coupon?')) {
            deleteMutation.mutate(couponId);
          }
        }}
        canEdit={isEditor || false}
      />
    </div>
  );
};

