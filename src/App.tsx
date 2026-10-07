import { useTranslation } from 'react-i18next';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router';
import { useAuth } from './auth/AuthContext';
import { EmptyState } from './components/ui';
import { Layout } from './components/Layout';
import { AccountDetailPage } from './features/accounts/AccountDetailPage';
import { AccountsPage } from './features/accounts/AccountsPage';
import { LoginPage, MfaPage } from './features/auth/AuthPages';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { DocumentsPage } from './features/documents/DocumentsPage';
import { NotificationsPage } from './features/notifications/NotificationsPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { SettingsPage } from './features/settings/SettingsPage';

function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <EmptyState title={t('web.not_found_title')} body={t('web.not_found_body')} />
      <p className="center">
        <Link to="/">{t('web.back_to_dashboard')}</Link>
      </p>
    </>
  );
}

export function App() {
  const { phase } = useAuth();
  const location = useLocation();

  // Until fully signed in, every URL shows the login or MFA step, then returns to where the user was going.
  if (phase !== 'authenticated') {
    const returnTo = location.pathname === '/login' ? '/' : location.pathname + location.search;
    return (
      <Routes>
        <Route path="/login" element={phase === 'mfa' ? <MfaPage /> : <LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace state={{ returnTo }} />} />
      </Routes>
    );
  }

  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo ?? '/';
  return (
    <Routes>
      <Route path="/login" element={<Navigate to={returnTo} replace />} />
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="accounts/:id" element={<AccountDetailPage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
