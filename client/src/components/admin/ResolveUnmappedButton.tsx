import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { multiCouponsApi } from '../../api/admin/multi-coupons.api';

interface ResolveUnmappedButtonProps {
  definitionId: string;
  definitionName: string;
}

export const ResolveUnmappedButton: React.FC<ResolveUnmappedButtonProps> = ({
  definitionId,
  definitionName,
}) => {
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  const resolveMutation = useMutation({
    mutationFn: () => multiCouponsApi.resolveUnmapped(definitionId),
    onSuccess: (data) => {
      alert(`Resolved ${data.resolvedCount} unmapped coupon(s) for "${definitionName}"`);
      queryClient.invalidateQueries({ queryKey: ['admin-unmapped-events'] });
      setShowConfirm(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to resolve unmapped coupons');
      setShowConfirm(false);
    },
  });

  const handleResolve = () => {
    if (
      confirm(
        `This will resolve all unmapped coupons for "${definitionName}". Do you want to continue?`
      )
    ) {
      resolveMutation.mutate();
    }
  };

  return (
    <button
      onClick={handleResolve}
      disabled={resolveMutation.isPending}
      style={{ backgroundColor: '#17a2b8', color: 'white' }}
    >
      {resolveMutation.isPending ? 'Resolving...' : 'Resolve Unmapped'}
    </button>
  );
};

