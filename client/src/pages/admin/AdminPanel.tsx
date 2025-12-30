import { useState } from 'react';
import { StoresPage } from './StoresPage';
import { MultiCouponsPage } from './MultiCouponsPage';
import { UnmappedEventsPage } from './UnmappedEventsPage';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stores' | 'multi-coupons' | 'unmapped-events'>('stores');

  return (
    <div>
      <h1>Admin Panel</h1>
      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('stores')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'stores' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Stores
        </button>
        <button
          onClick={() => setActiveTab('multi-coupons')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'multi-coupons' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Multi-Coupons
        </button>
        <button
          onClick={() => setActiveTab('unmapped-events')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'unmapped-events' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Unmapped Events
        </button>
      </div>

      {activeTab === 'stores' && <StoresPage />}
      {activeTab === 'multi-coupons' && <MultiCouponsPage />}
      {activeTab === 'unmapped-events' && <UnmappedEventsPage />}
    </div>
  );
};

