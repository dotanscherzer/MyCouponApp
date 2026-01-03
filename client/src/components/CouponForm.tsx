import { useState, useEffect } from 'react';
import { useCreateCoupon, useUpdateCoupon } from '../hooks/useCoupons';
import { lookupApi } from '../api/lookup.api';
import { useQuery } from '@tanstack/react-query';
import type { Coupon, CreateCouponData } from '../api/coupons.api';

interface CouponFormProps {
  groupId: string;
  coupon?: Coupon;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({ groupId, coupon, onSuccess, onCancel }) => {
  const isEdit = !!coupon;

  const [type, setType] = useState<'SINGLE' | 'MULTI'>(coupon?.type || 'SINGLE');
  const [title, setTitle] = useState(coupon?.title || '');
  const [storeId, setStoreId] = useState(coupon?.storeId || '');
  const [multiCouponName, setMultiCouponName] = useState(coupon?.multiCouponName || '');
  const [expiryDate, setExpiryDate] = useState(
    coupon ? new Date(coupon.expiryDate).toISOString().split('T')[0] : ''
  );
  const [totalAmount, setTotalAmount] = useState(coupon?.totalAmount.toString() || '');
  const [currency, setCurrency] = useState<'ILS' | 'USD' | 'EUR'>(coupon?.currency || 'ILS');
  const [notes, setNotes] = useState(coupon?.notes || '');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 640);

  // Autocomplete states
  const [storeSearch, setStoreSearch] = useState('');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [multiCouponSearch, setMultiCouponSearch] = useState('');
  const [showMultiCouponDropdown, setShowMultiCouponDropdown] = useState(false);

  const createMutation = useCreateCoupon(groupId);
  const updateMutation = useUpdateCoupon(groupId, coupon?.id || '');

  const { data: storeSuggestions } = useQuery({
    queryKey: ['store-suggestions', storeSearch],
    queryFn: () => lookupApi.lookupStores(storeSearch, 10),
    enabled: type === 'SINGLE' && storeSearch.length > 0,
  });

  const { data: multiCouponSuggestions } = useQuery({
    queryKey: ['multi-coupon-suggestions', multiCouponSearch],
    queryFn: () => lookupApi.lookupMultiCoupons(multiCouponSearch, 10),
    enabled: type === 'MULTI' && multiCouponSearch.length > 0,
  });

  useEffect(() => {
    if (coupon) {
      setType(coupon.type);
      setTitle(coupon.title);
      setStoreId(coupon.storeId || '');
      setMultiCouponName(coupon.multiCouponName || '');
      setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
      setTotalAmount(coupon.totalAmount.toString());
      setCurrency(coupon.currency);
      setNotes(coupon.notes || '');
    }
  }, [coupon]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateCouponData = {
      type,
      title: title.trim(),
      expiryDate: new Date(expiryDate).toISOString(),
      totalAmount: parseFloat(totalAmount),
      currency,
      notes: notes.trim() || undefined,
    };

    if (type === 'SINGLE') {
      if (!storeId) {
        alert('Please select a store');
        return;
      }
      data.storeId = storeId;
    } else {
      if (!multiCouponName.trim()) {
        alert('Please enter a multi-coupon name');
        return;
      }
      data.multiCouponName = multiCouponName.trim();
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleStoreSelect = (selectedStoreId: string, selectedStoreName: string) => {
    setStoreId(selectedStoreId);
    setStoreSearch(selectedStoreName);
    setShowStoreDropdown(false);
  };

  const handleMultiCouponSelect = (selectedName: string) => {
    setMultiCouponName(selectedName);
    setMultiCouponSearch(selectedName);
    setShowMultiCouponDropdown(false);
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: isMobile ? '10px' : '20px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: isMobile ? '20px' : '30px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>{isEdit ? 'Edit Coupon' : 'Create Coupon'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label>
              Type: *
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as 'SINGLE' | 'MULTI');
                  setStoreId('');
                  setMultiCouponName('');
                  setStoreSearch('');
                  setMultiCouponSearch('');
                }}
                required
                disabled={isEdit || loading}
                style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              >
                <option value="SINGLE">Single Store</option>
                <option value="MULTI">Multi Store</option>
              </select>
            </label>
          </div>

          {type === 'SINGLE' && (
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <label>
                Store: *
                <input
                  type="text"
                  value={storeSearch}
                  onChange={(e) => {
                    setStoreSearch(e.target.value);
                    setShowStoreDropdown(true);
                  }}
                  onFocus={() => setShowStoreDropdown(true)}
                  placeholder="Search for a store..."
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </label>
              {showStoreDropdown && storeSearch && storeSuggestions && storeSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 100,
                    marginTop: '4px',
                  }}
                >
                  {storeSuggestions.map((store) => (
                    <div
                      key={store.id}
                      onClick={() => handleStoreSelect(store.id, store.name)}
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      {store.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {type === 'MULTI' && (
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <label>
                Multi-Coupon Name: *
                <input
                  type="text"
                  value={multiCouponSearch}
                  onChange={(e) => {
                    setMultiCouponSearch(e.target.value);
                    setMultiCouponName(e.target.value);
                    setShowMultiCouponDropdown(true);
                  }}
                  onFocus={() => setShowMultiCouponDropdown(true)}
                  placeholder="Enter or search multi-coupon name..."
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </label>
              {showMultiCouponDropdown && multiCouponSearch && multiCouponSuggestions && multiCouponSuggestions.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 100,
                    marginTop: '4px',
                  }}
                >
                  {multiCouponSuggestions.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => handleMultiCouponSelect(item.name)}
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label>
              Title: *
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>
              Expiry Date: *
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
                disabled={loading}
                style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              />
            </label>
          </div>

          <div style={{ 
            marginBottom: '20px', 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', 
            gap: '15px' 
          }}>
            <div>
              <label>
                Total Amount: *
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  min="0"
                  disabled={loading}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                />
              </label>
            </div>
            <div>
              <label>
                Currency: *
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'ILS' | 'USD' | 'EUR')}
                  required
                  disabled={loading}
                  style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
                >
                  <option value="ILS">ILS</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>
              Notes:
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={4}
                style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}
              />
            </label>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            gap: '10px', 
            justifyContent: isMobile ? 'stretch' : 'flex-end' 
          }}>
            <button 
              type="button" 
              onClick={onCancel} 
              disabled={loading}
              style={isMobile ? { 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                minHeight: '44px'
              } : {
                minHeight: '44px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={isMobile ? { 
                width: '100%', 
                padding: '12px',
                fontSize: '16px',
                minHeight: '44px'
              } : {
                minHeight: '44px'
              }}
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

