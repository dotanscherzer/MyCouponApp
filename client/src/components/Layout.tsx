import type { ReactNode } from 'react';
import { Sidebar } from './layout/Sidebar/Sidebar';
import { Topbar } from './layout/Topbar/Topbar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.content}>
        <Topbar />
        <main className={styles.main}>
          <div className={styles.container}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
