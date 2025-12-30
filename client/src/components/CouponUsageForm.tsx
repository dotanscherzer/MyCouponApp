import { useState } from 'react';
import { useUpdateCouponUsage } from '../hooks/useCoupons';
import { UpdateUsageData } from '../api/coupons.api';

interface CouponUsageFormProps {
  groupId: string;
  couponId: string;
  currentUsedAmount: number;
  totalAmount: number;
  onSuccess: () => void;
}

export const CouponUsageForm: React.FC<CouponUsageFormProps> = ({
  groupId,
  couponId,
  currentUsedAmount,
  totalAmount,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'ADD' | 'SET'>('ADD');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const updateUsageMutation = useUpdateCouponUsage(groupId, couponId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    let newUsedAmount: number;
    if (mode === 'ADD') {
      newUsedAmount = currentUsedAmount + amountValue;
    } else {
      newUsedAmount = amountValue;
    }

    if (newUsedAmount > totalAmount) {
      setError(`Used amount (${newUsedAmount.toFixed(2)}) cannot exceed total amount (${totalAmount.toFixed(2)})`);
      return;
    }

    if (newUsedAmount < 0) {
      setError('Used amount cannot be negative');
      return;
    }

    try {
      const data: UpdateUsageData = {
        mode,
        amount: amountValue,
      };
      await updateUsageMutation.mutateAsync(data);
      setAmount('');
      onSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update usage');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', marginTop: '20px' }}>
      <h3>Update Usage</h3>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Mode:
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'ADD' | 'SET')}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              disabled={updateUsageMutation.isPending}
            >
              <option value="ADD">Add to current ({currentUsedAmount.toFixed(2)})</option>
              <option value="SET">Set to specific amount</option>
            </select>
          </label>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Amount: *
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              max={mode === 'SET' ? totalAmount : undefined}
              disabled={updateUsageMutation.isPending}
              style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              placeholder={mode === 'ADD' ? 'Amount to add' : 'Total amount to set'}
            />
          </label>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            {mode === 'ADD' && (
              <span>
                New total: {amount ? (currentUsedAmount + parseFloat(amount)).toFixed(2) : currentUsedAmount.toFixed(2)} / {totalAmount.toFixed(2)}
              </span>
            )}
            {mode === 'SET' && (
              <span>
                Current: {currentUsedAmount.toFixed(2)} / {totalAmount.toFixed(2)}
              </span>
            )}
          </div>
        </div>
        <button type="submit" disabled={updateUsageMutation.isPending}>
          {updateUsageMutation.isPending ? 'Updating...' : 'Update Usage'}
        </button>
      </form>
    </div>
  );
};

