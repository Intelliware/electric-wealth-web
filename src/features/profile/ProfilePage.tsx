import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError, type Schemas } from '../../api/client';
import { useProfile, useUpdateAddress } from '../../api/hooks';
import { Card, ErrorState, Loading, PageHeader, SectionTitle } from '../../components/ui';
import { getAppLocale } from '../../i18n';
import { formatDate } from '../../lib/format';

type Province = Schemas['Province'];
type Address = Schemas['ProfileResponse']['address'];

const PROVINCES: Province[] = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'];

export function ProfilePage() {
  const { t } = useTranslation();
  const locale = getAppLocale();
  const { data, isLoading, error, refetch } = useProfile();
  const [editing, setEditing] = useState(false);

  if (isLoading) return <Loading />;
  if (error || !data) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <>
      <PageHeader eyebrow={t('profile.member_since', { year: data.memberSince })} title={t('profile.title')} />

      <div className="grid grid--2">
        <Card>
          <SectionTitle>{t('profile.personal_details')}</SectionTitle>
          <dl className="facts">
            <div>
              <dt>{t('profile.name')}</dt>
              <dd>{data.name}</dd>
            </div>
            <div>
              <dt>{t('profile.email')}</dt>
              <dd>{data.email}</dd>
            </div>
            <div>
              <dt>{t('profile.phone')}</dt>
              <dd>{data.phoneMasked}</dd>
            </div>
            <div>
              <dt>{t('register.date_of_birth')}</dt>
              <dd>{formatDate(data.dateOfBirth, locale)}</dd>
            </div>
            {data.sinMasked ? (
              <div>
                <dt>{t('profile.sin')}</dt>
                <dd>{data.sinMasked}</dd>
              </div>
            ) : null}
          </dl>
          <p className="muted small">{t('profile.contact_to_change')}</p>
        </Card>

        <Card>
          <SectionTitle
            action={
              editing ? null : (
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>
                  {t('profile.edit_address')}
                </button>
              )
            }
          >
            {t('profile.address')}
          </SectionTitle>
          {editing ? (
            <AddressForm address={data.address} onDone={() => setEditing(false)} />
          ) : (
            <address className="address">
              {data.address.line1}
              {data.address.line2 ? <br /> : null}
              {data.address.line2}
              <br />
              {data.address.city}, {data.address.province} {data.address.postalCode}
              <br />
              {data.address.country}
            </address>
          )}
        </Card>

        <Card>
          <SectionTitle>{t('profile.trusted_contact')}</SectionTitle>
          {data.trustedContact ? (
            <dl className="facts">
              <div>
                <dt>{t('register.trusted_name')}</dt>
                <dd>{data.trustedContact.name}</dd>
              </div>
              <div>
                <dt>{t('register.trusted_relationship')}</dt>
                <dd>{data.trustedContact.relationship}</dd>
              </div>
            </dl>
          ) : (
            <p className="muted">{t('profile.no_trusted_contact')}</p>
          )}
        </Card>
      </div>
    </>
  );
}

function AddressForm({ address, onDone }: { address: Address; onDone: () => void }) {
  const { t } = useTranslation();
  const update = useUpdateAddress();
  const [line1, setLine1] = useState(address.line1);
  const [line2, setLine2] = useState(address.line2 ?? '');
  const [city, setCity] = useState(address.city);
  const [province, setProvince] = useState<Province>(
    PROVINCES.includes(address.province as Province) ? (address.province as Province) : 'ON',
  );
  const [postalCode, setPostalCode] = useState(address.postalCode);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    update.mutate(
      { address: { line1, line2: line2 || undefined, city, province, postalCode, country: 'Canada' } },
      { onSuccess: onDone },
    );
  };

  const invalid = update.error instanceof ApiError && update.error.code === 'VALIDATION_ERROR';

  return (
    <form className="form" onSubmit={onSubmit}>
      <label>
        {t('profile.line1')}
        <input value={line1} onChange={(e) => setLine1(e.target.value)} required maxLength={100} autoComplete="address-line1" />
      </label>
      <label>
        {t('profile.line2')}
        <input value={line2} onChange={(e) => setLine2(e.target.value)} maxLength={100} autoComplete="address-line2" />
      </label>
      <div className="form__row">
        <label>
          {t('profile.city')}
          <input value={city} onChange={(e) => setCity(e.target.value)} required maxLength={60} autoComplete="address-level2" />
        </label>
        <label>
          {t('profile.province')}
          <select value={province} onChange={(e) => setProvince(e.target.value as Province)} autoComplete="address-level1">
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {t(`profile.provinces.${p}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('register.postal_code')}
          <input
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            pattern="[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d"
            title={t('profile.postal_code_hint')}
            autoComplete="postal-code"
          />
        </label>
      </div>
      {update.error ? (
        <p className="form__error" role="alert">
          {invalid ? t('profile.address_invalid') : t('common.error_generic')}
        </p>
      ) : null}
      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={update.isPending}>
          {t('common.save')}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onDone} disabled={update.isPending}>
          {t('common.cancel')}
        </button>
      </div>
    </form>
  );
}
