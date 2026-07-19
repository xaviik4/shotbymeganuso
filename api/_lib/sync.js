/* ─── SYNC ORCHESTRATOR ─────────────────────────────────────────────── */
/* Fetches every platform for one account and upserts today's rows.
   Shared by the cron endpoint and the manual refresh endpoint. */

import { dateKey } from "./metrics.js";
import { fetchYouTubeMetrics } from "./youtube.js";
import { fetchInstagramMetrics, refreshLongLivedToken } from "./instagram.js";
import { supabaseAdmin } from "./supabase-admin.js";

/* Instagram rejects a refresh on a token younger than 24 hours, so only the
   daily job refreshes, and only when the stored token is genuinely stale. */
const REFRESH_AFTER_DAYS = 7;

async function saveSnapshot(snapshot, userId, metricDate) {
  const { platform, ...values } = snapshot;

  const { error } = await supabaseAdmin()
    .from("content_metrics")
    .upsert(
      {
        user_id: userId,
        metric_date: metricDate,
        platform,
        ...values,
        synced_at: new Date().toISOString(),
      },
      { onConflict: "user_id,metric_date,platform" }
    );

  if (error) throw new Error(`Could not save ${platform}: ${error.message}`);
}

/**
 * Syncs one `content_accounts` row.
 *
 * One platform failing must never discard the other's data, so the fetches
 * are settled independently.
 */
export async function syncAccount(account, { refreshToken = false } = {}) {
  const metricDate = dateKey();
  const userId = account.user_id;

  const sources = [
    {
      platform: "youtube",
      run: () =>
        fetchYouTubeMetrics(
          process.env.YOUTUBE_CHANNEL_ID,
          process.env.YOUTUBE_API_KEY
        ),
    },
    {
      platform: "instagram",
      // An account with no token is not configured yet. Reporting that as a
      // failure would make the daily job return 207 forever while only
      // YouTube is set up.
      run: account.ig_access_token
        ? () => fetchInstagramMetrics(account.ig_access_token)
        : null,
    },
  ];

  const settled = await Promise.allSettled(
    sources.map(async (source) => {
      if (!source.run) return null;
      const snapshot = await source.run();
      await saveSnapshot(snapshot, userId, metricDate);
      return snapshot;
    })
  );

  const results = settled.map((outcome, i) => {
    const platform = sources[i].platform;

    if (outcome.status === "rejected") {
      return {
        platform,
        status: "error",
        error: outcome.reason?.message || String(outcome.reason),
      };
    }
    if (outcome.value === null) {
      return { platform, status: "skipped", reason: "not configured" };
    }
    return { platform, status: "ok", snapshot: outcome.value };
  });

  if (refreshToken && account.ig_access_token) {
    results.push(await maybeRefreshToken(account));
  }

  await recordSyncError(userId, results);

  return {
    results,
    okCount: results.filter((r) => r.status === "ok").length,
    errorCount: results.filter((r) => r.status === "error").length,
  };
}

/* Rotates the Instagram token in place when it is old enough to be eligible. */
async function maybeRefreshToken(account) {
  const refreshedAt = account.ig_token_refreshed_at
    ? new Date(account.ig_token_refreshed_at)
    : null;
  const ageDays = refreshedAt
    ? (Date.now() - refreshedAt.getTime()) / 86400000
    : Infinity;

  if (ageDays < REFRESH_AFTER_DAYS) {
    return { platform: "ig_token", status: "skipped", reason: "still fresh" };
  }

  try {
    const { accessToken } = await refreshLongLivedToken(account.ig_access_token);

    const { error } = await supabaseAdmin()
      .from("content_accounts")
      .update({
        ig_access_token: accessToken,
        ig_token_refreshed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", account.user_id);

    if (error) throw new Error(error.message);
    return { platform: "ig_token", status: "ok" };
  } catch (err) {
    return { platform: "ig_token", status: "error", error: err.message };
  }
}

/* A silently broken sync is the dangerous kind, so the last failure is kept
   where the dashboard can surface it. */
async function recordSyncError(userId, results) {
  const failures = results
    .filter((r) => r.status === "error")
    .map((r) => `${r.platform}: ${r.error}`)
    .join(" | ");

  await supabaseAdmin()
    .from("content_accounts")
    .update({
      last_sync_error: failures || null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

/** Every tracked account. The cron has no logged-in user to ask. */
export async function listAccounts() {
  const { data, error } = await supabaseAdmin()
    .from("content_accounts")
    .select("*");

  if (error) throw new Error(`Could not load accounts: ${error.message}`);
  return data || [];
}

/** One account by owner id, or null. */
export async function getAccount(userId) {
  const { data, error } = await supabaseAdmin()
    .from("content_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`Could not load account: ${error.message}`);
  return data;
}
