import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

/* Colours are literal hex rather than CSS variables: global.css has no custom
   properties by design, and SVG presentation attributes cannot parse var()
   anyway. Validated for colour-blind separation against the #151515 card
   surface — worst-pair dE 36.7 normal, 27.6 protan. */
const YOUTUBE = "#FF4D00";
const INSTAGRAM = "#3987e5";

const GRID = "#232323";
const MUTED = "#A0A0A0";
const SURFACE = "#151515";

/* One decimal place, because a fitted axis over a slow-moving counter puts
   ticks close together — at zero decimals 39,500 and 39,800 both render as
   "40K" and the axis reads as though it repeats itself. */
const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const full = new Intl.NumberFormat("en-US");

function formatDay(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", timeZone: "UTC",
  });
}

const tickStyle = {
  fill: MUTED,
  fontSize: 10,
  fontFamily: "'JetBrains Mono', monospace",
};

function ChartTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="dash-tip">
      <p className="dash-tip-day">{formatDay(String(label))}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="dash-tip-row">
          <span
            className="dash-chip"
            aria-hidden="true"
            style={{ background: entry.stroke }}
          />
          <span>{entry.name}</span>
          <span className="dash-tip-value">
            {unit === "percent"
              ? `${Number(entry.value || 0).toFixed(2)}%`
              : full.format(Number(entry.value || 0))}
          </span>
        </p>
      ))}
    </div>
  );
}

/**
 * One chart. Views and engagement are different measures, and the two
 * platforms count views differently, so each gets its own plot on its own
 * scale rather than sharing a y-axis with anything else.
 */
function TrendChart({ title, note, data, series, unit }) {
  const hasData = data.some((d) =>
    series.some((s) => d[s.key] !== null && d[s.key] !== undefined)
  );

  return (
    <div className="dash-chart">
      <div className="dash-chart-head">
        <div>
          <h2 className="dash-chart-title">{title}</h2>
          <p className="dash-chart-note">{note}</p>
        </div>
        <div className="dash-legend">
          {series.map((s) => (
            <span key={s.key} className="dash-legend-item">
              <span
                className="dash-chip"
                aria-hidden="true"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="dash-chart-empty">
          <p className="portal-placeholder-text">Nothing recorded yet</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={230}>
          {/* The right margin holds the last x-axis label, which centres on the
              final point and would otherwise be clipped by the card edge. */}
          <LineChart data={data} margin={{ top: 8, right: 30, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDay}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              tick={tickStyle}
              minTickGap={24}
            />
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              tick={tickStyle}
              /* Fitted to the data rather than anchored at zero. A lifetime
                 view counter sits far from zero and barely moves week to week,
                 so a zero baseline renders it as a dead flat line. Lines encode
                 position and slope, not length, so a non-zero baseline is not
                 the distortion it would be on a bar chart. */
              domain={["auto", "auto"]}
              tickFormatter={(v) =>
                unit === "percent" ? `${v.toFixed(1)}%` : compact.format(v)
              }
            />
            <Tooltip
              cursor={{ stroke: MUTED, strokeWidth: 1 }}
              content={<ChartTooltip unit={unit} />}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                connectNulls
                // 2px surface ring keeps overlapping points readable.
                activeDot={{ r: 4, strokeWidth: 2, stroke: SURFACE }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

/* The WCAG-clean twin: every plotted value is also readable as text. */
function TableView({ data }) {
  if (data.length === 0) return null;

  return (
    <details className="dash-table-wrap">
      <summary className="dash-table-toggle">View as table</summary>
      <div className="dash-table-scroll">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>YT views</th>
              <th>IG views</th>
              <th>YT eng.</th>
              <th>IG eng.</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((row) => (
              <tr key={row.date}>
                <td>{formatDay(row.date)}</td>
                <td>{row.youtubeViews === null ? "—" : full.format(row.youtubeViews)}</td>
                <td>{row.instagramViews === null ? "—" : full.format(row.instagramViews)}</td>
                <td>{row.youtubeEngagement === null ? "—" : `${row.youtubeEngagement.toFixed(2)}%`}</td>
                <td>{row.instagramEngagement === null ? "—" : `${row.instagramEngagement.toFixed(2)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export default function ContentCharts({ data, days }) {
  return (
    <div className="dash-charts">
      {/* YouTube's total is a lifetime counter and Instagram's is a rolling
          window over recent posts. They are not the same measure, so they do
          not share a plot — one axis each, each honestly titled. */}
      <TrendChart
        title="YouTube Views"
        note={`Lifetime channel views, last ${days} days`}
        data={data}
        unit="views"
        series={[{ key: "youtubeViews", label: "YouTube", color: YOUTUBE }]}
      />
      <TrendChart
        title="Instagram Views"
        note="Views across recent posts"
        data={data}
        unit="views"
        series={[{ key: "instagramViews", label: "Instagram", color: INSTAGRAM }]}
      />
      {/* Engagement is a normalised percentage on both platforms, so here a
          shared axis is a fair comparison. */}
      <TrendChart
        title="Engagement Rate"
        note="Interactions per view on recent posts"
        data={data}
        unit="percent"
        series={[
          { key: "youtubeEngagement", label: "YouTube", color: YOUTUBE },
          { key: "instagramEngagement", label: "Instagram", color: INSTAGRAM },
        ]}
      />
      <TableView data={data} />
    </div>
  );
}
