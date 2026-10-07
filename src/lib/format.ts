// Formatting helpers, ported from the mobile app (mobile/src/lib/format).
// Money from the API is always an integer in minor units (cents).

export function formatMoney(minorUnits: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minorUnits / 100);
}

/** `value` is a percentage number, e.g. 0.65 means 0.65 %. */
export function formatPercent(value: number, locale: string, digits = 2): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: 'exceptZero',
  }).format(value / 100);
}

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
}

export function formatBytes(bytes: number, locale: string): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)} ${units[unit]}`;
}

export type ChangeDirection = 'up' | 'down' | 'flat';

export function changeDirection(value: number): ChangeDirection {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

export function changeGlyph(value: number): string {
  return { up: '▲', down: '▼', flat: '—' }[changeDirection(value)];
}

export function initials(name?: string): string {
  return (name ?? '')
    .split(' ')
    .filter((part) => /\p{L}/u.test(part[0] ?? ''))
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

/** A 24h slot time ('14:30') shown in the user's locale (2:30 p.m. / 14 h 30). */
export function formatSlotTime(time: string, locale: string): string {
  const [h, m] = time.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2000, 0, 1, h, m)),
  );
}

/** A calendar date ('2026-10-12') as a short weekday + day, e.g. Mon 12. */
export function formatDayParts(date: string, locale: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return {
    weekday: new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(d),
    day: d.getUTCDate(),
    full: new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(d),
  };
}
