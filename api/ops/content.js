import { createClient } from "@supabase/supabase-js";
import { requireOpsMember, sendMethodNotAllowed } from "../_lib/ops.js";

function rowShape(row) {
  return {
    date: row.metric_date,
    platform: row.platform,
    totalViews: Number(row.total_views) || 0,
    followers: Number(row.followers) || 0,
    engagementRate: Number(row.engagement_rate) || 0,
    syncedAt: row.synced_at,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET") return sendMethodNotAllowed(res, ["GET"]);
  const context = await requireOpsMember(req, res);
  if (!context) return;
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) return res.status(500).json({ error: "Content service is not configured." });

  // The API verifies operations membership above, then performs reads with the
  // caller's JWT so the existing content_metrics/content_viewers RLS policies
  // remain an independent authorization boundary.
  const db = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: grant, error: grantError } = await db.from("content_viewers")
    .select("account_user_id").eq("viewer_id", context.user.id).limit(1).maybeSingle();
  if (grantError) return res.status(500).json({ error: "Could not check content access." });
  const accountId = grant?.account_user_id || context.user.id;
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 29);

  const [trendResult, youtubeResult, instagramResult] = await Promise.all([
    db.from("content_metrics").select("metric_date, platform, total_views, followers, engagement_rate, synced_at")
      .eq("user_id", accountId).gte("metric_date", since.toISOString().slice(0, 10)).order("metric_date", { ascending: true }),
    db.from("content_metrics").select("metric_date, platform, total_views, followers, engagement_rate, synced_at")
      .eq("user_id", accountId).eq("platform", "youtube").order("metric_date", { ascending: false }).limit(1).maybeSingle(),
    db.from("content_metrics").select("metric_date, platform, total_views, followers, engagement_rate, synced_at")
      .eq("user_id", accountId).eq("platform", "instagram").order("metric_date", { ascending: false }).limit(1).maybeSingle(),
  ]);
  if (trendResult.error || youtubeResult.error || instagramResult.error) {
    return res.status(500).json({ error: "Could not load content metrics." });
  }

  const byDate = new Map();
  for (const row of trendResult.data || []) {
    const metric = rowShape(row);
    const point = byDate.get(metric.date) || {
      date: metric.date, youtubeViews: null, instagramViews: null,
      youtubeEngagement: null, instagramEngagement: null,
    };
    if (metric.platform === "youtube") {
      point.youtubeViews = metric.totalViews;
      point.youtubeEngagement = metric.engagementRate;
    } else if (metric.platform === "instagram") {
      point.instagramViews = metric.totalViews;
      point.instagramEngagement = metric.engagementRate;
    }
    byDate.set(metric.date, point);
  }
  const latest = [youtubeResult.data, instagramResult.data].filter(Boolean).map(rowShape);
  return res.status(200).json({
    accountId,
    trend: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)),
    latest,
  });
}
