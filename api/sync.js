/* ─── MANUAL SYNC ───────────────────────────────────────────────────── */
/* Behind the dashboard's Refresh button. Authorized by the caller's own
   Supabase session, since the browser has no CRON_SECRET and must never
   be given one.

   Owner-only: a granted viewer holds a perfectly valid session, so
   authenticating the request is not enough — this also checks that the caller
   owns a content_accounts row. Viewers read the numbers the cron collects and
   cannot spend the account's API quota. */

import { getRequestUser } from "./_lib/auth.js";
import { getAccount, syncAccount } from "./_lib/sync.js";
import { supabaseAdmin } from "./_lib/supabase-admin.js";

/* A stuck button should not be able to drain the YouTube quota. */
const COOLDOWN_SECONDS = 60;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await getRequestUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const account = await getAccount(user.id);
    if (!account) {
      return res
        .status(403)
        .json({ error: "This account cannot trigger a sync." });
    }

    const { data: recent } = await supabaseAdmin()
      .from("content_metrics")
      .select("synced_at")
      .eq("user_id", user.id)
      .order("synced_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recent?.synced_at) {
      const agoSeconds = (Date.now() - new Date(recent.synced_at).getTime()) / 1000;
      if (agoSeconds < COOLDOWN_SECONDS) {
        return res.status(429).json({
          error: `Just synced. Try again in ${Math.ceil(
            COOLDOWN_SECONDS - agoSeconds
          )}s.`,
        });
      }
    }

    // Token refresh is the cron's job — Instagram rejects a refresh on a token
    // younger than 24 hours, so doing it per click would fail intermittently.
    const { results, okCount, errorCount } = await syncAccount(account, {
      refreshToken: false,
    });

    const status = errorCount === 0 ? 200 : okCount > 0 ? 207 : 502;

    return res.status(status).json({
      syncedAt: new Date().toISOString(),
      results,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
