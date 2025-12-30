import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCoupon, useCancelCoupon } from '../hooks/useCoupons';
import { CouponUsageForm } from '../components/CouponUsageForm';
import { CouponForm } from '../components/CouponForm';
import { ImageGallery } from '../components/ImageGallery';
import { ImageUpload } from '../components/ImageUpload';
import { useAuth } from '../auth/AuthContext';
import { groupsApi } from '../api/groups.api';
import { useQuery } from '@tanstack/react-query';

export const CouponDetailsPage: React.FC = () => {
  const { groupId, couponId } = useParams<{ groupId: string; couponId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: coupon, isLoading, error } = useCoupon(groupId!, couponId!);
  const cancelMutation = useCancelCoupon(groupId!, couponId!);

  const isEditor = group?.role === 'editor' || group?.role === 'admin' || user?.id === group?.ownerUserId;
  const isAdmin = group?.role === 'admin' || user?.id === group?.ownerUserId;

  if (isLoading) {
    return <div>Loading coupon...</div>;
  }

  if (error || !coupon) {
    return <div>Error loading coupon. Please try again.</div>;
  }

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this coupon?')) {
      cancelMutation.mutate(undefined, {
        onSuccess: () => {
          navigate(`/groups/${groupId}/coupons`);
        },
      });
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(`/groups/${groupId}/coupons`)} style={{ marginBottom: '10px' }}>
          ← Back to Coupons
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{coupon.title}</h1>
          {isEditor && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowEditForm(true)}>Edit</button>
              {isAdmin && (
                <button
                  onClick={handleCancel}
                  disabled={coupon.status === 'CANCELLED' || cancelMutation.isPending}
                  style={{ backgroundColor: '#dc3545', color: 'white' }}
                >
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Coupon'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div>
          <h2>Details</h2>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Type:</td>
                <td style={{ padding: '8px' }}>{coupon.type}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Store/Multi-Coupon:</td>
                <td style={{ padding: '8px' }}>
                  {coupon.type === 'SINGLE' ? coupon.storeId || 'N/A' : coupon.multiCouponName || 'N/A'}
                  {coupon.mappingStatus === 'UNMAPPED' && (
                    <span style={{ marginLeft: '5px', color: '#dc3545' }}>(Unmapped)</span>
                  )}
                </td>
              </tr>
              {coupon.type === 'MULTI' && coupon.resolvedStoreIds && coupon.resolvedStoreIds.length > 0 && (
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>Resolved Stores:</td>
                  <td style={{ padding: '8px' }}>{coupon.resolvedStoreIds.join(', ')}</td>
                </tr>
              )}
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Status:</td>
                <td style={{ padding: '8px' }}>
                  <span
                    style={{
                      backgroundColor:
                        coupon.status === 'ACTIVE'
                          ? '#28a745'
                          : coupon.status === 'PARTIALLY_USED'
                          ? '#ffc107'
                          : coupon.status === 'EXPIRED' || coupon.status === 'CANCELLED'
                          ? '#dc3545'
                          : '#6c757d',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                  >
                    {coupon.status}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Amount:</td>
                <td style={{ padding: '8px' }}>
                  {coupon.remainingAmount.toFixed(2)} / {coupon.totalAmount.toFixed(2)} {coupon.currency}
                  <div style={{ marginTop: '5px', width: '200px', height: '10px', backgroundColor: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${(coupon.usedAmount / coupon.totalAmount) * 100}%`,
                        height: '100%',
                        backgroundColor: coupon.usedAmount === coupon.totalAmount ? '#28a745' : '#ffc107',
                      }}
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Expiry Date:</td>
                <td style={{ padding: '8px' }}>
                  {new Date(coupon.expiryDate).toLocaleDateString()}
                  {new Date(coupon.expiryDate) < new Date() && (
                    <span style={{ marginLeft: '5px', color: '#dc3545' }}>Expired</span>
                  )}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>Created:</td>
                <td style={{ padding: '8px' }}>{new Date(coupon.createdAt).toLocaleString()}</td>
              </tr>
              {coupon.notes && (
                <tr>
                  <td style={{ padding: '8px', fontWeight: 'bold', verticalAlign: 'top' }}>Notes:</td>
                  <td style={{ padding: '8px', whiteSpace: 'pre-wrap' }}>{coupon.notes}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h2>Images</h2>
          {coupon.images && coupon.images.length > 0 && (
            <ImageGallery
              images={coupon.images}
              groupId={groupId!}
              couponId={couponId!}
              canEdit={isEditor || false}
            />
          )}
          {isEditor && (
            <ImageUpload
              groupId={groupId!}
              couponId={couponId!}
              onSuccess={() => {}}
            />
          )}
        </div>
      </div>

      {isEditor && coupon.status !== 'CANCELLED' && coupon.status !== 'EXPIRED' && (
        <CouponUsageForm
          groupId={groupId!}
          couponId={couponId!}
          currentUsedAmount={coupon.usedAmount}
          totalAmount={coupon.totalAmount}
          onSuccess={() => {}}
        />
      )}

      {showEditForm && (
        <CouponForm
          groupId={groupId!}
          coupon={coupon}
          onSuccess={() => {
            setShowEditForm(false);
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
};

