/* ─── YOUTUBE ───────────────────────────────────────────────────────── */
/* Reads channel stats with an API key only. An API key cannot use
   `mine=true` (that needs OAuth), so the channel is addressed by id.

   Config is passed in rather than read from process.env here, so the caller
   decides which account is being fetched. */

import { engagementRate } from "./metrics.js";

const API = "https://www.googleapis.com/youtube/v3";

/* How many recent uploads feed the engagement average. */
const RECENT_VIDEO_COUNT = 10;

async function ytFetch(path, params, apiKey) {
  const url = new URL(`${API}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("key", apiKey);

  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `YouTube ${path} failed (${res.status}): ${body.slice(0, 300)}`
    );
  }
  return res.json();
}

/* Stat fields arrive as strings, and are absent when hidden by the owner. */
function toInt(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Lifetime views and subscribers for one channel, plus the engagement rate
 * across its most recent uploads.
 */
export async function fetchYouTubeMetrics(channelId, apiKey) {
  if (!apiKey) throw new Error("YOUTUBE_API_KEY is not set");
  if (!channelId) throw new Error("YOUTUBE_CHANNEL_ID is not set");

  const channel = await ytFetch(
    "channels",
    { part: "statistics,contentDetails", id: channelId },
    apiKey
  );

  const item = channel.items?.[0];
  if (!item) throw new Error(`No YouTube channel found for id ${channelId}`);

  const followers = toInt(item.statistics?.subscriberCount);
  const totalViews = toInt(item.statistics?.viewCount);

  /* Recent uploads live in the channel's auto-generated uploads playlist.
     Walking it costs 1 quota unit, where search.list would cost 100. */
  const uploadsPlaylist = item.contentDetails?.relatedPlaylists?.uploads;
  let interactions = 0;
  let recentViews = 0;

  if (uploadsPlaylist) {
    const playlist = await ytFetch(
      "playlistItems",
      {
        part: "contentDetails",
        playlistId: uploadsPlaylist,
        maxResults: String(RECENT_VIDEO_COUNT),
      },
      apiKey
    );

    const videoIds = (playlist.items || [])
      .map((entry) => entry.contentDetails?.videoId)
      .filter(Boolean);

    if (videoIds.length > 0) {
      const videos = await ytFetch(
        "videos",
        { part: "statistics", id: videoIds.join(",") },
        apiKey
      );

      for (const video of videos.items || []) {
        recentViews += toInt(video.statistics?.viewCount);
        interactions +=
          toInt(video.statistics?.likeCount) +
          toInt(video.statistics?.commentCount);
      }
    }
  }

  return {
    platform: "youtube",
    followers,
    total_views: totalViews,
    engagement_rate: engagementRate(interactions, recentViews),
  };
}
