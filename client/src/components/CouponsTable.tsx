import React, { useState, useEffect } from 'react';
import type { Coupon } from '../api/coupons.api';
import { Badge } from './ui/Badge/Badge';
import { Card } from './ui/Card/Card';
import { Skeleton } from './ui/Skeleton/Skeleton';
import { ActionsMenu, type ActionItem } from './ui/DropdownMenu/ActionsMenu';
import { resolveStoreName } from '../utils/storeResolver';
import styles from './CouponsTable.module.css';

interface CouponsTableProps {
  coupons: Coupon[];
  groupId: string;
  onCouponClick: (couponId: string) => void;
  onEdit: (couponId: string) => void;
  onDelete: (couponId: string) => void;
  onMarkAsUsed?: (couponId: string) => void;
  canEdit: boolean;
  isLoading?: boolean;
}

const getStatusVariant = (status: string, expiryDate: string): 'active' | 'used' | 'expiring' | 'expired' | 'inactive' => {
  if (status === 'EXPIRED') return 'expired';
  if (status === 'USED' || status === 'CANCELLED') return 'used';
  if (status === 'ACTIVE') {
    const daysUntilExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) return 'expiring';
    return 'active';
  }
  return 'inactive';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    ACTIVE: 'פעיל',
    PARTIALLY_USED: 'בשימוש חלקי',
    USED: 'משומש',
    EXPIRED: 'פג תוקף',
    CANCELLED: 'בוטל',
  };
  return labels[status] || status;
};

export const CouponsTable: React.FC<CouponsTableProps> = ({
  coupons,
  groupId: _groupId,
  onCouponClick,
  onEdit,
  onDelete,
  onMarkAsUsed,
  canEdit,
  isLoading = false,
}) => {
  const [storeNames, setStoreNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadStoreNames = async () => {
      const names: Record<string, string> = {};
      for (const coupon of coupons) {
        if (coupon.type === 'SINGLE' && coupon.storeId && !names[coupon.storeId]) {
          try {
            names[coupon.storeId] = await resolveStoreName(coupon.storeId);
          } catch (error) {
            names[coupon.storeId] = coupon.storeId;
          }
        }
      }
      setStoreNames(names);
    };

    if (coupons.length > 0) {
      loadStoreNames();
    }
  }, [coupons]);

  const getStoreDisplay = (coupon: Coupon): string => {
    if (coupon.type === 'SINGLE') {
      return storeNames[coupon.storeId || ''] || coupon.storeId || 'N/A';
    }
    return coupon.multiCouponName || 'N/A';
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Skeleton height={60} className={styles.skeletonRow} />
        <Skeleton height={60} className={styles.skeletonRow} />
        <Skeleton height={60} className={styles.skeletonRow} />
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <Card className={styles.emptyState}>
        <p className={styles.emptyText}>לא נמצאו קופונים</p>
      </Card>
    );
  }

  const CouponCard = ({ coupon }: { coupon: Coupon }) => {
    const actions: ActionItem[] = [
      { label: 'צפייה', onClick: () => onCouponClick(coupon.id) },
    ];

    if (canEdit) {
      actions.push({ label: 'עריכה', onClick: () => onEdit(coupon.id) });
      if (onMarkAsUsed && coupon.status !== 'USED' && coupon.status !== 'EXPIRED') {
        actions.push({ label: 'סמן כמשומש', onClick: () => onMarkAsUsed(coupon.id) });
      }
      actions.push({
        label: 'מחיקה',
        onClick: () => onDelete(coupon.id),
        variant: 'danger',
      });
    }

    return (
      <Card className={styles.card} onClick={() => onCouponClick(coupon.id)}>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleRow}>
            {coupon.images && coupon.images.length > 0 && (
              <img
                src={coupon.images.find((img) => img.isPrimary)?.url || coupon.images[0].url}
                alt={coupon.title}
                className={styles.cardImage}
              />
            )}
            <div className={styles.cardTitle}>
              <h3 className={styles.title}>{coupon.title}</h3>
              <div className={styles.cardMeta}>
                <Badge variant={coupon.type === 'SINGLE' ? 'default' : 'default'}>
                  {coupon.type === 'SINGLE' ? 'יחיד' : 'רב'}
                </Badge>
                <span className={styles.store}>{getStoreDisplay(coupon)}</span>
              </div>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ActionsMenu actions={actions} />
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.cardRow}>
            <span className={styles.label}>סטטוס:</span>
            <Badge variant={getStatusVariant(coupon.status, coupon.expiryDate)}>
              {getStatusLabel(coupon.status)}
            </Badge>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.label}>סכום:</span>
            <span>
              {coupon.remainingAmount.toFixed(2)} / {coupon.totalAmount.toFixed(2)} {coupon.currency}
            </span>
          </div>
          <div className={styles.cardRow}>
            <span className={styles.label}>תאריך תפוגה:</span>
            <span className={new Date(coupon.expiryDate) < new Date() ? styles.expired : ''}>
              {new Date(coupon.expiryDate).toLocaleDateString('he-IL')}
            </span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>כותרת</th>
              <th>חנות / רב</th>
              <th>סוג</th>
              <th>סכום</th>
              <th>תאריך תפוגה</th>
              <th>סטטוס</th>
              {canEdit && <th>פעולות</th>}
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => {
              const actions: ActionItem[] = [
                { label: 'צפייה', onClick: () => onCouponClick(coupon.id) },
              ];

              if (canEdit) {
                actions.push({ label: 'עריכה', onClick: () => onEdit(coupon.id) });
                if (onMarkAsUsed && coupon.status !== 'USED' && coupon.status !== 'EXPIRED') {
                  actions.push({ label: 'סמן כמשומש', onClick: () => onMarkAsUsed(coupon.id) });
                }
                actions.push({
                  label: 'מחיקה',
                  onClick: () => onDelete(coupon.id),
                  variant: 'danger',
                });
              }

              return (
                <tr key={coupon.id} onClick={() => onCouponClick(coupon.id)} className={styles.tableRow}>
                  <td>
                    <div className={styles.titleCell}>
                      {coupon.images && coupon.images.length > 0 && (
                        <img
                          src={coupon.images.find((img) => img.isPrimary)?.url || coupon.images[0].url}
                          alt={coupon.title}
                          className={styles.tableImage}
                        />
                      )}
                      <strong>{coupon.title}</strong>
                    </div>
                  </td>
                  <td>
                    {getStoreDisplay(coupon)}
                    {coupon.mappingStatus === 'UNMAPPED' && (
                      <span className={styles.unmapped}> (לא ממופה)</span>
                    )}
                  </td>
                  <td>
                    <Badge variant="default">
                      {coupon.type === 'SINGLE' ? 'יחיד' : 'רב'}
                    </Badge>
                  </td>
                  <td>
                    {coupon.remainingAmount.toFixed(2)} / {coupon.totalAmount.toFixed(2)} {coupon.currency}
                  </td>
                  <td className={new Date(coupon.expiryDate) < new Date() ? styles.expired : ''}>
                    {new Date(coupon.expiryDate).toLocaleDateString('he-IL')}
                  </td>
                  <td>
                    <Badge variant={getStatusVariant(coupon.status, coupon.expiryDate)}>
                      {getStatusLabel(coupon.status)}
                    </Badge>
                  </td>
                  {canEdit && (
                    <td onClick={(e) => e.stopPropagation()}>
                      <ActionsMenu actions={actions} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className={styles.cardsContainer}>
        {coupons.map((coupon) => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
    </>
  );
};
