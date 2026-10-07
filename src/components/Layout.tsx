import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Outlet, useLocation } from 'react-router';
import { usePreferences, useProfile, useUpdatePreferences } from '../api/hooks';
import { useAuth } from '../auth/AuthContext';
import { getAppLocale, setAppLocale } from '../i18n';
import { initials } from '../lib/format';

/** Applies the user's saved theme preference (light / dark / system). */
function useThemePreference() {
  const { data: prefs } = usePreferences();
  useEffect(() => {
    const theme = prefs?.theme;
    if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
  }, [prefs?.theme]);
}

export function Layout() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { data: profile } = useProfile();
  const updatePreferences = useUpdatePreferences();
  useThemePreference();

  const toggleLanguage = () => {
    const language = getAppLocale() === 'en-CA' ? 'fr-CA' : 'en-CA';
    void setAppLocale(language);
    updatePreferences.mutate({ language }); // remember the choice on the user's profile too
  };

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">⚡</span>
            {t('common.app_name')}
          </NavLink>
          <nav className="topnav" aria-label={t('web.nav_main')}>
            <NavLink to="/" end>
              {t('web.nav_dashboard')}
            </NavLink>
            <NavLink to="/accounts">{t('web.nav_accounts')}</NavLink>
            <NavLink to="/documents">{t('web.nav_documents')}</NavLink>
          </nav>
          <div className="topbar__actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={toggleLanguage} aria-label={t('web.language_toggle_label')}>
              {t('web.language_toggle')}
            </button>
            <UserMenu name={profile?.name} onSignOut={() => logout('user')} />
          </div>
        </div>
      </header>
      <main id="main" className="content">
        <Outlet />
      </main>
    </div>
  );
}

/** Avatar button that opens a small menu with the profile, settings and sign-out. */
function UserMenu({ name, onSignOut }: { name?: string; onSignOut: () => void }) {
  const { t } = useTranslation();
  const menu = useRef<HTMLDetailsElement>(null);
  const location = useLocation();

  // Close the menu after navigating, and when clicking anywhere outside it.
  useEffect(() => {
    if (menu.current) menu.current.open = false;
  }, [location.pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menu.current?.open && !menu.current.contains(e.target as Node)) menu.current.open = false;
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const label = name ? t('web.signed_in_as', { name }) : t('web.user_menu');
  return (
    <details className="user-menu" ref={menu}>
      <summary className="avatar" aria-label={label} title={label}>
        {initials(name)}
      </summary>
      <div className="user-menu__panel">
        {name ? <p className="user-menu__name">{name}</p> : null}
        <NavLink to="/profile">{t('profile.title')}</NavLink>
        <NavLink to="/settings">{t('settings.title')}</NavLink>
        <button type="button" onClick={onSignOut}>
          {t('auth.logout')}
        </button>
      </div>
    </details>
  );
}
