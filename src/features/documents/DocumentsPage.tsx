import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';
import { api, unwrap } from '../../api/client';
import { useDocuments } from '../../api/hooks';
import { Card, EmptyState, ErrorState, Loading, PageHeader, Segmented, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatBytes } from '../../lib/format';

type YearFilter = 'all' | '2024' | '2023';
type CategoryFilter = 'all' | 'Tax' | 'Statements' | 'Confirmations' | 'Legal';

export function DocumentsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const [params] = useSearchParams();
  const highlight = params.get('highlight');
  const [year, setYear] = useState<YearFilter>('all');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useDocuments({
    year: year === 'all' ? undefined : Number(year),
    category: category === 'all' ? undefined : category,
  });

  const items = (data?.items ?? []).filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()));

  // The API returns a stub PDF; this shows the round trip without real document storage.
  const download = async (id: string, name: string) => {
    setDownloading(id);
    try {
      const doc = unwrap(await api.GET('/api/wealth/documents/{id}', { params: { path: { id } } }));
      const bytes = Uint8Array.from(atob(doc.base64Stub), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: doc.contentType }));
      const link = Object.assign(document.createElement('a'), { href: url, download: `${name}.pdf` });
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <PageHeader eyebrow={t('documents.encrypted')} title={t('documents.vault')} />

      <div className="filters">
        <label className="search">
          <span className="sr-only">{t('common.search')}</span>
          <input type="search" placeholder={t('documents.search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <Segmented<YearFilter>
          label={t('documents.filter_year')}
          value={year}
          onChange={setYear}
          options={[
            { id: 'all', label: t('account_detail.filter_all') },
            { id: '2024', label: '2024' },
            { id: '2023', label: '2023' },
          ]}
        />
        <Segmented<CategoryFilter>
          label={t('documents.filter_category')}
          value={category}
          onChange={setCategory}
          options={[
            { id: 'all', label: t('account_detail.filter_all') },
            { id: 'Tax', label: t('documents.category_tax') },
            { id: 'Statements', label: t('documents.category_statements') },
            { id: 'Confirmations', label: t('documents.category_confirmations') },
            { id: 'Legal', label: t('documents.category_legal') },
          ]}
        />
      </div>

      <Card>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title={t('documents.empty_title')} body={t('documents.empty_body')} />
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th scope="col">{t('documents.documents')}</th>
                <th scope="col">{t('web.account_label')}</th>
                <th scope="col">{t('web.year')}</th>
                <th scope="col" className="num">{t('web.size')}</th>
                <th scope="col"><span className="sr-only">{t('web.download')}</span></th>
              </tr>
            </thead>
            <tbody>
              {items.map((doc) => (
                <tr key={doc.id} className={doc.id === highlight ? 'is-highlighted' : undefined}>
                  <td>
                    <strong>{doc.name}</strong>
                    <div className="tags">
                      <Tag tone="info">{doc.category}</Tag>
                      {doc.actionRequired ? <Tag tone="warning">{t('documents.action_required')}</Tag> : null}
                    </div>
                  </td>
                  <td>{doc.accountId ? doc.accountLabel : t('web.all_accounts')}</td>
                  <td>{doc.year}</td>
                  <td className="num">{formatBytes(doc.sizeBytes, locale)}</td>
                  <td className="num">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => void download(doc.id, doc.name)}
                      disabled={downloading === doc.id}
                    >
                      {t('web.download')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
