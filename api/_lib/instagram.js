/* ─── INSTAGRAM ─────────────────────────────────────────────────────── */
/* Instagram Graph API via graph.instagram.com, using a long-lived token.

   This module never touches the database. refreshLongLivedToken returns the
   new token and lets the caller decide where to persist it. */

import { engagementRate } from "./metrics.js";

const API = "https://graph.instagram.com/v21.0";

/* How many recent media items feed the view and engagement totals. */
const RECENT_MEDIA_COUNT = 25;

async function igFetch(path, params, token) {
  const url = new URL(`${API}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("access_token", token);

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok || json.error) {
    throw new Error(
      `Instagram ${path} failed: ${json.error?.message || `HTTP ${res.status}`}`
    );
  }
  return json;
}

/* The views insight is only present on media types that report it. */
function viewsOf(media) {
  const metric = media.insights?.data?.find((d) => d.name === "views");
  return metric?.values?.[0]?.value ?? 0;
}

/**
 * Followers plus views and engagement across recent media.
 */
export async function fetchInstagramMetrics(token) {
  if (!token) throw new Error("No Instagram access token");

  const me = await igFetch(
    "me",
    { fields: "id,username,followers_count,media_count" },
    token
  );

  /* insights.metric(views) is expanded inline so reels do not need one extra
     request each. Media types without the metric come back empty. */
  const media = await igFetch(
    "me/media",
    {
      fields:
        "id,media_product_type,like_count,comments_count,insights.metric(views)",
      limit: String(RECENT_MEDIA_COUNT),
    },
    token
  );

  let views = 0;
  let interactions = 0;

  for (const item of media.data || []) {
    views += viewsOf(item);
    interactions += (item.like_count || 0) + (item.comments_count || 0);
  }

  return {
    platform: "instagram",
    followers: me.followers_count || 0,
    total_views: views,
    engagement_rate: engagementRate(interactions, views),
  };
}

/**
 * Exchanges a long-lived token for a fresh one and returns it.
 *
 * Instagram long-lived tokens last 60 days and can only be refreshed while
 * still valid and at least 24 hours old. Let one lapse and the only way back
 * is re-authorizing by hand, which is why the caller must persist the result.
 */
export async function refreshLongLivedToken(token) {
  if (!token) throw new Error("No Instagram access token to refresh");

  const refreshed = await igFetch(
    "refresh_access_token",
    { grant_type: "ig_refresh_token" },
    token
  );

  if (!refreshed.access_token) {
    throw new Error("Instagram refresh returned no access_token");
  }

  return {
    accessToken: refreshed.access_token,
    expiresIn: refreshed.expires_in ?? 0,
  };
}
