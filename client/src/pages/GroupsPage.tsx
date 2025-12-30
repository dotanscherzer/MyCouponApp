import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { groupsApi } from '../api/groups.api';
import type { Group } from '../api/groups.api';
import { GroupForm } from '../components/GroupForm';
import { PageHeader } from '../components/layout/PageHeader/PageHeader';
import { Card } from '../components/ui/Card/Card';
import { Skeleton } from '../components/ui/Skeleton/Skeleton';
import { ActionsMenu, type ActionItem } from '../components/ui/DropdownMenu/ActionsMenu';
import { useCoupons } from '../hooks/useCoupons';
import styles from './GroupsPage.module.css';

export const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data: groups, isLoading, error } = useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: () => groupsApi.getGroups(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string }) => groupsApi.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowCreateForm(false);
    },
  });

  if (isLoading) {
    return (
      <div className={styles.page} dir="rtl">
        <PageHeader title="קבוצות" />
        <div className={styles.loadingContainer}>
          <Skeleton height={120} className={styles.skeletonCard} />
          <Skeleton height={120} className={styles.skeletonCard} />
          <Skeleton height={120} className={styles.skeletonCard} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page} dir="rtl">
        <PageHeader title="קבוצות" />
        <div>שגיאה בטעינת הקבוצות. אנא נסה שוב.</div>
      </div>
    );
  }

  const GroupCard = ({ group }: { group: Group }) => {
    const { data: coupons } = useCoupons(group.id, {});
    const activeCoupons = coupons?.filter((c) => c.status === 'ACTIVE').length || 0;

    const actions: ActionItem[] = [
      { label: 'ניהול', onClick: () => navigate(`/groups/${group.id}`) },
    ];

    return (
      <Card className={styles.groupCard} onClick={() => navigate(`/groups/${group.id}`)}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.groupName}>{group.name}</h3>
            <div className={styles.metrics}>
              <span className={styles.metric}>
                <strong>{activeCoupons}</strong> קופונים פעילים
              </span>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <ActionsMenu actions={actions} />
          </div>
        </div>
        <div className={styles.cardFooter}>
          <span className={styles.updated}>
            עודכן: {new Date(group.updatedAt).toLocaleDateString('he-IL')}
          </span>
        </div>
      </Card>
    );
  };

  return (
    <div className={styles.page} dir="rtl">
      <PageHeader
        title="קבוצות"
        primaryAction={{
          label: '+ צור קבוצה',
          onClick: () => setShowCreateForm(true),
        }}
      />

      {groups && groups.length === 0 ? (
        <Card className={styles.emptyState}>
          <p className={styles.emptyText}>אין קבוצות עדיין. צור את הקבוצה הראשונה שלך כדי להתחיל.</p>
        </Card>
      ) : (
        <div className={styles.groupsGrid}>
          {groups?.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {showCreateForm && (
        <GroupForm
          onSubmit={(data) => createMutation.mutate(data)}
          onCancel={() => setShowCreateForm(false)}
          loading={createMutation.isPending}
        />
      )}
    </div>
  );
};
