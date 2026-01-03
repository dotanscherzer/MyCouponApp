import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/AuthContext';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/groups') {
      // Only match exact /groups path, not /groups/:groupId or /groups/:groupId/coupons
      return location.pathname === '/groups';
    }
    if (path === '/') {
      // Match / or any coupon-related paths
      return location.pathname === '/' || (location.pathname.startsWith('/groups/') && location.pathname.includes('/coupons'));
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/groups', label: 'קבוצות', icon: '📁' },
    { path: '/', label: 'קופונים', icon: '🎫' },
  ];

  if (user?.appRole === 'super_admin') {
    navItems.push({ path: '/admin', label: 'ניהול', icon: '⚙️' });
  }

  navItems.push({ path: '/settings', label: 'הגדרות', icon: '⚙️' });

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}
        dir="rtl"
      >
        <div className={styles.header}>
          <Link to="/" className={styles.logo}>
            ניהול קופונים
          </Link>
          <button
            className={styles.mobileClose}
            onClick={() => setIsMobileOpen(false)}
            aria-label="סגור תפריט"
          >
            ✕
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
              onClick={() => handleNavClick(item.path)}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile menu button */}
      <button
        className={styles.mobileMenuButton}
        onClick={() => setIsMobileOpen(true)}
        aria-label="פתח תפריט"
      >
        ☰
      </button>
    </>
  );
};

