import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCoupon, useCancelCoupon } from '../hooks/useCoupons';
import { CouponForm } from '../components/CouponForm';
import { ImageGallery } from '../components/ImageGallery';
import { ImageUpload } from '../components/ImageUpload';
import { PageHeader } from '../components/layout/PageHeader/PageHeader';
import { Breadcrumbs } from '../components/ui/Breadcrumbs/Breadcrumbs';
import { Card } from '../components/ui/Card/Card';
import { Badge } from '../components/ui/Badge/Badge';
import { type ActionItem } from '../components/ui/DropdownMenu/ActionsMenu';
import { useAuth } from '../auth/AuthContext';
import { groupsApi } from '../api/groups.api';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import { resolveStoreName } from '../utils/storeResolver';
import { useEffect } from 'react';
import styles from './CouponDetailsPage.module.css';

export const CouponDetailsPage: React.FC = () => {
  const { groupId, couponId } = useParams<{ groupId: string; couponId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);
  const [storeName, setStoreName] = useState<string>('');
  const { showToast, ToastComponent } = useToast();

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: coupon, isLoading, error } = useCoupon(groupId!, couponId!);
  const cancelMutation = useCancelCoupon(groupId!, couponId!);

  const isEditor = group?.role === 'editor' || group?.role === 'admin' || user?.id === group?.ownerUserId;
  const isAdmin = group?.role === 'admin' || user?.id === group?.ownerUserId;

  useEffect(() => {
    if (coupon?.type === 'SINGLE' && coupon.storeId) {
      resolveStoreName(coupon.storeId).then(setStoreName);
    }
  }, [coupon]);

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

  if (isLoading) {
    return <div>טוען קופון...</div>;
  }

  if (error || !coupon) {
    return <div>שגיאה בטעינת הקופון. אנא נסה שוב.</div>;
  }

  const actions: ActionItem[] = [];
  if (isEditor) {
    actions.push({ label: 'עריכה', onClick: () => setShowEditForm(true) });
  }
  if (isAdmin) {
    actions.push({
      label: 'ביטול קופון',
      onClick: () => {
        if (confirm('האם אתה בטוח שברצונך לבטל קופון זה?')) {
          cancelMutation.mutate(undefined, {
            onSuccess: () => {
              showToast('קופון בוטל בהצלחה', undefined, 'success');
              navigate(`/groups/${groupId}/coupons`);
            },
          });
        }
      },
      variant: 'danger',
      disabled: coupon.status === 'CANCELLED' || cancelMutation.isPending,
    });
  }

  const storeDisplay = coupon.type === 'SINGLE' ? storeName || coupon.storeId || 'N/A' : coupon.multiCouponName || 'N/A';

  return (
    <div className={styles.page} dir="rtl">
      <Breadcrumbs
        items={[
          { label: 'קופונים', path: `/groups/${groupId}/coupons` },
          { label: coupon.title },
        ]}
      />

      <PageHeader
        title={coupon.title}
        subtitle={`${storeDisplay} • ${getStatusLabel(coupon.status)} • ${new Date(coupon.expiryDate).toLocaleDateString('he-IL')}`}
        primaryAction={
          isEditor
            ? {
                label: 'עריכה',
                onClick: () => setShowEditForm(true),
              }
            : undefined
        }
        secondaryActions={
          actions.length > 0
            ? [
                {
                  label: 'עוד',
                  onClick: () => {},
                },
              ]
            : undefined
        }
      />

      <div className={styles.content}>
        <div className={styles.main}>
          <Card className={styles.summaryCard}>
            <h2 className={styles.cardTitle}>סיכום</h2>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.label}>חנות / רב</span>
                <span className={styles.value}>{storeDisplay}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>סוג</span>
                <Badge variant="default">{coupon.type === 'SINGLE' ? 'יחיד' : 'רב'}</Badge>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>סכום נותר / סה"כ</span>
                <span className={styles.value}>
                  {coupon.remainingAmount.toFixed(2)} / {coupon.totalAmount.toFixed(2)} {coupon.currency}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>תאריך תפוגה</span>
                <span className={styles.value}>{new Date(coupon.expiryDate).toLocaleDateString('he-IL')}</span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.label}>סטטוס</span>
                <Badge variant={getStatusVariant(coupon.status, coupon.expiryDate)}>
                  {getStatusLabel(coupon.status)}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className={styles.detailsCard}>
            <h2 className={styles.cardTitle}>פרטים</h2>
            <div className={styles.detailsList}>
              {coupon.notes && (
                <div className={styles.detailItem}>
                  <span className={styles.label}>הערות</span>
                  <p className={styles.value}>{coupon.notes}</p>
                </div>
              )}
              <div className={styles.detailItem}>
                <span className={styles.label}>נוצר</span>
                <span className={styles.value}>{new Date(coupon.createdAt).toLocaleString('he-IL')}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>עודכן</span>
                <span className={styles.value}>{new Date(coupon.updatedAt).toLocaleString('he-IL')}</span>
              </div>
              {coupon.mappingStatus === 'UNMAPPED' && (
                <div className={styles.detailItem}>
                  <Badge variant="expired">לא ממופה</Badge>
                </div>
              )}
            </div>
          </Card>

          {coupon.images && coupon.images.length > 0 && (
            <Card className={styles.imagesCard}>
              <h2 className={styles.cardTitle}>תמונות</h2>
              <ImageGallery
                images={coupon.images}
                groupId={groupId!}
                couponId={couponId!}
                canEdit={isEditor || false}
              />
            </Card>
          )}

          {isEditor && (
            <Card className={styles.uploadCard}>
              <ImageUpload groupId={groupId!} couponId={couponId!} onSuccess={() => {}} />
            </Card>
          )}
        </div>
      </div>

      {showEditForm && (
        <CouponForm
          groupId={groupId!}
          coupon={coupon}
          onSuccess={() => {
            setShowEditForm(false);
            showToast('קופון עודכן בהצלחה', undefined, 'success');
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      <ToastComponent />
    </div>
  );
};
