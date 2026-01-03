import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAllCoupons, type CouponWithGroup } from '../hooks/useAllCoupons';
import { couponsApi } from '../api/coupons.api';
import { CouponsTable } from '../components/CouponsTable';
import { CouponFilters } from '../components/CouponFilters';
import { CouponForm } from '../components/CouponForm';
import { PageHeader } from '../components/layout/PageHeader/PageHeader';
import { ConfirmDialog } from '../components/ui/Dialog/ConfirmDialog';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../hooks/useToast';
import type { Coupon } from '../api/coupons.api';
import styles from './CouponsPage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast, ToastComponent } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponWithGroup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; couponId: string | null; groupId: string | null }>({
    open: false,
    couponId: null,
    groupId: null,
  });
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

  const { data: coupons, isLoading, error } = useAllCoupons(filters);

  const activeCount = coupons?.filter((c) => c.status === 'ACTIVE').length || 0;
  const expiringCount =
    coupons?.filter((c) => {
      if (c.status !== 'ACTIVE') return false;
      const daysUntilExpiry = Math.ceil((new Date(c.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    }).length || 0;

  const handleDelete = (couponId: string) => {
    const coupon = coupons?.find((c) => c.id === couponId);
    if (coupon) {
      setDeleteConfirm({ open: true, couponId, groupId: coupon.groupId });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.couponId && deleteConfirm.groupId) {
      try {
        await couponsApi.deleteCoupon(deleteConfirm.groupId, deleteConfirm.couponId);
        showToast('קופון נמחק בהצלחה', undefined, 'success');
        queryClient.invalidateQueries({ queryKey: ['coupons'] });
        queryClient.invalidateQueries({ queryKey: ['groups'] });
        setDeleteConfirm({ open: false, couponId: null, groupId: null });
      } catch (error) {
        showToast('שגיאה במחיקת הקופון', undefined, 'error');
      }
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
        await couponsApi.updateUsage(coupon.groupId, couponId, {
          mode: 'SET',
          amount: coupon.totalAmount,
        });
        queryClient.invalidateQueries({ queryKey: ['coupons'] });
        queryClient.invalidateQueries({ queryKey: ['coupon', coupon.groupId, couponId] });
        showToast('קופון סומן כמשומש', undefined, 'success');
      } catch (error) {
        showToast('שגיאה בעדכון הקופון', undefined, 'error');
      }
    }
  };

  const handleCouponClick = (couponId: string) => {
    const coupon = coupons?.find((c) => c.id === couponId);
    if (coupon) {
      navigate(`/groups/${coupon.groupId}/coupons/${couponId}`);
    }
  };

  if (error) {
    return <div>שגיאה בטעינת הקופונים. אנא נסה שוב.</div>;
  }

  // Convert CouponWithGroup to Coupon for CouponsTable
  const couponsForTable: Coupon[] = coupons?.map((c) => {
    const { groupId, groupName, ...coupon } = c;
    return coupon;
  }) || [];

  return (
    <div className={styles.page} dir="rtl">
      <PageHeader
        title="קופונים"
        subtitle={`${activeCount} פעילים • ${expiringCount} פוגים בקרוב`}
      />

      <CouponFilters filters={filters} onFiltersChange={setFilters} />

      <CouponsTable
        coupons={couponsForTable}
        groupId={coupons?.[0]?.groupId || ''}
        onCouponClick={handleCouponClick}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkAsUsed={handleMarkAsUsed}
        canEdit={false}
        isLoading={isLoading}
      />

      {editingCoupon && (
        <CouponForm
          groupId={editingCoupon.groupId}
          coupon={editingCoupon as Coupon}
          onSuccess={() => {
            setEditingCoupon(null);
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            showToast('קופון עודכן בהצלחה', undefined, 'success');
          }}
          onCancel={() => setEditingCoupon(null)}
        />
      )}

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, couponId: deleteConfirm.couponId, groupId: deleteConfirm.groupId })}
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
