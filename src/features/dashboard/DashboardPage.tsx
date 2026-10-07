import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useDashboard, useProfile } from '../../api/hooks';
import { AllocationBar } from '../../components/charts';
import { Card, ChangeIndicator, ErrorState, Eyebrow, Loading, PageHeader, ProgressBar, SectionTitle, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { deepLinkToRoute } from '../../lib/deepLinks';
import { formatDateTime, formatMoney } from '../../lib/format';

export function DashboardPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data: profile } = useProfile();
  const { data, isLoading, error, refetch } = useDashboard();

  const firstName = profile?.name.split(' ')[0];
  const greeting = firstName ? t('dashboard.greeting_named', { name: firstName }) : t('dashboard.greeting');

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <>
      <PageHeader eyebrow={t('dashboard.dashboard_title')} title={greeting} />

      <Card className="hero">
        <Eyebrow>{t('dashboard.total_portfolio')}</Eyebrow>
        <p className="hero__amount">{formatMoney(data.portfolio.totalValue, data.portfolio.currency, locale)}</p>
        <ChangeIndicator
          changeMinor={data.portfolio.dayChange}
          changePct={data.portfolio.dayChangePct}
          currency={data.portfolio.currency}
          label={t('dashboard.today')}
        />
        <p className="hero__asof">{t('common.as_of', { time: formatDateTime(data.portfolio.asOf, locale) })}</p>
      </Card>

      {data.alerts.map((alert) => {
        const to = deepLinkToRoute(alert.deepLink);
        const body = (
          <>
            <span className="alert__icon" aria-hidden="true">!</span>
            <span className="alert__text">
              <strong>{t('dashboard.action_required')}</strong>
              <span>{alert.title}</span>
            </span>
            {to ? <span aria-hidden="true">›</span> : <Tag>{t('web.not_on_web')}</Tag>}
          </>
        );
        return to ? (
          <Link key={alert.id} to={to} className="alert">
            {body}
          </Link>
        ) : (
          <div key={alert.id} className="alert">
            {body}
          </div>
        );
      })}

      <div className="grid grid--2">
        <Card>
          <Eyebrow>{t('dashboard.asset_allocation')}</Eyebrow>
          <AllocationBar segments={data.allocation} totalMinor={data.portfolio.totalValue} currency={data.portfolio.currency} />
        </Card>

        <Card>
          <SectionTitle
            action={
              <Link to="/goals" className="small">
                {t('common.view_all')}
              </Link>
            }
          >
            {t('dashboard.goals')}
          </SectionTitle>
          <ul className="list">
            {data.goals.map((goal) => (
              <li key={goal.id} className="goal">
                <div className="row">
                  <span>{goal.name}</span>
                  <span className="muted small">{t('dashboard.goal_progress', { pct: goal.progressPct })}</span>
                </div>
                <ProgressBar value={goal.progressPct} label={goal.name} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <SectionTitle>{t('dashboard.quick_links')}</SectionTitle>
      <ul className="quick-links">
        {data.quickLinks.map((link) => {
          const to = deepLinkToRoute(link.deepLink);
          return (
            <li key={link.label}>
              {to ? (
                <Link to={to} className="quick-link">
                  {link.label}
                  <span aria-hidden="true">›</span>
                </Link>
              ) : (
                <span className="quick-link quick-link--disabled">
                  {link.label}
                  <Tag>{t('web.not_on_web')}</Tag>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
