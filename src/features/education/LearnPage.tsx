import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useEducationContent, useSaveEducationProgress, type EducationLevel } from '../../api/hooks';
import { Card, EmptyState, ErrorState, Loading, PageHeader, ProgressBar, Segmented, Tag } from '../../components/ui';

type LevelFilter = 'all' | EducationLevel;

export function LearnPage() {
  const { t } = useTranslation();
  const [level, setLevel] = useState<LevelFilter>('all');
  const { data, isLoading, error, refetch } = useEducationContent(level === 'all' ? undefined : level);
  const save = useSaveEducationProgress();

  const completed = data?.filter((c) => c.progressPct >= 100).length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={data ? t('web.lessons_completed', { done: completed, total: data.length }) : undefined}
        title={t('education.education')}
        actions={
          <Link to="/learn/glossary" className="btn btn--secondary">
            {t('education.glossary')}
          </Link>
        }
      />

      <div className="filters">
        <Segmented<LevelFilter>
          label={t('web.level')}
          value={level}
          onChange={setLevel}
          options={[
            { id: 'all', label: t('account_detail.filter_all') },
            { id: 'beginner', label: t('education.level_beginner') },
            { id: 'intermediate', label: t('education.level_intermediate') },
            { id: 'advanced', label: t('education.level_advanced') },
          ]}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.length ? (
        <Card>
          <EmptyState title={t('education.empty_title')} body={t('education.empty_body')} />
        </Card>
      ) : (
        <ul className="goal-grid">
          {data.map((item) => {
            const done = item.progressPct >= 100;
            return (
              <li key={item.id}>
                <Card>
                  <div className="tags">
                    <Tag tone="info">{t(`education.level_${item.level}`)}</Tag>
                    <Tag>{t(`education.type_${item.type}`)}</Tag>
                    <Tag>{t('education.duration', { min: item.durationMin })}</Tag>
                  </div>
                  <h2 className="lesson__title">{item.title}</h2>
                  <ProgressBar value={item.progressPct} label={item.title} />
                  <div className="row goal-card__footer">
                    <span className="muted small">{t('education.progress', { pct: item.progressPct })}</span>
                    {done ? (
                      <Tag tone="success">{t('web.completed')}</Tag>
                    ) : (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() => save.mutate({ contentId: item.id, progressPct: 100 })}
                        disabled={save.isPending && save.variables?.contentId === item.id}
                      >
                        {t('web.mark_complete')}
                      </button>
                    )}
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
