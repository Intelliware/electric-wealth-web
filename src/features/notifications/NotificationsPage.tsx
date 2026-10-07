import { useTranslation } from 'react-i18next';
import type { Schemas } from '../../api/client';
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../../api/hooks';
import { Card, EmptyState, ErrorState, Loading, PageHeader, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatDateTime } from '../../lib/format';

type NotificationType = Schemas['NotificationType'];

const TYPE_TONE: Record<NotificationType, 'warning' | 'success' | 'info'> = {
  ACTION_REQUIRED: 'warning',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info',
};

const TYPE_LABEL_KEY: Record<NotificationType, string> = {
  ACTION_REQUIRED: 'notifications.type_action',
  WARNING: 'notifications.type_warning',
  SUCCESS: 'notifications.type_success',
  INFO: 'notifications.type_info',
};

export function NotificationsPage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data, isLoading, error, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unread = data?.filter((n) => !n.read).length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={unread ? t('web.unread_count', { count: unread }) : undefined}
        title={t('notifications.title')}
        actions={
          unread ? (
            <button type="button" className="btn btn--secondary" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
              {t('notifications.mark_all_read')}
            </button>
          ) : null
        }
      />

      <Card>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : !data?.length ? (
          <EmptyState title={t('notifications.empty_title')} body={t('notifications.empty_body')} />
        ) : (
          <ul className="notification-list">
            {data.map((n) => (
              <li key={n.id} className={`notification ${n.read ? '' : 'is-unread'}`}>
                <span className={`notification__dot notification__dot--${TYPE_TONE[n.type]}`} aria-hidden="true" />
                <div className="notification__main">
                  <p className="notification__title">
                    {n.title}
                    {!n.read ? <span className="sr-only"> ({t('notifications.unread')})</span> : null}
                  </p>
                  <p className="muted">{n.body}</p>
                  <div className="tags">
                    <Tag tone={TYPE_TONE[n.type]}>{t(TYPE_LABEL_KEY[n.type])}</Tag>
                    <time className="muted small" dateTime={n.createdAt}>
                      {formatDateTime(n.createdAt, locale)}
                    </time>
                  </div>
                </div>
                {!n.read ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => markRead.mutate(n.id)}
                    disabled={markRead.isPending && markRead.variables === n.id}
                  >
                    {t('notifications.mark_read')}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
