/* ─── SERVICE ROLE CLIENT ───────────────────────────────────────────── */
/* Server-only Supabase client. The service role key BYPASSES RLS, so this
   module must never be imported from anything under src/ — it is reachable
   only from Vercel functions.

   VITE_SUPABASE_URL is reused here on purpose. The VITE_ prefix only tells
   Vite what to inline into the browser bundle; Vercel injects every variable
   into the function runtime regardless of name. The URL is public anyway —
   only the key needs protecting, and it is deliberately unprefixed. */

import { createClient } from "@supabase/supabase-js";

let client;

export function supabaseAdmin() {
  if (client) return client;

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("VITE_SUPABASE_URL is not set");
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  // A function invocation is stateless, so session persistence and token
  // refresh are both wrong here.
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
