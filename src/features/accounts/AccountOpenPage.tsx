import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import type { Schemas } from '../../api/client';
import { useOpenAccount } from '../../api/hooks';
import { Card, PageHeader } from '../../components/ui';

type OpenableType = Schemas['OpenableAccountType'];

const TYPES: OpenableType[] = ['TFSA', 'RRSP', 'FHSA', 'NON_REGISTERED'];
const STEPS = 3;

/** Three steps, as in the mobile app: choose a type, name it, then review and confirm. */
export function AccountOpenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const open = useOpenAccount();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<OpenableType>('TFSA');
  const [displayName, setDisplayName] = useState('');

  const typeLabel = (tp: OpenableType) => t(`web.account_types.${tp}.name`);
  const name = displayName.trim() || t('web.default_account_name', { type: typeLabel(type) });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step < STEPS) {
      setStep(step + 1);
      return;
    }
    open.mutate({ type, displayName: name });
  };

  if (open.data) {
    return (
      <>
        <PageHeader title={t('account_open.success_title')} />
        <Card>
          <p>{t('account_open.success_body')}</p>
          <div className="form__actions" style={{ marginTop: 16 }}>
            <Link to={`/accounts/${encodeURIComponent(open.data.id)}`} className="btn btn--primary">
              {t('web.view_account', { name: open.data.displayName })}
            </Link>
            <Link to="/accounts" className="btn btn--secondary">
              {t('web.back_to_accounts')}
            </Link>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={t('register.step_of', { current: step, total: STEPS })} title={t('account_open.title')} />
      <ol className="stepper" aria-label={t('register.step_of', { current: step, total: STEPS })}>
        {[t('account_open.choose_type'), t('web.account_name'), t('account_open.review')].map((label, i) => (
          <li key={label} className={i + 1 === step ? 'is-current' : i + 1 < step ? 'is-done' : ''} aria-current={i + 1 === step ? 'step' : undefined}>
            {label}
          </li>
        ))}
      </ol>

      <Card>
        <form className="form" onSubmit={onSubmit}>
          {step === 1 ? (
            <fieldset className="choice-list">
              <legend>{t('account_open.choose_type')}</legend>
              {TYPES.map((tp) => (
                <label key={tp} className={`choice ${type === tp ? 'is-selected' : ''}`}>
                  <input type="radio" name="type" value={tp} checked={type === tp} onChange={() => setType(tp)} />
                  <span>
                    <strong>{typeLabel(tp)}</strong>
                    <span className="muted small">{t(`web.account_types.${tp}.description`)}</span>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}

          {step === 2 ? (
            <label>
              {t('web.account_name')}
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                placeholder={t('web.default_account_name', { type: typeLabel(type) })}
                autoFocus
              />
            </label>
          ) : null}

          {step === 3 ? (
            <>
              <dl className="facts">
                <div>
                  <dt>{t('web.account_type')}</dt>
                  <dd>{typeLabel(type)}</dd>
                </div>
                <div>
                  <dt>{t('web.account_name')}</dt>
                  <dd>{name}</dd>
                </div>
              </dl>
              <p className="muted small">{t('account_open.kyc_note')}</p>
            </>
          ) : null}

          {open.error ? (
            <p className="form__error" role="alert">
              {t('common.error_generic')}
            </p>
          ) : null}

          <div className="form__actions">
            <button type="submit" className="btn btn--primary" disabled={open.isPending}>
              {step === STEPS ? t('web.open_account_confirm') : t('common.next')}
            </button>
            {step > 1 ? (
              <button type="button" className="btn btn--secondary" onClick={() => setStep(step - 1)} disabled={open.isPending}>
                {t('common.back')}
              </button>
            ) : (
              <button type="button" className="btn btn--secondary" onClick={() => void navigate('/accounts')}>
                {t('common.cancel')}
              </button>
            )}
          </div>
        </form>
      </Card>
    </>
  );
}
