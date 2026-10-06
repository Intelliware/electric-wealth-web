import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAccounts } from '../../api/hooks';
import { Card, ChangeIndicator, EmptyState, ErrorState, Eyebrow, Loading, PageHeader, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatMoney } from '../../lib/format';

export function AccountsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data, isLoading, error, refetch } = useAccounts();
  const [hideBalances, setHideBalances] = useState(false);

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  const total = data.items.reduce((sum, a) => sum + a.balance, 0);
  const currency = data.items[0]?.currency ?? 'CAD';
  const money = (minor: number, cur: string) => (hideBalances ? '••••' : formatMoney(minor, cur, locale));

  return (
    <>
      <PageHeader
        title={t('accounts.title')}
        actions={
          <button type="button" className="btn btn--ghost" onClick={() => setHideBalances((h) => !h)} aria-pressed={hideBalances}>
            {hideBalances ? t('accounts.show_balances') : t('accounts.hide_balances')}
          </button>
        }
      />

      <Card className="hero">
        <Eyebrow>{t('accounts.total_balance')}</Eyebrow>
        <p className="hero__amount">{money(total, currency)}</p>
        <p className="hero__asof">{t('web.hidden_accounts_note')}</p>
      </Card>

      {data.items.length === 0 ? (
        <EmptyState title={t('accounts.empty_title')} body={t('accounts.empty_body')} />
      ) : (
        <ul className="account-list">
          {data.items.map((account) => (
            <li key={account.id}>
              <Link to={`/accounts/${encodeURIComponent(account.id)}`} className="account-row">
                <span className="account-row__main">
                  <span className="account-row__name">{account.nickname ?? account.displayName}</span>
                  <span className="muted small">
                    {account.nickname ? `${account.displayName} · ` : ''}
                    {account.taxStatus}
                  </span>
                </span>
                <Tag tone="info">{account.type}</Tag>
                <span className="account-row__value">
                  <span className="num">{money(account.balance, account.currency)}</span>
                  {!hideBalances && account.dayChangePct !== undefined ? (
                    <ChangeIndicator changeMinor={account.dayChange} changePct={account.dayChangePct} currency={account.currency} />
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
