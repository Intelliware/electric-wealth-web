import { useQuery } from '@tanstack/react-query';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { api, ApiError, unwrap, type Schemas } from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { AuthCard } from './AuthPages';

const TOTAL = 7;
type MfaMethod = 'sms' | 'email';
type Tokens = { accessToken: string; refreshToken: string };

/**
 * Online enrolment for an existing client, in the same seven steps as the mobile app:
 * login, identity, security questions, two-step method, trusted contact, consent, done.
 * The API keeps the registration between steps; the session is only started at the very end.
 */
export function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { startSession } = useAuth();
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [registrationId, setRegistrationId] = useState('');
  const [clientName, setClientName] = useState('');
  const [mfaMethod, setMfaMethod] = useState<MfaMethod>('sms');
  const [tokens, setTokens] = useState<Tokens | null>(null);

  const questions = useQuery({
    queryKey: ['registration', 'questions', i18n.language],
    queryFn: async () => unwrap(await api.GET('/api/registration/security-questions')),
    enabled: step === 3,
  });

  const titles = [1, 2, 3, 4, 5, 6, 7].map((n) => t(`register.step${n}_title`));
  const subtitles = [1, 2, 3, 4, 5, 6, 7].map((n) => t(`register.step${n}_subtitle`));

  /** Runs one API step; on success moves to the next step, on failure shows a message for the error code. */
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setStep((s) => s + 1);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : '';
      if (code === 'REGISTRATION_NOT_FOUND') {
        setRegistrationId('');
        setStep(1);
      }
      setError(t(`web.register_errors.${code}`, { defaultValue: t('common.error_generic') }));
    } finally {
      setBusy(false);
    }
  };

  const finish = () => {
    if (!tokens) return;
    void navigate('/', { replace: true });
    startSession(tokens);
  };

  return (
    <AuthCard title={t('register.title')} subtitle={t('register.step_of', { current: step, total: TOTAL })}>
      <div className="progress progress--good register__progress" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={TOTAL} aria-label={t('register.step_of', { current: step, total: TOTAL })}>
        <span style={{ width: `${(step / TOTAL) * 100}%` }} />
      </div>
      <h2 className="register__title">{titles[step - 1]}</h2>
      <p className="muted small">{subtitles[step - 1]}</p>

      {error ? (
        <p className="form__error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </p>
      ) : null}

      {step === 1 ? (
        <CredentialsStep
          busy={busy}
          onSubmit={(email, password) =>
            run(async () => {
              const res = unwrap(await api.POST('/api/registration/start', { body: { email, password } }));
              setRegistrationId(res.registrationId);
            })
          }
        />
      ) : null}

      {step === 2 ? (
        <IdentityStep
          busy={busy}
          onBack={() => setStep(1)}
          onSubmit={(accountNumber, postalCode, dateOfBirth) =>
            run(async () => {
              const res = unwrap(
                await api.POST('/api/registration/verify-identity', { body: { registrationId, accountNumber, postalCode, dateOfBirth } }),
              );
              setClientName(res.name);
            })
          }
        />
      ) : null}

      {step === 3 ? (
        <SecurityQuestionsStep
          busy={busy}
          clientName={clientName}
          questions={questions.data ?? []}
          onBack={() => setStep(2)}
          onSubmit={(answers) =>
            run(async () => {
              unwrap(await api.POST('/api/registration/security-questions', { body: { registrationId, answers } }));
            })
          }
        />
      ) : null}

      {step === 4 ? (
        <StepForm busy={busy} onBack={() => setStep(3)} onSubmit={() => setStep(5)}>
          <fieldset className="choice-list">
            <legend className="sr-only">{titles[3]}</legend>
            {(['sms', 'email'] as const).map((m) => (
              <label key={m} className={`choice ${mfaMethod === m ? 'is-selected' : ''}`}>
                <input type="radio" name="mfa" value={m} checked={mfaMethod === m} onChange={() => setMfaMethod(m)} />
                <span>
                  <strong>{t(`register.mfa_${m}`)}</strong>
                  <span className="muted small">{t(`web.mfa_${m}_description`)}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </StepForm>
      ) : null}

      {step === 5 ? (
        <TrustedContactStep
          busy={busy}
          onBack={() => setStep(4)}
          onSkip={() => setStep(6)}
          onSubmit={(contact) =>
            run(async () => {
              unwrap(await api.POST('/api/registration/trusted-contact', { body: { registrationId, ...contact } }));
            })
          }
        />
      ) : null}

      {step === 6 ? (
        <ConsentStep
          busy={busy}
          onBack={() => setStep(5)}
          onSubmit={() =>
            run(async () => {
              const res = unwrap(
                await api.POST('/api/registration/complete', {
                  body: { registrationId, mfaMethod, consents: { terms: true, privacy: true, electronicDelivery: true } },
                }),
              );
              setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
            })
          }
        />
      ) : null}

      {step === 7 ? (
        <div className="form">
          <ul className="tour">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <strong>{t(`onboarding.slide${n}_title`)}</strong>
                <span className="muted small">{t(`onboarding.slide${n}_body`)}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn--primary" onClick={finish}>
            {t('onboarding.get_started')}
          </button>
        </div>
      ) : null}

      {step < 7 ? (
        <p className="auth__switch">
          {t('web.have_online_access')} <Link to="/login">{t('auth.login')}</Link>
        </p>
      ) : null}
    </AuthCard>
  );
}

function StepForm({
  busy,
  onSubmit,
  onBack,
  submitLabel,
  extra,
  children,
}: {
  busy: boolean;
  onSubmit: () => void;
  onBack?: () => void;
  submitLabel?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <form
      className="form"
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {children}
      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? t('common.loading') : (submitLabel ?? t('common.next'))}
        </button>
        {extra}
        {onBack ? (
          <button type="button" className="btn btn--secondary" onClick={onBack} disabled={busy}>
            {t('common.back')}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function CredentialsStep({ busy, onSubmit }: { busy: boolean; onSubmit: (email: string, password: string) => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm.length > 0 && confirm !== password;
  return (
    <StepForm busy={busy} onSubmit={() => !mismatch && onSubmit(email.trim(), password)}>
      <label>
        {t('auth.email')}
        <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
      </label>
      <label>
        {t('auth.password')}
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"
          title={t('web.password_rule')}
          aria-describedby="password-rule"
        />
        <span id="password-rule" className="muted small">
          {t('web.password_rule')}
        </span>
      </label>
      <label>
        {t('web.confirm_password')}
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          aria-invalid={mismatch}
        />
        {mismatch ? <span className="form__hint-error">{t('web.passwords_differ')}</span> : null}
      </label>
    </StepForm>
  );
}

function IdentityStep({
  busy,
  onSubmit,
  onBack,
}: {
  busy: boolean;
  onSubmit: (accountNumber: string, postalCode: string, dateOfBirth: string) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [accountNumber, setAccountNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [dob, setDob] = useState('');
  return (
    <StepForm busy={busy} onBack={onBack} onSubmit={() => onSubmit(accountNumber.trim(), postalCode.trim(), dob)}>
      <label>
        {t('register.account_number')}
        <input inputMode="numeric" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required pattern="\d{10}" title={t('web.account_number_rule')} autoFocus />
      </label>
      <div className="form__row form__row--even">
        <label>
          {t('register.postal_code')}
          <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required autoComplete="postal-code" />
        </label>
        <label>
          {t('register.date_of_birth')}
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required autoComplete="bday" />
        </label>
      </div>
      <p className="notice">{t('web.register_demo_hint')}</p>
    </StepForm>
  );
}

function SecurityQuestionsStep({
  busy,
  clientName,
  questions,
  onSubmit,
  onBack,
}: {
  busy: boolean;
  clientName: string;
  questions: Schemas['SecurityQuestion'][];
  onSubmit: (answers: { questionId: string; answer: string }[]) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const [picks, setPicks] = useState(['q1', 'q2']);
  const [answers, setAnswers] = useState(['', '']);
  const set = <T,>(list: T[], i: number, v: T) => list.map((x, j) => (j === i ? v : x));
  return (
    <StepForm busy={busy} onBack={onBack} onSubmit={() => onSubmit(picks.map((questionId, i) => ({ questionId, answer: answers[i] })))}>
      {clientName ? <p className="notice">{t('web.identity_confirmed', { name: clientName })}</p> : null}
      {[0, 1].map((i) => (
        <div key={i} className="security-question">
          <label>
            {t('web.question_n', { n: i + 1 })}
            <select value={picks[i]} onChange={(e) => setPicks(set(picks, i, e.target.value))}>
              {questions.map((q) => (
                <option key={q.id} value={q.id} disabled={picks[1 - i] === q.id}>
                  {q.text}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">{t('web.answer_n', { n: i + 1 })}</span>
            <input value={answers[i]} onChange={(e) => setAnswers(set(answers, i, e.target.value))} required minLength={2} maxLength={100} placeholder={t('web.answer_placeholder')} />
          </label>
        </div>
      ))}
    </StepForm>
  );
}

function TrustedContactStep({
  busy,
  onSubmit,
  onBack,
  onSkip,
}: {
  busy: boolean;
  onSubmit: (c: { name: string; relationship: string; phone?: string; email?: string }) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  return (
    <StepForm
      busy={busy}
      onBack={onBack}
      onSubmit={() => onSubmit({ name: name.trim(), relationship: relationship.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined })}
      extra={
        <button type="button" className="btn btn--ghost" onClick={onSkip} disabled={busy}>
          {t('common.skip')}
        </button>
      }
    >
      <div className="form__row form__row--even">
        <label>
          {t('register.trusted_name')}
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </label>
        <label>
          {t('register.trusted_relationship')}
          <input value={relationship} onChange={(e) => setRelationship(e.target.value)} required maxLength={40} />
        </label>
      </div>
      <div className="form__row form__row--even">
        <label>
          {t('register.trusted_phone')}
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
        </label>
        <label>
          {t('register.trusted_email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>
    </StepForm>
  );
}

function ConsentStep({ busy, onSubmit, onBack }: { busy: boolean; onSubmit: () => void; onBack: () => void }) {
  const { t } = useTranslation();
  const keys = ['consent_terms', 'consent_privacy', 'consent_electronic'] as const;
  const [checked, setChecked] = useState([false, false, false]);
  return (
    <StepForm busy={busy} onBack={onBack} onSubmit={onSubmit} submitLabel={t('web.create_login')}>
      {keys.map((k, i) => (
        <label key={k} className="checkbox">
          <input type="checkbox" checked={checked[i]} onChange={(e) => setChecked(checked.map((c, j) => (j === i ? e.target.checked : c)))} required />
          <span>{t(`register.${k}`)}</span>
        </label>
      ))}
    </StepForm>
  );
}
