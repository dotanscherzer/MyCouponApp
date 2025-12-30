import type { Coupon } from '../api/coupons.api';

interface CouponsTableProps {
  coupons: Coupon[];
  groupId: string;
  onCouponClick: (couponId: string) => void;
  onDelete: (couponId: string) => void;
  canEdit: boolean;
}

export const CouponsTable: React.FC<CouponsTableProps> = ({ coupons, onCouponClick, onDelete, canEdit }) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '#28a745';
      case 'PARTIALLY_USED':
        return '#ffc107';
      case 'USED':
        return '#6c757d';
      case 'EXPIRED':
        return '#dc3545';
      case 'CANCELLED':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  if (coupons.length === 0) {
    return <div>No coupons found.</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f8f9fa' }}>
            <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Type</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Store/Multi</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Amount</th>
            <th style={{ textAlign: 'left', padding: '12px' }}>Expiry</th>
            {canEdit && <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr
              key={coupon.id}
              style={{
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
              }}
              onClick={() => onCouponClick(coupon.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <td style={{ padding: '12px' }}>
                {coupon.images && coupon.images.length > 0 && (
                  <img
                    src={coupon.images.find((img) => img.isPrimary)?.url || coupon.images[0].url}
                    alt={coupon.title}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px', verticalAlign: 'middle' }}
                  />
                )}
                <strong>{coupon.title}</strong>
              </td>
              <td style={{ padding: '12px' }}>{coupon.type}</td>
              <td style={{ padding: '12px' }}>
                {coupon.type === 'SINGLE' ? (
                  <span>{coupon.storeId || 'N/A'}</span>
                ) : (
                  <span>{coupon.multiCouponName || 'N/A'}</span>
                )}
                {coupon.mappingStatus === 'UNMAPPED' && (
                  <span style={{ marginLeft: '5px', color: '#dc3545' }}>(Unmapped)</span>
                )}
              </td>
              <td style={{ padding: '12px' }}>
                <span
                  style={{
                    backgroundColor: getStatusBadgeColor(coupon.status),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {coupon.status}
                </span>
              </td>
              <td style={{ padding: '12px' }}>
                {coupon.remainingAmount.toFixed(2)} / {coupon.totalAmount.toFixed(2)} {coupon.currency}
              </td>
              <td style={{ padding: '12px' }}>
                {new Date(coupon.expiryDate).toLocaleDateString()}
                {new Date(coupon.expiryDate) < new Date() && (
                  <span style={{ marginLeft: '5px', color: '#dc3545' }}>Expired</span>
                )}
              </td>
              {canEdit && (
                <td style={{ padding: '12px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onDelete(coupon.id)}
                    style={{ backgroundColor: '#dc3545', color: 'white', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

