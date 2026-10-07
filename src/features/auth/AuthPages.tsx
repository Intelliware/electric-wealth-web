import { useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { getAppLocale, setAppLocale } from '../../i18n';

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { t } = useTranslation();
  const toggleLanguage = () => void setAppLocale(getAppLocale() === 'en-CA' ? 'fr-CA' : 'en-CA');
  return (
    <div className="auth">
      <div className="auth__panel">
        <div className="auth__top">
          <span className="brand">
            <span className="brand__mark" aria-hidden="true">⚡</span>
            {t('common.app_name')}
          </span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={toggleLanguage} aria-label={t('web.language_toggle_label')}>
            {t('web.language_toggle')}
          </button>
        </div>
        <h1>{title}</h1>
        <p className="muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const { login, signOutReason } = useAuth();
  const [email, setEmail] = useState('sarah.chen@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const notice =
    signOutReason === 'idle' ? t('web.idle_signed_out') : signOutReason === 'expired' ? t('auth.session_expired') : null;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? t('auth.invalid_credentials') : t('common.error_generic'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title={t('auth.login_title')} subtitle={t('auth.login_subtitle')}>
      {notice ? <p className="notice">{notice}</p> : null}
      <form className="form" onSubmit={onSubmit} noValidate>
        <label>
          {t('auth.email')}
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          {t('auth.password')}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
        </label>
        {error ? (
          <p className="form__error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary" disabled={busy || !email || !password}>
          {busy ? t('common.loading') : t('auth.login')}
        </button>
        <p className="muted small">{t('web.demo_hint')}</p>
      </form>
      <p className="auth__switch">
        {t('web.no_online_access')} <Link to="/register">{t('auth.create_account')}</Link>
      </p>
    </AuthCard>
  );
}

export function MfaPage() {
  const { t } = useTranslation();
  const { verifyMfa, logout } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await verifyMfa(code);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'UNAUTHORIZED') {
        logout('expired');
        return;
      }
      setError(err instanceof ApiError && err.status === 401 ? t('auth.mfa_invalid') : t('common.error_generic'));
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title={t('auth.mfa_title')} subtitle={t('auth.mfa_subtitle')}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label>
          {t('auth.mfa_code')}
          <input
            className="code-input"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
        </label>
        {error ? (
          <p className="form__error" role="alert">
            {error}
          </p>
        ) : null}
        <button type="submit" className="btn btn--primary" disabled={busy || code.length !== 6}>
          {busy ? t('common.loading') : t('auth.mfa_verify')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => logout('user')}>
          {t('common.back')}
        </button>
        <p className="muted small">{t('web.mfa_demo_hint')}</p>
      </form>
    </AuthCard>
  );
}
