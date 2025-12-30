import { useState } from 'react';
import { ProfileForm } from '../components/ProfileForm';
import { NotificationPreferencesForm } from '../components/NotificationPreferencesForm';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');

  return (
    <div>
      <h1>Settings</h1>
      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'profile' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'notifications' ? '#f0f0f0' : 'transparent',
            cursor: 'pointer',
          }}
        >
          Notifications
        </button>
      </div>

      {activeTab === 'profile' && <ProfileForm />}
      {activeTab === 'notifications' && <NotificationPreferencesForm />}
    </div>
  );
};

