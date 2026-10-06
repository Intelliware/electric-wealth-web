// Small presentational components shared by the pages (web counterparts of mobile/src/components).
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client';
import { getAppLocale } from '../i18n';
import { changeDirection, changeGlyph, formatMoney, formatPercent } from '../lib/format';

export function Card({ children, className = '', tone }: { children: ReactNode; className?: string; tone?: 'warning' }) {
  return <section className={`card ${tone ? `card--${tone}` : ''} ${className}`}>{children}</section>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{`// ${String(children).toUpperCase()}`}</p>;
}

export function PageHeader({ title, eyebrow, actions }: { title: string; eyebrow?: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1>{title}</h1>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="section-title">
      <h2>{children}</h2>
      {action}
    </div>
  );
}

export function Loading() {
  const { t } = useTranslation();
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      {t('common.loading')}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const { t } = useTranslation();
  const traceId = error instanceof ApiError ? error.traceId : undefined;
  return (
    <div className="state state--error" role="alert">
      <p>{t('common.error_generic')}</p>
      {traceId ? <p className="muted small">Trace: {traceId}</p> : null}
      {onRetry ? (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          {t('common.retry')}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="state">
      <p className="state__title">{title}</p>
      {body ? <p className="muted">{body}</p> : null}
    </div>
  );
}

export function Tag({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'info' | 'warning' | 'success' }) {
  return <span className={`tag tag--${tone}`}>{children}</span>;
}

export function ChangeIndicator({
  changeMinor,
  changePct,
  currency,
  label,
}: {
  changeMinor?: number;
  changePct: number;
  currency: string;
  label?: string;
}) {
  const locale = getAppLocale();
  const direction = changeDirection(changePct);
  return (
    <span className={`change change--${direction}`}>
      <span aria-hidden="true">{changeGlyph(changePct)}</span>{' '}
      {changeMinor !== undefined ? `${formatMoney(Math.abs(changeMinor), currency, locale)} · ` : ''}
      {formatPercent(changePct, locale)}
      {label ? ` ${label}` : ''}
    </span>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`progress ${clamped >= 50 ? 'progress--good' : 'progress--low'}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={o.id === value ? 'is-active' : ''}
          aria-pressed={o.id === value}
          onClick={() => onChange(o.id)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn--ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        {t('web.previous')}
      </button>
      <span className="muted small">{t('web.page_of', { page, pages })}</span>
      <button type="button" className="btn btn--ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        {t('web.next')}
      </button>
    </nav>
  );
}
