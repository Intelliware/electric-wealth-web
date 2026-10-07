import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useMarketNews, useMarketRoundup, useMarketSearch, useToggleWatchlist, useWatchlist } from '../../api/hooks';
import { Card, ChangeIndicator, EmptyState, ErrorState, Loading, PageHeader, SectionTitle, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatDate, formatDateTime, formatMoney } from '../../lib/format';

export const securityPath = (symbol: string) => `/market/${encodeURIComponent(symbol)}`;

export function MarketPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const watchlist = useWatchlist();
  const toggle = useToggleWatchlist();
  const news = useMarketNews();
  const roundup = useMarketRoundup();

  return (
    <>
      <PageHeader
        eyebrow={t('market.insights')}
        title={t('market.market')}
        actions={
          <Link to="/market/baskets" className="btn btn--secondary">
            {t('baskets.title')}
          </Link>
        }
      />

      <SecuritySearch />

      <SectionTitle>{t('market.watchlist')}</SectionTitle>
      <Card>
        {watchlist.isLoading ? (
          <Loading />
        ) : watchlist.error ? (
          <ErrorState error={watchlist.error} onRetry={() => void watchlist.refetch()} />
        ) : !watchlist.data?.length ? (
          <EmptyState title={t('market.empty_watchlist')} body={t('web.watchlist_hint')} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{t('web.security')}</th>
                <th scope="col" className="num">{t('web.price')}</th>
                <th scope="col" className="num">{t('web.today')}</th>
                <th scope="col"><span className="sr-only">{t('web.actions')}</span></th>
              </tr>
            </thead>
            <tbody>
              {watchlist.data.map((q) => (
                <tr key={q.symbol}>
                  <td>
                    <Link to={securityPath(q.symbol)}>
                      <strong>{q.symbol}</strong>
                    </Link>
                    <div className="muted small">{q.name}</div>
                    {q.held ? (
                      <div className="tags">
                        <Tag tone="success">{t('market.held')}</Tag>
                      </div>
                    ) : null}
                  </td>
                  <td className="num">{formatMoney(q.price, q.currency, locale)}</td>
                  <td className="num">
                    <ChangeIndicator changePct={q.changePct} currency={q.currency} />
                  </td>
                  <td className="num">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => toggle.mutate({ symbol: q.symbol, watch: false })}
                      disabled={toggle.isPending}
                      aria-label={t('web.remove_from_watchlist_named', { symbol: q.symbol })}
                    >
                      {t('web.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="grid grid--2">
        <section>
          <SectionTitle>{t('market.news')}</SectionTitle>
          <Card>
            {news.data ? (
              <ul className="news-list">
                {news.data.map((n) => (
                  <li key={n.id}>
                    <p className="news__title">{n.title}</p>
                    <p className="muted small">
                      {n.source} · {formatDateTime(n.publishedAt, locale)}
                      {n.tag ? <> · <Tag>{n.tag}</Tag></> : null}
                    </p>
                  </li>
                ))}
              </ul>
            ) : news.error ? (
              <ErrorState error={news.error} onRetry={() => void news.refetch()} />
            ) : (
              <Loading />
            )}
          </Card>
        </section>
        <section>
          <SectionTitle>
            {t('market.roundup')}
            {roundup.data?.weekOf ? <span className="muted small"> · {formatDate(roundup.data.weekOf, locale)}</span> : null}
          </SectionTitle>
          <Card>
            {roundup.data ? (
              <ul className="news-list">
                {roundup.data.items.map((r) => (
                  <li key={r.id}>
                    <p className="news__title">{r.title}</p>
                    <p className="muted small">{r.summary}</p>
                  </li>
                ))}
              </ul>
            ) : roundup.error ? (
              <ErrorState error={roundup.error} onRetry={() => void roundup.refetch()} />
            ) : (
              <Loading />
            )}
          </Card>
        </section>
      </div>
    </>
  );
}

function SecuritySearch() {
  const { t } = useTranslation();
  const [q, setQ] = useState('');
  const term = useDeferredValue(q.trim());
  const search = useMarketSearch(term);
  const show = term.length >= 2;

  return (
    <div className="market-search">
      <label className="search">
        <span className="sr-only">{t('common.search')}</span>
        <input type="search" placeholder={t('market.search_placeholder')} value={q} onChange={(e) => setQ(e.target.value)} maxLength={40} />
      </label>
      {show ? (
        <Card className="market-search__results">
          {search.isLoading ? (
            <Loading />
          ) : !search.data?.items.length ? (
            <p className="muted">{t('web.no_search_results', { q: term })}</p>
          ) : (
            <ul aria-label={t('market.search_results')}>
              {search.data.items.map((r) => (
                <li key={r.symbol}>
                  <Link to={securityPath(r.symbol)}>
                    <strong>{r.symbol}</strong> <span className="muted">{r.name}</span>
                  </Link>
                  <span className="muted small">{r.exchange}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
    </div>
  );
}
