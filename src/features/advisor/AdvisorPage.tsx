import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { ApiError, type Schemas } from '../../api/client';
import {
  useAdvisorAvailability,
  useAppointments,
  useBookAppointment,
  usePreferences,
  useUpdateAppointment,
} from '../../api/hooks';
import { Card, EmptyState, ErrorState, Loading, PageHeader, SectionTitle, Segmented, Tag } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatDayParts, formatSlotTime, initials } from '../../lib/format';

type MeetingType = Schemas['MeetingType'];
type Appointment = Schemas['Appointment'];

const MEETING_LABEL: Record<MeetingType, string> = {
  video: 'advisor.meeting_video',
  phone: 'advisor.meeting_phone',
  in_person: 'advisor.meeting_in_person',
};

export function AdvisorPage() {
  const { t } = useTranslation();
  const availability = useAdvisorAvailability();
  const appointments = useAppointments();
  const [rescheduling, setRescheduling] = useState<Appointment | null>(null);

  if (availability.isLoading) return <Loading />;
  if (availability.error || !availability.data) {
    return <ErrorState error={availability.error} onRetry={() => void availability.refetch()} />;
  }
  const { advisor } = availability.data;
  const upcoming = appointments.data?.filter((a) => a.status === 'scheduled') ?? [];
  const past = appointments.data?.filter((a) => a.status !== 'scheduled').reverse() ?? [];

  return (
    <>
      <PageHeader title={t('advisor.advisor_name')} />

      <Card className="advisor-card">
        <span className="avatar avatar--lg" aria-hidden="true">
          {initials(advisor.name)}
        </span>
        <div>
          <p className="advisor-card__name">
            {advisor.name}
            {advisor.designation ? `, ${advisor.designation}` : ''}
          </p>
          <p className="muted small">{advisor.available ? t('advisor.dedicated_available') : t('advisor.advisor_name')}</p>
        </div>
        <Link to="/advisor/messages" className="btn btn--secondary">
          {t('web.message_advisor', { name: advisor.name.split(' ')[0] })}
        </Link>
      </Card>

      <div className="grid grid--2 advisor-layout">
        <section>
          <SectionTitle>{rescheduling ? t('advisor.reschedule') : t('advisor.book')}</SectionTitle>
          <BookingPanel
            key={rescheduling?.id ?? 'new'}
            days={availability.data.days}
            meetingTypes={availability.data.meetingTypes}
            rescheduling={rescheduling}
            onDone={() => setRescheduling(null)}
          />
        </section>

        <section>
          <SectionTitle>{t('web.upcoming_meetings')}</SectionTitle>
          <Card>
            {appointments.isLoading ? (
              <Loading />
            ) : appointments.error ? (
              <ErrorState error={appointments.error} onRetry={() => void appointments.refetch()} />
            ) : upcoming.length === 0 ? (
              <EmptyState title={t('web.no_upcoming_meetings')} />
            ) : (
              <ul className="meeting-list">
                {upcoming.map((a) => (
                  <MeetingRow key={a.id} appointment={a} onReschedule={() => setRescheduling(a)} />
                ))}
              </ul>
            )}
          </Card>

          {past.length ? (
            <>
              <SectionTitle>{t('web.past_meetings')}</SectionTitle>
              <Card>
                <ul className="meeting-list">
                  {past.map((a) => (
                    <MeetingRow key={a.id} appointment={a} />
                  ))}
                </ul>
              </Card>
            </>
          ) : null}
        </section>
      </div>
    </>
  );
}

function MeetingRow({ appointment: a, onReschedule }: { appointment: Appointment; onReschedule?: () => void }) {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const update = useUpdateAppointment();

  const cancel = () => {
    if (window.confirm(t('web.cancel_meeting_confirm'))) update.mutate({ id: a.id, status: 'cancelled' });
  };

  return (
    <li className="meeting">
      <div>
        <p className="meeting__when">
          {formatDayParts(a.date, locale).full} · {formatSlotTime(a.time, locale)}
        </p>
        <div className="tags">
          <Tag tone="info">{t(MEETING_LABEL[a.meetingType])}</Tag>
          {a.status !== 'scheduled' ? <Tag tone={a.status === 'completed' ? 'success' : 'neutral'}>{t(`web.meeting_status_${a.status}`)}</Tag> : null}
        </div>
        {a.notes ? <p className="muted small">{a.notes}</p> : null}
      </div>
      {onReschedule ? (
        <div className="meeting__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onReschedule}>
            {t('advisor.reschedule')}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={cancel} disabled={update.isPending}>
            {t('web.cancel_meeting')}
          </button>
        </div>
      ) : null}
    </li>
  );
}

