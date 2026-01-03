import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useCoupons, useDeleteCoupon } from '../hooks/useCoupons';
import { couponsApi } from '../api/coupons.api';
import { CouponsTable } from '../components/CouponsTable';
import { CouponFilters } from '../components/CouponFilters';
import { CouponForm } from '../components/CouponForm';
import { PageHeader } from '../components/layout/PageHeader/PageHeader';
import { Breadcrumbs } from '../components/ui/Breadcrumbs/Breadcrumbs';
import { ConfirmDialog } from '../components/ui/Dialog/ConfirmDialog';
import { useAuth } from '../auth/AuthContext';
import { groupsApi } from '../api/groups.api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';
import type { Coupon } from '../api/coupons.api';
import styles from './CouponsPage.module.css';

export const CouponsPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; couponId: string | null }>({
    open: false,
    couponId: null,
  });
  const { showToast, ToastComponent } = useToast();
  const [filters, setFilters] = useState<{
    storeId?: string;
    status?: string;
    mappingStatus?: string;
    expiringInDays?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }>({
    sort: 'expiryDate',
    order: 'asc',
  });

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.getGroup(groupId!),
    enabled: !!groupId,
  });

  const { data: coupons, isLoading, error } = useCoupons(groupId!, filters);
  const deleteMutation = useDeleteCoupon(groupId!);
  const queryClient = useQueryClient();

  const isEditor = group?.role === 'editor' || group?.role === 'admin' || user?.id === group?.ownerUserId;

  const handleDelete = (couponId: string) => {
    setDeleteConfirm({ open: true, couponId });
  };

  const confirmDelete = () => {
    if (deleteConfirm.couponId) {
      deleteMutation.mutate(deleteConfirm.couponId, {
        onSuccess: () => {
          showToast('קופון נמחק בהצלחה', undefined, 'success');
          setDeleteConfirm({ open: false, couponId: null });
        },
        onError: () => {
          showToast('שגיאה במחיקת הקופון', undefined, 'error');
        },
      });
    }
  };

  const handleEdit = (couponId: string) => {
    const coupon = coupons?.find((c) => c.id === couponId);
    if (coupon) {
      setEditingCoupon(coupon);
    }
  };

  const handleMarkAsUsed = async (couponId: string) => {
    const coupon = coupons?.find((c) => c.id === couponId);
    if (coupon) {
      try {
        await couponsApi.updateUsage(groupId!, couponId, {
          mode: 'SET',
          amount: coupon.totalAmount,
        });
        queryClient.invalidateQueries({ queryKey: ['coupons', groupId] });
        queryClient.invalidateQueries({ queryKey: ['coupon', groupId, couponId] });
        showToast('קופון סומן כמשומש', undefined, 'success');
      } catch (error) {
        showToast('שגיאה בעדכון הקופון', undefined, 'error');
      }
    }
  };

  const activeCount = coupons?.filter((c) => c.status === 'ACTIVE').length || 0;
  const expiringCount =
    coupons?.filter((c) => {
      if (c.status !== 'ACTIVE') return false;
      const daysUntilExpiry = Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length || 0;

  if (error) {
    return <div>שגיאה בטעינת הקופונים. אנא נסה שוב.</div>;
  }

  return (
    <div className={styles.page} dir="rtl">
      <Breadcrumbs
        items={[
          { label: 'קבוצות', path: '/groups' },
          { label: group?.name || 'קבוצה', path: `/groups/${groupId}` },
          { label: 'קופונים' },
        ]}
      />

      <PageHeader
        title="קופונים"
        subtitle={`${group?.name || ''} • ${activeCount} פעילים • ${expiringCount} פוגים בקרוב`}
        primaryAction={
          isEditor
            ? {
                label: '+ הוסף קופון',
                onClick: () => setShowCreateForm(true),
              }
            : undefined
        }
      />

      <CouponFilters filters={filters} onFiltersChange={setFilters} />

      <CouponsTable
        coupons={coupons || []}
        groupId={groupId!}
        onCouponClick={(couponId) => navigate(`/groups/${groupId}/coupons/${couponId}`)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkAsUsed={handleMarkAsUsed}
        canEdit={isEditor || false}
        isLoading={isLoading}
      />

      {showCreateForm && (
        <CouponForm
          groupId={groupId!}
          onSuccess={() => {
            setShowCreateForm(false);
            showToast('קופון נוצר בהצלחה', undefined, 'success');
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingCoupon && (
        <CouponForm
          groupId={groupId!}
          coupon={editingCoupon}
          onSuccess={() => {
            setEditingCoupon(null);
            showToast('קופון עודכן בהצלחה', undefined, 'success');
          }}
          onCancel={() => setEditingCoupon(null)}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, couponId: deleteConfirm.couponId })}
        title="מחיקת קופון"
        message="האם אתה בטוח שברצונך למחוק קופון זה? פעולה זו לא ניתנת לביטול."
        confirmLabel="מחק"
        cancelLabel="ביטול"
        onConfirm={confirmDelete}
        variant="danger"
      />

      <ToastComponent />
    </div>
  );
};
