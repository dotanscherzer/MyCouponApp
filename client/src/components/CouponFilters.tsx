import { useState, useEffect } from 'react';
import { lookupApi } from '../api/lookup.api';
import { useQuery } from '@tanstack/react-query';

interface CouponFiltersProps {
  filters: {
    storeId?: string;
    status?: string;
    mappingStatus?: string;
    expiringInDays?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  };
  onFiltersChange: (filters: CouponFiltersProps['filters']) => void;
}

export const CouponFilters: React.FC<CouponFiltersProps> = ({ filters, onFiltersChange }) => {
  const [searchText, setSearchText] = useState(filters.search || '');
  const [storeSearch, setStoreSearch] = useState('');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  const { data: storeSuggestions } = useQuery({
    queryKey: ['store-suggestions', storeSearch],
    queryFn: () => lookupApi.lookupStores(storeSearch, 10),
    enabled: storeSearch.length > 0,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: searchText || undefined });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleStoreSelect = (storeId: string) => {
    onFiltersChange({ ...filters, storeId });
    setStoreSearch('');
    setShowStoreDropdown(false);
  };

  const clearStoreFilter = () => {
    onFiltersChange({ ...filters, storeId: undefined });
  };

  return (
    <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Search</label>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search coupons..."
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Store</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={storeSearch}
              onChange={(e) => {
                setStoreSearch(e.target.value);
                setShowStoreDropdown(true);
              }}
              onFocus={() => setShowStoreDropdown(true)}
              placeholder={filters.storeId ? 'Store selected' : 'Search store...'}
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
            {filters.storeId && (
              <button
                onClick={clearStoreFilter}
                style={{ position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ×
              </button>
            )}
            {showStoreDropdown && storeSearch && storeSuggestions && (
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
                }}
              >
                {storeSuggestions.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => handleStoreSelect(store.id)}
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
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
          <select
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="PARTIALLY_USED">Partially Used</option>
            <option value="USED">Used</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mapping Status</label>
          <select
            value={filters.mappingStatus || ''}
            onChange={(e) => onFiltersChange({ ...filters, mappingStatus: e.target.value || undefined })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="">All</option>
            <option value="MAPPED">Mapped</option>
            <option value="UNMAPPED">Unmapped</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Expiring In (Days)</label>
          <input
            type="number"
            value={filters.expiringInDays || ''}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                expiringInDays: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="Days"
            min="1"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Sort By</label>
          <select
            value={filters.sort || 'expiryDate'}
            onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="expiryDate">Expiry Date</option>
            <option value="remainingAmount">Remaining Amount</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Order</label>
          <select
            value={filters.order || 'asc'}
            onChange={(e) => onFiltersChange({ ...filters, order: e.target.value as 'asc' | 'desc' })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  );
};

