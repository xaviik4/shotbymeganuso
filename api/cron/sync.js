/* ─── DAILY SYNC (CRON) ─────────────────────────────────────────────── */
/* Triggered by Vercel Cron once a day — see the `crons` entry in vercel.json.
   Fetches every tracked account and writes today's snapshot.

   This URL is publicly reachable, so it is guarded by CRON_SECRET rather than
   by being hard to guess. Without the header it returns 401 to everyone,
   including a signed-in browser. */

import { isCronRequest } from "../_lib/auth.js";
import { listAccounts, syncAccount } from "../_lib/sync.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isCronRequest(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const accounts = await listAccounts();

    if (accounts.length === 0) {
      return res.status(200).json({
        syncedAt: new Date().toISOString(),
        accounts: 0,
        note: "No rows in content_accounts — seed one to start collecting.",
      });
    }

    // The cron is the only path that rotates the Instagram token, because a
    // refresh is rejected on tokens younger than 24 hours.
    const synced = await Promise.all(
      accounts.map(async (account) => {
        const { results, okCount, errorCount } = await syncAccount(account, {
          refreshToken: true,
        });
        return { userId: account.user_id, results, okCount, errorCount };
      })
    );

    const totalOk = synced.reduce((sum, a) => sum + a.okCount, 0);
    const totalErrors = synced.reduce((sum, a) => sum + a.errorCount, 0);

    // 200 when nothing failed, 207 when some did, 502 when nothing landed.
    const status = totalErrors === 0 ? 200 : totalOk > 0 ? 207 : 502;

    return res.status(status).json({
      syncedAt: new Date().toISOString(),
      accounts: synced.length,
      synced,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
