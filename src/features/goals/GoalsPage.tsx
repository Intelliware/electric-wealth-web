import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError, type Schemas } from '../../api/client';
import { useCreateGoal, useGoals } from '../../api/hooks';
import { Card, EmptyState, ErrorState, Loading, PageHeader, ProgressBar, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatDate, formatMoney } from '../../lib/format';

type GoalCategory = Schemas['GoalCategory'];

const CATEGORIES: GoalCategory[] = ['Home', 'Retirement', 'Education', 'Vacation', 'Safety'];

/** Same rule as the mobile app: at least half way there counts as on track. */
const isOnTrack = (goal: Schemas['Goal']) => goal.progressPct >= 50;

export function GoalsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data, isLoading, error, refetch } = useGoals();
  const [adding, setAdding] = useState(false);

  return (
    <>
      <PageHeader
        title={t('goals.title')}
        actions={
          adding ? null : (
            <button type="button" className="btn btn--primary" onClick={() => setAdding(true)}>
              {t('goals.add_goal')}
            </button>
          )
        }
      />

      {adding ? <GoalForm onDone={() => setAdding(false)} /> : null}

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : !data?.items.length ? (
        <Card>
          <EmptyState title={t('goals.empty_title')} body={t('goals.empty_body')} />
        </Card>
      ) : (
        <ul className="goal-grid">
          {data.items.map((goal) => (
            <li key={goal.id}>
              <Card>
                <div className="row">
                  <h2>{goal.name}</h2>
                  <Tag>{t(`goals.category_${goal.category.toLowerCase()}`)}</Tag>
                </div>
                <p className="goal-card__amounts">
                  <strong>{formatMoney(goal.currentAmount, goal.currency, locale)}</strong>
                  <span className="muted"> / {formatMoney(goal.targetAmount, goal.currency, locale)}</span>
                </p>
                <ProgressBar value={goal.progressPct} label={goal.name} />
                <div className="row goal-card__footer">
                  <Tag tone={isOnTrack(goal) ? 'success' : 'warning'}>
                    {goal.progressPct}% · {isOnTrack(goal) ? t('goals.on_track') : t('goals.off_track')}
                  </Tag>
                  <span className="muted small">
                    {t('goals.target_date')}: {formatDate(goal.targetDate, locale)}
                  </span>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const toCents = (dollars: string) => Math.round(Number(dollars) * 100);

function GoalForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const create = useCreateGoal();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Home');
  const [target, setTarget] = useState('');
  const [current, setCurrent] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        name,
        category,
        targetAmount: toCents(target),
        currentAmount: current ? toCents(current) : undefined,
        currency: 'CAD',
        targetDate,
      },
      { onSuccess: onDone },
    );
  };

  const invalid = create.error instanceof ApiError && create.error.code === 'VALIDATION_ERROR';

  return (
    <Card className="goal-form">
      <h2>{t('goals.add_goal')}</h2>
      <form className="form" onSubmit={onSubmit}>
        <div className="form__row form__row--2">
          <label>
            {t('goals.goal_name')}
            <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoFocus />
          </label>
          <label>
            {t('goals.category')}
            <select value={category} onChange={(e) => setCategory(e.target.value as GoalCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`goals.category_${c.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form__row">
          <label>
            {t('goals.target_amount')} ($)
            <input type="number" inputMode="decimal" min="1" step="0.01" value={target} onChange={(e) => setTarget(e.target.value)} required />
          </label>
          <label>
            {t('goals.current_amount')} ($)
            <input
              type="number"
              inputMode="decimal"
              min="0"
              max={target || undefined}
              step="0.01"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            {t('goals.target_date')}
            <input type="date" min={tomorrow} value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required />
          </label>
        </div>
        {create.error ? (
          <p className="form__error" role="alert">
            {invalid ? t('web.goal_invalid') : t('common.error_generic')}
          </p>
        ) : null}
        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={create.isPending}>
            {t('common.save')}
          </button>
          <button type="button" className="btn btn--secondary" onClick={onDone} disabled={create.isPending}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </Card>
  );
}
