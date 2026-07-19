/* ─── ENDPOINT GUARDS ───────────────────────────────────────────────── */
/* Both sync endpoints are on the public internet, so neither relies on its
   URL being hard to guess. Each authenticates every caller instead.

   Both return a bare 401 with no detail: telling an attacker whether the
   secret was wrong or merely absent is free reconnaissance. */

import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

/**
 * True only for Vercel Cron, which sends `Authorization: Bearer $CRON_SECRET`.
 *
 * Fails closed when CRON_SECRET is unset — the opposite would turn a
 * forgotten environment variable into an open write endpoint.
 */
export function isCronRequest(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(req.headers.authorization || "");

  // timingSafeEqual throws on a length mismatch, so lengths are compared
  // first. The length is not the secret; the bytes are.
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/**
 * Resolves the Supabase user behind a request's bearer token, or null.
 *
 * auth.getUser() verifies the signature and expiry against Supabase — this is
 * a real check, not a decode of untrusted claims.
 */
export async function getRequestUser(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return null;

  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await anon.auth.getUser(token);
  return error ? null : data.user;
}
