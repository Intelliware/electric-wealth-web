import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { usePriceHistory, useSecurity, useToggleWatchlist, type HistoryRange } from '../../api/hooks';
import { PriceChart } from '../../components/charts';
import { Card, ChangeIndicator, ErrorState, Loading, PageHeader, SectionTitle, Segmented, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatMoney, formatPercent } from '../../lib/format';

export function SecurityPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const symbol = decodeURIComponent(useParams().symbol ?? '');
  const security = useSecurity(symbol);
  const [range, setRange] = useState<HistoryRange>('1M');
  const history = usePriceHistory(symbol, range);
  const toggle = useToggleWatchlist();

  if (security.isLoading) return <Loading />;
  if (security.error || !security.data) return <ErrorState error={security.error} onRetry={() => void security.refetch()} />;
  const s = security.data;

  const series = history.data?.series ?? [];
  const first = series[0]?.c;
  const rangeChangePct = first ? ((s.price - first) / first) * 100 : 0;
  const closes = series.map((p) => p.c);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/market">← {t('market.market')}</Link>
      </p>
      <PageHeader
        eyebrow={`${s.symbol} · ${s.exchange}`}
        title={s.name}
        actions={
          <button
            type="button"
            className={`btn ${s.watched ? 'btn--secondary' : 'btn--primary'}`}
            onClick={() => toggle.mutate({ symbol: s.symbol, watch: !s.watched })}
            disabled={toggle.isPending}
            aria-pressed={s.watched}
          >
            {s.watched ? t('web.remove_from_watchlist') : t('market.add_watchlist')}
          </button>
        }
      />

      <Card className="hero">
        <p className="hero__amount">{formatMoney(s.price, s.currency, locale)}</p>
        <ChangeIndicator changeMinor={s.change} changePct={s.changePct} currency={s.currency} label={t('web.today_lower')} />
        {s.held ? (
          <div className="tags" style={{ marginTop: 10 }}>
            <Tag tone="success">{t('market.held')}</Tag>
          </div>
        ) : null}
      </Card>

      <SectionTitle
        action={
          <Segmented<HistoryRange>
            label={t('web.chart_range')}
            value={range}
            onChange={setRange}
            options={[
              { id: '1D', label: t('stock_detail.range_1d') },
              { id: '1M', label: t('stock_detail.range_1m') },
              { id: '1Y', label: t('stock_detail.range_1y') },
              { id: '5Y', label: t('stock_detail.range_5y') },
            ]}
          />
        }
      >
        {t('web.price_history')}
      </SectionTitle>
      <Card>
        {history.isLoading ? (
          <Loading />
        ) : history.error ? (
          <ErrorState error={history.error} onRetry={() => void history.refetch()} />
        ) : (
          <>
            <PriceChart series={series} up={rangeChangePct >= 0} label={`${s.symbol} ${t('web.price_history')} (${range})`} />
            <dl className="facts facts--inline">
              <div>
                <dt>{t('web.range_change', { range })}</dt>
                <dd>{formatPercent(rangeChangePct, locale)}</dd>
              </div>
              <div>
                <dt>{t('web.range_high')}</dt>
                <dd>{closes.length ? formatMoney(Math.max(...closes), s.currency, locale) : '—'}</dd>
              </div>
              <div>
                <dt>{t('web.range_low')}</dt>
                <dd>{closes.length ? formatMoney(Math.min(...closes), s.currency, locale) : '—'}</dd>
              </div>
            </dl>
          </>
        )}
      </Card>

      {s.about ? (
        <>
          <SectionTitle>{t('stock_detail.about')}</SectionTitle>
          <Card>
            <p>{s.about}</p>
          </Card>
        </>
      ) : null}
    </>
  );
}
