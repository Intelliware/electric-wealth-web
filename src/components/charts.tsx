// Lightweight SVG charts (no chart library, so nothing extra to install).
import { getAppLocale } from '../i18n';
import { formatMoney } from '../lib/format';

const ALLOCATION_COLOURS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)'];

export function AllocationBar({
  segments,
  totalMinor,
  currency,
}: {
  segments: { assetClass: string; pct: number }[];
  totalMinor: number;
  currency: string;
}) {
  const locale = getAppLocale();
  return (
    <div className="allocation">
      <div className="allocation__bar" aria-hidden="true">
        {segments.map((s, i) => (
          <span key={s.assetClass} style={{ width: `${s.pct}%`, background: ALLOCATION_COLOURS[i % ALLOCATION_COLOURS.length] }} />
        ))}
      </div>
      <ul className="allocation__legend">
        {segments.map((s, i) => (
          <li key={s.assetClass}>
            <span className="swatch" style={{ background: ALLOCATION_COLOURS[i % ALLOCATION_COLOURS.length] }} />
            <span className="allocation__label">{s.assetClass}</span>
            <span className="allocation__pct">
              {new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 }).format(s.pct / 100)}
            </span>
            <span className="muted small">{formatMoney(Math.round((totalMinor * s.pct) / 100), currency, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Point = { t: string; v: number };

/** Normalises a series so its first value is 100, so the account and benchmark can share an axis. */
const rebase = (series: Point[]) => {
  const first = series[0]?.v || 1;
  return series.map((p) => ({ t: p.t, v: (p.v / first) * 100 }));
};

export function PerformanceChart({
  series,
  benchmark,
  label,
}: {
  series: Point[];
  benchmark: Point[];
  label: string;
}) {
  const width = 1000;
  const height = 260;
  const pad = 24;
  const a = rebase(series);
  const b = rebase(benchmark);
  const periods = [...new Set([...a, ...b].map((p) => p.t))].sort();
  const values = [...a, ...b].map((p) => p.v);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const x = (t: string) => pad + (periods.indexOf(t) / Math.max(1, periods.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / (max - min || 1)) * (height - pad * 2);
  const path = (pts: Point[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');

  if (a.length === 0) return null;
  return (
    <svg className="perf-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <line x1={pad} x2={width - pad} y1={y(100)} y2={y(100)} className="perf-chart__baseline" />
      <path d={path(b)} className="perf-chart__benchmark" />
      <path d={path(a)} className="perf-chart__series" />
      {a.map((p) => (
        <circle key={p.t} cx={x(p.t)} cy={y(p.v)} r={3.5} className="perf-chart__dot" />
      ))}
      <text x={pad} y={height - 4} className="perf-chart__axis">
        {periods[0]}
      </text>
      <text x={width - pad} y={height - 4} textAnchor="end" className="perf-chart__axis">
        {periods[periods.length - 1]}
      </text>
    </svg>
  );
}
