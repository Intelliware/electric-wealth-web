import { useTranslation } from 'react-i18next';
import type { Schemas } from '../../api/client';
import { usePreferences, useUpdatePreferences } from '../../api/hooks';
import { Card, ErrorState, Loading, PageHeader, Segmented, SectionTitle } from '../../components/ui';
import { setAppLocale } from '../../i18n';

type Preferences = Schemas['PreferencesResponse'];
type NotificationChannel = keyof Preferences['notifications'];

const CHANNELS: NotificationChannel[] = ['email', 'sms', 'push'];

export function SettingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = usePreferences();
  const update = useUpdatePreferences();

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  // The theme is applied by the Layout from the cached preferences, which the mutation updates.
  const save = (change: Schemas['PreferencesUpdate']) => update.mutate(change);

  const setLanguage = (language: Preferences['language']) => {
    void setAppLocale(language);
    save({ language });
  };

  return (
    <>
      <PageHeader title={t('settings.title')} />

      <div className="grid grid--2">
        <Card>
          <SectionTitle>{t('settings.appearance')}</SectionTitle>
          <div className="setting">
            <span>{t('settings.theme')}</span>
            <Segmented<Preferences['theme']>
              label={t('settings.theme')}
              value={data.theme}
              onChange={(theme) => save({ theme })}
              options={[
                { id: 'light', label: t('settings.theme_light') },
                { id: 'dark', label: t('settings.theme_dark') },
                { id: 'system', label: t('settings.theme_system') },
              ]}
            />
          </div>
          <div className="setting">
            <span>{t('settings.language')}</span>
            <Segmented<Preferences['language']>
              label={t('settings.language')}
              value={data.language}
              onChange={setLanguage}
              options={[
                { id: 'en-CA', label: t('settings.language_en') },
                { id: 'fr-CA', label: t('settings.language_fr') },
              ]}
            />
          </div>
        </Card>

        <Card>
          <SectionTitle>{t('settings.notifications')}</SectionTitle>
          {CHANNELS.map((channel) => (
            <label key={channel} className="setting setting--toggle">
              <span>{t(`settings.notify_${channel}`)}</span>
              <input
                type="checkbox"
                role="switch"
                className="switch"
                checked={data.notifications[channel]}
                onChange={(e) => save({ notifications: { [channel]: e.target.checked } })}
              />
            </label>
          ))}
        </Card>

        <Card>
          <SectionTitle>{t('settings.document_delivery')}</SectionTitle>
          <Segmented<Preferences['documentDelivery']>
            label={t('settings.document_delivery')}
            value={data.documentDelivery}
            onChange={(documentDelivery) => save({ documentDelivery })}
            options={[
              { id: 'digital', label: t('settings.delivery_digital') },
              { id: 'paper_and_digital', label: t('settings.delivery_both') },
            ]}
          />
        </Card>

        <Card>
          <SectionTitle>{t('settings.default_meeting')}</SectionTitle>
          <Segmented<Preferences['defaultMeetingType']>
            label={t('settings.default_meeting')}
            value={data.defaultMeetingType}
            onChange={(defaultMeetingType) => save({ defaultMeetingType })}
            options={[
              { id: 'video', label: t('advisor.meeting_video') },
              { id: 'phone', label: t('advisor.meeting_phone') },
              { id: 'in_person', label: t('advisor.meeting_in_person') },
            ]}
          />
        </Card>
      </div>

      <p className="muted small settings-status" role="status" aria-live="polite">
        {update.isPending ? t('settings.saving') : update.isError ? t('common.error_generic') : update.isSuccess ? t('settings.saved') : ''}
      </p>
    </>
  );
}
