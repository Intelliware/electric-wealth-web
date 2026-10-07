import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useAdvisorAvailability, useAdvisorMessages, useSendAdvisorMessage } from '../../api/hooks';
import { Card, ErrorState, Loading, PageHeader } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatDateTime } from '../../lib/format';

export function AdvisorMessagesPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data, isLoading, error, refetch } = useAdvisorMessages();
  const { data: availability } = useAdvisorAvailability();
  const send = useSendAdvisorMessage();
  const [text, setText] = useState('');
  const end = useRef<HTMLLIElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [data?.length]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    send.mutate(text.trim(), { onSuccess: () => setText('') });
  };

  const advisorName = availability?.advisor.name;

  return (
    <>
      <p className="breadcrumb">
        <Link to="/advisor">← {t('advisor.advisor_name')}</Link>
      </p>
      <PageHeader eyebrow={t('advisor.secure_channel')} title={advisorName ?? t('advisor.messages_title')} />
      <p className="notice" style={{ marginBottom: 16 }}>
        {t('advisor.portfolio_context')}
      </p>

      <Card>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : (
          <ol className="thread" aria-label={t('advisor.messages_title')}>
            {data?.map((m) => (
              <li key={m.id} className={`bubble bubble--${m.from}`}>
                <span className="sr-only">{m.from === 'client' ? t('web.you') : advisorName}: </span>
                <p>{m.text}</p>
                <time className="bubble__time" dateTime={m.at}>
                  {formatDateTime(m.at, locale)}
                </time>
              </li>
            ))}
            <li ref={end} aria-hidden="true" />
          </ol>
        )}

        <form className="composer" onSubmit={onSubmit}>
          <label className="composer__input">
            <span className="sr-only">{t('advisor.compose_placeholder')}</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('advisor.compose_placeholder')}
              maxLength={2000}
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={!text.trim() || send.isPending}>
            {t('advisor.send')}
          </button>
        </form>
        {send.error ? (
          <p className="form__error" role="alert">
            {t('common.error_generic')}
          </p>
        ) : null}
      </Card>
    </>
  );
}
