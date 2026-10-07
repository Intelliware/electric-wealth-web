import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useGlossary } from '../../api/hooks';
import { Card, EmptyState, ErrorState, Loading, PageHeader } from '../../components/ui';

export function GlossaryPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const q = useDeferredValue(search.trim());
  const { data, isLoading, error, refetch } = useGlossary(q);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/learn">← {t('education.education')}</Link>
      </p>
      <PageHeader title={t('glossary.title')} />

      <div className="filters">
        <label className="search">
          <span className="sr-only">{t('common.search')}</span>
          <input type="search" placeholder={t('glossary.search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} maxLength={60} />
        </label>
      </div>

      <Card>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : !data?.length ? (
          <EmptyState title={t('glossary.empty_title')} body={t('glossary.empty_body')} />
        ) : (
          <dl className="glossary">
            {data.map((entry) => (
              <div key={entry.term}>
                <dt>{entry.term}</dt>
                <dd>{entry.definition}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>
    </>
  );
}
