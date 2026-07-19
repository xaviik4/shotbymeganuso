import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import AuthedNav from "../components/AuthedNav";
import { useAuth } from "../context/AuthContext";
import {
  fetchAccessibleAccountId, fetchTrend, fetchLatest, requestSync, TREND_DAYS,
} from "../lib/content";

/* Recharts is ~100KB and the marketing home page shares this bundle, so the
   charts load on their own chunk when the dashboard actually mounts. */
const ContentCharts = lazy(() => import("../components/ContentCharts"));

const PLATFORMS = [
  { key: "youtube", label: "YouTube", color: "#FF4D00" },
  { key: "instagram", label: "Instagram", color: "#3987e5" },
];

const full = new Intl.NumberFormat("en-US");

export default function Dashboard() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [accountId, setAccountId] = useState(null);
  const [latest, setLatest] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState([]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const id = await fetchAccessibleAccountId(userId);
      const [latestRows, trendRows] = await Promise.all([
        fetchLatest(id),
        fetchTrend(id),
      ]);
      setAccountId(id);
      setLatest(latestRows);
      setTrend(trendRows);
    } catch (err) {
      setError(err.message || "Could not load your stats.");
    } finally {
      // Always clears, so a failure shows the error instead of hanging on
      // "Loading" forever.
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  async function handleSync() {
    setError("");
    setNotes([]);
    setSyncing(true);
    try {
      const results = await requestSync(session.access_token);
      setNotes(
        results
          .filter((r) => r.status !== "ok")
          .map((r) => `${r.label || r.platform}: ${r.error || r.reason}`)
      );
      await load();
    } catch (err) {
      setError(err.message || "Could not refresh.");
    } finally {
      setSyncing(false);
    }
  }

  const totals = useMemo(() => ({
    followers: latest.reduce((sum, p) => sum + p.followers, 0),
    views: latest.reduce((sum, p) => sum + p.totalViews, 0),
  }), [latest]);

  const lastSynced = useMemo(() => {
    const stamps = latest.map((p) => p.syncedAt).filter(Boolean);
    return stamps.length ? new Date(Math.max(...stamps.map((s) => new Date(s)))) : null;
  }, [latest]);

  /* You are the owner unless you are here through a viewer grant. The server
     is the real authority — /api/sync returns 403 to anyone without a
     content_accounts row — so this only decides whether to render a button
     that would fail. */
  const isOwner = accountId !== null && accountId === userId;

  return (
    <div className="portal-page">
      <AuthedNav />

      <main className="portal-body dash-body">
        <p className="portal-label">Content Performance</p>

        <div className="dash-head">
          <div>
            <h1 className="portal-title">Dashboard</h1>
            <p className="dash-synced">
              {lastSynced
                ? `Last synced ${lastSynced.toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric",
                  })}`
                : "No snapshots recorded yet"}
            </p>
          </div>

          {isOwner && (
            <button
              className="dash-refresh"
              onClick={handleSync}
              disabled={syncing || loading}
            >
              {syncing ? "Syncing..." : "Refresh Stats"}
            </button>
          )}
        </div>

        {error && <div className="track-error" role="alert">{error}</div>}

        {notes.length > 0 && (
          <div className="dash-notes" role="status">
            {notes.map((note) => <p key={note}>{note}</p>)}
          </div>
        )}

        {loading ? (
          <p className="track-loading">Loading your stats...</p>
        ) : latest.length === 0 ? (
          <div className="portal-placeholder">
            <p className="portal-placeholder-text">
              {isOwner
                ? "No data yet — hit Refresh Stats to record the first snapshot"
                : "No stats have been shared with you yet"}
            </p>
          </div>
        ) : (
          <>
            <div className="dash-tiles">
              <StatTile
                label="Combined Followers"
                value={full.format(totals.followers)}
                rows={latest.map((p) => ({
                  platform: p.platform, value: full.format(p.followers),
                }))}
              />
              <StatTile
                label="Combined Views"
                value={full.format(totals.views)}
                rows={latest.map((p) => ({
                  platform: p.platform, value: full.format(p.totalViews),
                }))}
                accent
              />
              <StatTile
                label="Engagement Rate"
                value={`${(
                  latest.reduce((s, p) => s + p.engagementRate, 0) / latest.length
                ).toFixed(2)}%`}
                rows={latest.map((p) => ({
                  platform: p.platform, value: `${p.engagementRate.toFixed(2)}%`,
                }))}
              />
            </div>

            <Suspense
              fallback={<p className="track-loading">Loading charts...</p>}
            >
              <ContentCharts data={trend} days={TREND_DAYS} />
            </Suspense>
          </>
        )}
      </main>
    </div>
  );
}

/* One number is a stat tile, not a chart. */
function StatTile({ label, value, rows, accent }) {
  return (
    <div className={`track-dial${accent ? " is-accent" : ""}`}>
      <span className="track-dial-label">{label}</span>
      <span className="track-dial-value">{value}</span>
      <ul className="dash-split">
        {rows.map((row) => {
          const meta = PLATFORMS.find((p) => p.key === row.platform);
          return (
            <li key={row.platform} className="dash-split-row">
              <span
                className="dash-chip"
                aria-hidden="true"
                style={{ background: meta?.color }}
              />
              <span>{meta?.label || row.platform}</span>
              <span className="dash-split-value">{row.value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
