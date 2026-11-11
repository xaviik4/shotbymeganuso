import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OperationsLayout from "../components/OperationsLayout";
import { useAuth } from "../context/AuthContext";
import { opsApi } from "../lib/ops-api";

const number = new Intl.NumberFormat("en-US");
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function dateLabel(value, options = { month: "short", day: "numeric" }) {
  if (!value) return "Not scheduled";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? "Not scheduled" : new Intl.DateTimeFormat("en-US", { ...options, timeZone: "America/Los_Angeles" }).format(date);
}

function Metric({ label, value, note, accent }) {
  return <article className={`ops-metric${accent ? " is-accent" : ""}`}><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>;
}

export default function Dashboard() {
  const { session } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    opsApi("/api/ops/dashboard", session.access_token)
      .then((result) => { if (!cancelled) setData(result); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [session.access_token]);

  const week = data?.weekly;
  const weekEnd = data?.week?.start
    ? new Date(new Date(`${data.week.start}T12:00:00Z`).getTime() + 6 * 86400000)
    : null;
  return (
    <OperationsLayout active="dashboard">
      <main className="ops-page">
        <header className="ops-page-head">
          <div><p className="ops-eyebrow">Overview · {data ? `${dateLabel(data.week.start)} – ${dateLabel(weekEnd?.toISOString())}` : "This week"}</p><h1>Dashboard</h1><p className="ops-subtitle">Weekly activity and the next work to move forward.</p></div>
          <Link className="ops-button btn-primary" to="/dashboard/pipeline">Open pipeline <span aria-hidden="true">→</span></Link>
        </header>
        {error && <div className="ops-alert" role="alert">{error}</div>}
        {loading ? <p className="ops-loading" role="status">Loading dashboard…</p> : data && (
          <>
            <section className="ops-metrics" aria-label="This week's activity">
              <Metric label="Messages sent" value={number.format(week.messages_sent)} />
              <Metric label="Replies" value={number.format(week.replies)} note={`${week.reply_rate}% reply rate · target ${week.targets.reply_rate}`} />
              <Metric label="Calls booked" value={number.format(week.calls_booked)} note={`${week.booked_rate}% of interested · target ${week.targets.booked_rate}`} />
              <Metric label="Calls held" value={number.format(week.calls_held)} note={`${week.show_rate}% show rate · target ${week.targets.show_rate}`} />
              <Metric label="Clients signed" value={number.format(week.clients_signed)} />
            </section>
            <section className="ops-metrics ops-metrics-secondary" aria-label="Client revenue">
              <Metric label="Active clients" value={number.format(data.active_clients)} />
              <Metric label="Monthly recurring revenue" value={money.format(data.monthly_recurring_revenue)} accent />
            </section>
            <div className="ops-dashboard-grid">
              <section className="ops-panel">
                <div className="ops-panel-head"><div><p className="ops-eyebrow">Needs attention</p><h2>Follow-ups due today</h2></div><Link to="/dashboard/pipeline">View all →</Link></div>
                {data.follow_ups_due.length ? <div className="ops-list">
                  {data.follow_ups_due.slice(0, 8).map((prospect) => <Link className={`ops-list-row${prospect.is_overdue ? " is-overdue" : ""}`} to="/dashboard/pipeline" key={prospect.id}>
                    <span><strong>{prospect.name}</strong><small>{prospect.brokerage || prospect.area} · {prospect.status}</small></span><time>{prospect.is_overdue ? "Overdue" : "Today"}</time>
                  </Link>)}
                </div> : <p className="ops-empty">You’re all caught up.</p>}
              </section>
              <section className="ops-panel">
                <div className="ops-panel-head"><div><p className="ops-eyebrow">On the calendar</p><h2>Upcoming calls</h2></div><Link to="/dashboard/pipeline">Pipeline →</Link></div>
                {data.upcoming_calls.length ? <div className="ops-list">
                  {data.upcoming_calls.slice(0, 8).map((prospect) => <div className="ops-list-row" key={prospect.id}>
                    <span><strong>{prospect.name}</strong><small>{prospect.brokerage || prospect.area}</small></span><time>{dateLabel(prospect.call_at, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
                  </div>)}
                </div> : <p className="ops-empty">No booked calls yet.</p>}
              </section>
              <section className="ops-panel ops-versions-panel">
                <div className="ops-panel-head"><div><p className="ops-eyebrow">Outreach</p><h2>Message version results</h2></div><Link to="/dashboard/pipeline">Review pipeline →</Link></div>
                <div className="ops-version-grid">{data.message_versions.map((version) => <div className="ops-version" key={version.version}>
                  <strong>{version.version}</strong><span>{number.format(version.sent)} sent</span><span>{version.reply_rate}% replies</span><small className={version.ready_to_judge ? "ready" : ""}>{version.ready_to_judge ? "Ready to judge" : `${Math.max(0, 100 - version.sent)} until ready`}</small>
                </div>)}</div>
              </section>
            </div>
          </>
        )}
      </main>
    </OperationsLayout>
  );
}
