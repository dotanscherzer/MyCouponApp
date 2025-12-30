import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { GroupsPage } from '../pages/GroupsPage';
import { GroupDetailsPage } from '../pages/GroupDetailsPage';
import { AcceptInvitationPage } from '../pages/AcceptInvitationPage';
import { CouponsPage } from '../pages/CouponsPage';
import { CouponDetailsPage } from '../pages/CouponDetailsPage';
import { Layout } from '../components/Layout';

import { AdminPanel } from '../pages/admin/AdminPanel';
import { SettingsPage } from '../pages/SettingsPage';
import { HomePage } from '../pages/HomePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <HomePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Layout>
              <GroupsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <Layout>
              <GroupDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invitations/accept"
        element={
          <ProtectedRoute>
            <Layout>
              <AcceptInvitationPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/coupons"
        element={
          <ProtectedRoute>
            <Layout>
              <CouponsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId/coupons/:couponId"
        element={
          <ProtectedRoute>
            <Layout>
              <CouponDetailsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
