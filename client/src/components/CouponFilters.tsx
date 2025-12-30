import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { lookupApi } from '../api/lookup.api';
import { useQuery } from '@tanstack/react-query';
import { Button } from './ui/Button/Button';
import styles from './CouponFilters.module.css';

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
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

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
    setStoreSearch('');
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: undefined,
      storeId: undefined,
      status: undefined,
      mappingStatus: undefined,
      expiringInDays: undefined,
      sort: 'expiryDate',
      order: 'asc',
    });
    setSearchText('');
    setStoreSearch('');
  };

  const hasActiveFilters = filters.storeId || filters.status || filters.mappingStatus || filters.expiringInDays;

  return (
    <div className={styles.filterBar} dir="rtl">
      {/* Desktop: Compact row */}
      <div className={styles.desktopFilters}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="חיפוש קופונים..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.selectContainer}>
          <select
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
            className={styles.select}
          >
            <option value="">כל הסטטוסים</option>
            <option value="ACTIVE">פעיל</option>
            <option value="PARTIALLY_USED">בשימוש חלקי</option>
            <option value="USED">משומש</option>
            <option value="EXPIRED">פג תוקף</option>
            <option value="CANCELLED">בוטל</option>
          </select>
        </div>

        <div className={styles.selectContainer}>
          <select
            value={filters.sort || 'expiryDate'}
            onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
            className={styles.select}
          >
            <option value="expiryDate">תאריך תפוגה</option>
            <option value="remainingAmount">סכום נותר</option>
            <option value="createdAt">תאריך יצירה</option>
          </select>
        </div>

        <Popover.Root open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
          <Popover.Trigger asChild>
            <Button variant="secondary" size="md">
              עוד מסננים {hasActiveFilters && '●'}
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className={styles.popoverContent} sideOffset={5} dir="rtl">
              <div className={styles.moreFilters}>
                <div className={styles.filterGroup}>
                  <label className={styles.label}>חנות</label>
                  <div className={styles.storeInputWrapper}>
                    <input
                      type="text"
                      value={storeSearch}
                      onChange={(e) => {
                        setStoreSearch(e.target.value);
                        setShowStoreDropdown(true);
                      }}
                      onFocus={() => setShowStoreDropdown(true)}
                      placeholder="חפש חנות..."
                      className={styles.input}
                    />
                    {filters.storeId && (
                      <button onClick={clearStoreFilter} className={styles.clearButton}>
                        ×
                      </button>
                    )}
                    {showStoreDropdown && storeSearch && storeSuggestions && storeSuggestions.length > 0 && (
                      <div className={styles.dropdown}>
                        {storeSuggestions.map((store) => (
                          <div
                            key={store.id}
                            onClick={() => handleStoreSelect(store.id)}
                            className={styles.dropdownItem}
                          >
                            {store.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.label}>סטטוס מיפוי</label>
                  <select
                    value={filters.mappingStatus || ''}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, mappingStatus: e.target.value || undefined })
                    }
                    className={styles.select}
                  >
                    <option value="">הכל</option>
                    <option value="MAPPED">ממופה</option>
                    <option value="UNMAPPED">לא ממופה</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.label}>פג תוקף תוך (ימים)</label>
                  <input
                    type="number"
                    value={filters.expiringInDays || ''}
                    onChange={(e) =>
                      onFiltersChange({
                        ...filters,
                        expiringInDays: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="ימים"
                    min="1"
                    className={styles.input}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.label}>סדר</label>
                  <select
                    value={filters.order || 'asc'}
                    onChange={(e) => onFiltersChange({ ...filters, order: e.target.value as 'asc' | 'desc' })}
                    className={styles.select}
                  >
                    <option value="asc">עולה</option>
                    <option value="desc">יורד</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className={styles.clearAll}>
                    נקה מסננים
                  </Button>
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Mobile: Search + Filters button */}
      <div className={styles.mobileFilters}>
        <input
          type="text"
          placeholder="חיפוש..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className={styles.searchInput}
        />
        <Popover.Root open={moreFiltersOpen} onOpenChange={setMoreFiltersOpen}>
          <Popover.Trigger asChild>
            <Button variant="secondary" size="md">
              מסננים {hasActiveFilters && '●'}
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className={styles.popoverContent} sideOffset={5} dir="rtl">
              <div className={styles.moreFilters}>
                <div className={styles.filterGroup}>
                  <label className={styles.label}>סטטוס</label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => onFiltersChange({ ...filters, status: e.target.value || undefined })}
                    className={styles.select}
                  >
                    <option value="">כל הסטטוסים</option>
                    <option value="ACTIVE">פעיל</option>
                    <option value="PARTIALLY_USED">בשימוש חלקי</option>
                    <option value="USED">משומש</option>
                    <option value="EXPIRED">פג תוקף</option>
                    <option value="CANCELLED">בוטל</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.label}>חנות</label>
                  <div className={styles.storeInputWrapper}>
                    <input
                      type="text"
                      value={storeSearch}
                      onChange={(e) => {
                        setStoreSearch(e.target.value);
                        setShowStoreDropdown(true);
                      }}
                      onFocus={() => setShowStoreDropdown(true)}
                      placeholder="חפש חנות..."
                      className={styles.input}
                    />
                    {filters.storeId && (
                      <button onClick={clearStoreFilter} className={styles.clearButton}>
                        ×
                      </button>
                    )}
                    {showStoreDropdown && storeSearch && storeSuggestions && storeSuggestions.length > 0 && (
                      <div className={styles.dropdown}>
                        {storeSuggestions.map((store) => (
                          <div
                            key={store.id}
                            onClick={() => handleStoreSelect(store.id)}
                            className={styles.dropdownItem}
                          >
                            {store.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.label}>מיון</label>
                  <select
                    value={filters.sort || 'expiryDate'}
                    onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
                    className={styles.select}
                  >
                    <option value="expiryDate">תאריך תפוגה</option>
                    <option value="remainingAmount">סכום נותר</option>
                    <option value="createdAt">תאריך יצירה</option>
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.label}>סדר</label>
                  <select
                    value={filters.order || 'asc'}
                    onChange={(e) => onFiltersChange({ ...filters, order: e.target.value as 'asc' | 'desc' })}
                    className={styles.select}
                  >
                    <option value="asc">עולה</option>
                    <option value="desc">יורד</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className={styles.clearAll}>
                    נקה מסננים
                  </Button>
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
};
