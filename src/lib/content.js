/* ─── CONTENT DATA ─────────────────────────────────────────────────── */
/* Supabase reads for the content dashboard.
   See supabase/migrations for the tables and their RLS policies.

   This module only ever reads. Metrics are written by the Vercel cron using
   the service role, and content_metrics has no write policies at all, so a
   browser cannot insert or edit a row even if it tried. */

import { supabase } from "./supabase";

export const TREND_DAYS = 30;

/* DB row -> app shape. */
function fromRow(row) {
  return {
    date: row.metric_date,
    platform: row.platform,
    totalViews: Number(row.total_views) || 0,
    followers: Number(row.followers) || 0,
    engagementRate: Number(row.engagement_rate) || 0,
    syncedAt: row.synced_at,
  };
}

/**
 * Which account's numbers this user may see.
 *
 * A viewer's rows are not keyed to their own id, so the page cannot simply
 * filter by "me". A grant in content_viewers points at the account it unlocks;
 * with no grant you are looking at your own.
 *
 * Security does not depend on this resolving correctly — RLS is the boundary.
 * Asking for an id you were not granted returns zero rows.
 */
export async function fetchAccessibleAccountId(userId) {
  const { data, error } = await supabase
    .from("content_viewers")
    .select("account_user_id")
    .eq("viewer_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data?.account_user_id || userId;
}

/**
 * The last `days` of snapshots, collapsed so both platforms share one point
 * per date.
 *
 * A day with no sync is left absent rather than zeroed, so the chart draws a
 * gap instead of a line crashing to zero.
 */
export async function fetchTrend(accountId, days = TREND_DAYS) {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - (days - 1));

  const { data, error } = await supabase
    .from("content_metrics")
    .select("*")
    .eq("user_id", accountId)
    .gte("metric_date", since.toISOString().slice(0, 10))
    .order("metric_date", { ascending: true });

  if (error) throw error;

  const byDate = new Map();
  for (const row of data || []) {
    const entry = fromRow(row);
    const point = byDate.get(entry.date) || {
      date: entry.date,
      youtubeViews: null,
      instagramViews: null,
      youtubeEngagement: null,
      instagramEngagement: null,
    };

    if (entry.platform === "youtube") {
      point.youtubeViews = entry.totalViews;
      point.youtubeEngagement = entry.engagementRate;
    } else if (entry.platform === "instagram") {
      point.instagramViews = entry.totalViews;
      point.instagramEngagement = entry.engagementRate;
    }

    byDate.set(entry.date, point);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Newest snapshot per platform, for the stat tiles.
 *
 * Two small limit-1 queries rather than one distinct-on, which PostgREST
 * cannot express cheaply.
 */
export async function fetchLatest(accountId) {
  const platforms = ["youtube", "instagram"];

  const rows = await Promise.all(
    platforms.map(async (platform) => {
      const { data, error } = await supabase
        .from("content_metrics")
        .select("*")
        .eq("user_id", accountId)
        .eq("platform", platform)
        .order("metric_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? fromRow(data) : null;
    })
  );

  return rows.filter(Boolean);
}

/**
 * Triggers a manual sync.
 *
 * The response body matters on every status: a 207 is a real partial success
 * carrying per-platform errors, so neither `if (!res.ok) throw` nor
 * `if (res.ok)` alone would read it correctly.
 */
export async function requestSync(accessToken) {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  let body = {};
  try {
    body = await res.json();
  } catch {
    // A non-JSON body means something upstream returned HTML — surface the
    // status rather than a parse error.
    throw new Error(`Sync failed (${res.status}).`);
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error("You do not have permission to refresh these stats.");
  }
  if (res.status === 429) {
    throw new Error(body.error || "Just synced — try again shortly.");
  }
  if (res.status >= 500) {
    throw new Error(body.error || "The sync failed.");
  }

  return body.results || [];
}