function BookingPanel({
  days,
  meetingTypes,
  rescheduling,
  onDone,
}: {
  days: Schemas['AvailabilityDay'][];
  meetingTypes: MeetingType[];
  rescheduling: Appointment | null;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data: prefs } = usePreferences();
  const book = useBookAppointment();
  const update = useUpdateAppointment();
  const mutation = rescheduling ? update : book;

  const [meetingType, setMeetingType] = useState<MeetingType>(rescheduling?.meetingType ?? prefs?.defaultMeetingType ?? 'video');
  const [date, setDate] = useState(days.find((d) => d.slots.length)?.date ?? days[0]?.date ?? '');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  // Use the saved default meeting type once preferences arrive (new bookings only).
  useEffect(() => {
    if (!rescheduling && prefs?.defaultMeetingType) setMeetingType(prefs.defaultMeetingType);
  }, [prefs?.defaultMeetingType, rescheduling]);

  const day = days.find((d) => d.date === date);
  const slotGone = mutation.error instanceof ApiError && mutation.error.code === 'SLOT_UNAVAILABLE';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const onSuccess = (appointment: Appointment) => {
      setConfirmed(appointment);
      setTime('');
      setNotes('');
    };
    if (rescheduling) update.mutate({ id: rescheduling.id, date, time }, { onSuccess });
    else book.mutate({ meetingType, date, time, notes: notes || undefined }, { onSuccess });
  };

  if (confirmed) {
    return (
      <Card>
        <p className="notice" role="status">
          <strong>{t('advisor.booked_title')}</strong>
          <br />
          {t(MEETING_LABEL[confirmed.meetingType])} · {formatDayParts(confirmed.date, locale).full} · {formatSlotTime(confirmed.time, locale)}
        </p>
        <p className="muted small" style={{ margin: '12px 0' }}>
          {t('advisor.confirm_reminder')}
        </p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setConfirmed(null);
            onDone();
          }}
        >
          {t('common.done')}
        </button>
      </Card>
    );
  }

  return (
    <Card>
      <form className="form booking" onSubmit={onSubmit}>
        {rescheduling ? (
          <p className="muted small">
            {t('web.rescheduling_from', {
              when: `${formatDayParts(rescheduling.date, locale).full} · ${formatSlotTime(rescheduling.time, locale)}`,
            })}
          </p>
        ) : (
          <div className="booking__field">
            <span className="booking__label">{t('advisor.meeting_type')}</span>
            <Segmented<MeetingType>
              label={t('advisor.meeting_type')}
              value={meetingType}
              onChange={setMeetingType}
              options={meetingTypes.map((id) => ({ id, label: t(MEETING_LABEL[id]) }))}
            />
          </div>
        )}

        <div className="booking__field">
          <span className="booking__label">{t('advisor.select_day')}</span>
          <div className="day-picker" role="group" aria-label={t('advisor.select_day')}>
            {days.map((d) => {
              const parts = formatDayParts(d.date, locale);
              return (
                <button
                  key={d.date}
                  type="button"
                  className={d.date === date ? 'is-active' : ''}
                  aria-pressed={d.date === date}
                  aria-label={parts.full}
                  disabled={!d.slots.length}
                  onClick={() => {
                    setDate(d.date);
                    setTime('');
                  }}
                >
                  <span className="small">{parts.weekday}</span>
                  <strong>{parts.day}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <div className="booking__field">
          <span className="booking__label">{t('advisor.select_slot')}</span>
          {day?.slots.length ? (
            <div className="slot-picker" role="group" aria-label={t('advisor.select_slot')}>
              {day.slots.map((slot) => (
                <button key={slot} type="button" className={slot === time ? 'is-active' : ''} aria-pressed={slot === time} onClick={() => setTime(slot)}>
                  {formatSlotTime(slot, locale)}
                </button>
              ))}
            </div>
          ) : (
            <p className="muted small">{t('web.no_slots')}</p>
          )}
        </div>

        {rescheduling ? null : (
          <label>
            {t('web.meeting_notes')}
            <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={500} placeholder={t('web.meeting_notes_placeholder')} />
          </label>
        )}

        {mutation.error ? (
          <p className="form__error" role="alert">
            {slotGone ? t('web.slot_taken') : t('common.error_generic')}
          </p>
        ) : null}

        <div className="form__actions">
          <button type="submit" className="btn btn--primary" disabled={!time || mutation.isPending}>
            {time
              ? rescheduling
                ? t('web.reschedule_to', { time: formatSlotTime(time, locale) })
                : t('advisor.book_label', { type: t(MEETING_LABEL[meetingType]), time: formatSlotTime(time, locale) })
              : t('advisor.select_time')}
          </button>
          {rescheduling ? (
            <button type="button" className="btn btn--secondary" onClick={onDone}>
              {t('common.cancel')}
            </button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
