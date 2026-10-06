import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import { ApiError } from '../../api/client';
import {
  useAccount,
  usePerformance,
  useTransactions,
  useUpdateAccount,
  type PerformanceRange,
  type TransactionType,
} from '../../api/hooks';
import { PerformanceChart } from '../../components/charts';
import {
  Card,
  ChangeIndicator,
  EmptyState,
  ErrorState,
  Eyebrow,
  Loading,
  PageHeader,
  Pagination,
  SectionTitle,
  Segmented,
  Tag,
} from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatDate, formatMoney, formatPercent } from '../../lib/format';

type TxFilter = 'all' | TransactionType;

export function AccountDetailPage() {
  const { id = '' } = useParams();
  const { t } = useTranslation();
  const locale = getAppLocale();
  const account = useAccount(id);

  if (account.isLoading) return <Loading />;
  if (account.error instanceof ApiError && account.error.status === 404) {
    return <EmptyState title={t('web.not_found_title')} body={t('web.not_found_body')} />;
  }
  if (account.error || !account.data) return <ErrorState error={account.error} onRetry={() => void account.refetch()} />;

  const a = account.data;
  return (
    <>
      <p className="breadcrumb">
        <Link to="/accounts">← {t('accounts.title')}</Link>
      </p>
      <PageHeader eyebrow={a.type} title={a.nickname ?? a.displayName} />

      <div className="grid grid--2">
        <Card className="hero">
          <Eyebrow>{a.displayName}</Eyebrow>
          <p className="hero__amount">{formatMoney(a.balance, a.currency, locale)}</p>
          {a.dayChangePct !== undefined ? (
            <ChangeIndicator changeMinor={a.dayChange} changePct={a.dayChangePct} currency={a.currency} label={t('dashboard.today')} />
          ) : null}
        </Card>
        <Card>
          <dl className="facts">
            <div>
              <dt>{t('accounts.tax_status')}</dt>
              <dd>{a.taxStatus}</dd>
            </div>
            <div>
              <dt>{t('accounts.rate_of_return')}</dt>
              <dd>{a.rateOfReturn !== undefined ? formatPercent(a.rateOfReturn, locale) : '—'}</dd>
            </div>
            <div>
              <dt>{t('accounts.contribution_room')}</dt>
              <dd>{a.contributionRoom != null ? formatMoney(a.contributionRoom, a.currency, locale) : '—'}</dd>
            </div>
          </dl>
          <NicknameEditor id={a.id} nickname={a.nickname} />
        </Card>
      </div>

      <PerformanceSection id={a.id} />

      <SectionTitle>{t('account_detail.holdings')}</SectionTitle>
      <Card>
        {a.holdings.length === 0 ? (
          <EmptyState title={t('common.empty_default_title')} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{t('account_detail.holdings')}</th>
                <th scope="col" className="num">{t('web.quantity')}</th>
                <th scope="col" className="num">{t('web.holdings_value')}</th>
                <th scope="col" className="num">{t('web.weight')}</th>
              </tr>
            </thead>
            <tbody>
              {a.holdings.map((h) => (
                <tr key={h.symbol}>
                  <td>
                    <strong>{h.symbol}</strong>
                    <div className="muted small">{h.name}</div>
                  </td>
                  <td className="num">{h.quantity}</td>
                  <td className="num">{formatMoney(h.marketValue, h.currency, locale)}</td>
                  <td className="num">{h.weightPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <TransactionsSection id={a.id} />
    </>
  );
}

function NicknameEditor({ id, nickname }: { id: string; nickname: string | null }) {
  const { t } = useTranslation();
  const update = useUpdateAccount(id);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(nickname ?? '');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate({ nickname: value.trim() || null }, { onSuccess: () => setEditing(false) });
  };

  if (!editing) {
    return (
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>
        {t('accounts.edit_nickname')}
      </button>
    );
  }
  return (
    <form className="inline-form" onSubmit={onSubmit}>
      <label>
        <span className="sr-only">{t('accounts.nickname')}</span>
        <input value={value} onChange={(e) => setValue(e.target.value)} maxLength={40} placeholder={t('accounts.nickname')} autoFocus />
      </label>
      <button type="submit" className="btn btn--primary btn--sm" disabled={update.isPending}>
        {t('common.save')}
      </button>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>
        {t('common.cancel')}
      </button>
      {update.isError ? <span className="form__error">{t('common.error_generic')}</span> : null}
    </form>
  );
}

function PerformanceSection({ id }: { id: string }) {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const [range, setRange] = useState<PerformanceRange>('1Y');
  const perf = usePerformance(id, range);

  return (
    <>
      <SectionTitle
        action={
          <Segmented
            label={t('account_detail.performance')}
            value={range}
            onChange={setRange}
            options={[
              { id: '1M', label: t('account_detail.range_1m') },
              { id: '1Y', label: t('account_detail.range_1y') },
              { id: 'ALL', label: t('account_detail.range_all') },
            ]}
          />
        }
      >
        {t('account_detail.performance')}
      </SectionTitle>
      <Card>
        {perf.isLoading ? (
          <Loading />
        ) : perf.error || !perf.data ? (
          <ErrorState error={perf.error} onRetry={() => void perf.refetch()} />
        ) : (
          <>
            <div className="row">
              <div>
                <p className="muted small">{t('account_detail.time_weighted_return')}</p>
                <p className="stat">{formatPercent(perf.data.timeWeightedReturnPct, locale)}</p>
              </div>
              <ul className="legend">
                <li><span className="swatch swatch--series" /> {t('web.account_label')}</li>
                <li><span className="swatch swatch--benchmark" /> {t('account_detail.benchmark')}: {perf.data.benchmark.name}</li>
              </ul>
            </div>
            <PerformanceChart
              series={perf.data.series}
              benchmark={perf.data.benchmark.series}
              label={`${t('account_detail.performance')} (${range})`}
            />
          </>
        )}
      </Card>
    </>
  );
}

function TransactionsSection({ id }: { id: string }) {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const [filter, setFilter] = useState<TxFilter>('all');
  const [page, setPage] = useState(1);
  const txs = useTransactions(id, page, filter === 'all' ? undefined : filter);

  const changeFilter = (f: TxFilter) => {
    setFilter(f);
    setPage(1);
  };

  return (
    <>
      <SectionTitle
        action={
          <Segmented<TxFilter>
            label={t('account_detail.transactions')}
            value={filter}
            onChange={changeFilter}
            options={[
              { id: 'all', label: t('account_detail.filter_all') },
              { id: 'contribution', label: t('account_detail.filter_contribution') },
              { id: 'buy', label: t('account_detail.filter_buy') },
              { id: 'dividend', label: t('account_detail.filter_dividend') },
            ]}
          />
        }
      >
        {t('account_detail.transactions')}
      </SectionTitle>
      <Card>
        {txs.isLoading ? (
          <Loading />
        ) : txs.error || !txs.data ? (
          <ErrorState error={txs.error} onRetry={() => void txs.refetch()} />
        ) : (
          <>
            {txs.data.scheduled.length > 0 ? (
              <>
                <p className="eyebrow">{`// ${t('account_detail.scheduled').toUpperCase()}`}</p>
                <TransactionList items={txs.data.scheduled} locale={locale} scheduled />
              </>
            ) : null}
            {txs.data.items.length === 0 ? (
              <EmptyState title={t('web.no_transactions')} />
            ) : (
              <TransactionList items={txs.data.items} locale={locale} />
            )}
            <Pagination page={txs.data.page} pageSize={txs.data.pageSize} total={txs.data.total} onChange={setPage} />
          </>
        )}
      </Card>
    </>
  );
}

function TransactionList({
  items,
  locale,
  scheduled = false,
}: {
  items: { id: string; date: string; description: string; detail?: string; amount: number; currency: string; type: string }[];
  locale: string;
  scheduled?: boolean;
}) {
  return (
    <ul className="tx-list">
      {items.map((tx) => (
        <li key={tx.id} className={scheduled ? 'tx tx--scheduled' : 'tx'}>
          <span className="tx__date muted small">{formatDate(tx.date, locale)}</span>
          <span className="tx__desc">
            {tx.description}
            {tx.detail ? <span className="muted small">{tx.detail}</span> : null}
          </span>
          <Tag tone={tx.type === 'dividend' ? 'success' : scheduled ? 'warning' : 'neutral'}>{tx.type}</Tag>
          <span className={`num tx__amount ${tx.amount < 0 ? 'is-negative' : ''}`}>{formatMoney(tx.amount, tx.currency, locale)}</span>
        </li>
      ))}
    </ul>
  );
}
