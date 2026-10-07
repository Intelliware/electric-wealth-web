import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useBaskets } from '../../api/hooks';
import { Card, ErrorState, Loading, PageHeader, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatPercent } from '../../lib/format';

const RISK_TONE = { Low: 'success', Medium: 'info', High: 'warning' } as const;

export function BasketsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data, isLoading, error, refetch } = useBaskets();

  return (
    <>
      <p className="breadcrumb">
        <Link to="/market">← {t('market.market')}</Link>
      </p>
      <PageHeader title={t('baskets.title')} />
      {isLoading ? (
        <Loading />
      ) : error || !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : (
        <ul className="goal-grid">
          {data.map((b) => (
            <li key={b.id}>
              <Card>
                <div className="row">
                  <h2>{b.name}</h2>
                  <Tag tone={RISK_TONE[b.risk]}>
                    {t('baskets.risk')}: {t(`baskets.risk_${b.risk.toLowerCase()}`)}
                  </Tag>
                </div>
                <p className="muted">{b.description}</p>
                <dl className="facts facts--inline">
                  <div>
                    <dt>{t('baskets.return_1y')}</dt>
                    <dd className={b.return1YPct >= 0 ? 'change--up' : 'change--down'}>{formatPercent(b.return1YPct, locale, 1)}</dd>
                  </div>
                  <div>
                    <dt>{t('web.holdings')}</dt>
                    <dd>{t('baskets.holdings_count', { count: b.holdings })}</dd>
                  </div>
                </dl>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
