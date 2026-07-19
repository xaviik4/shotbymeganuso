/* ─── METRIC HELPERS ────────────────────────────────────────────────── */
/* Shared by the platform fetchers. No I/O, no config. */

/** The UTC calendar day, which is the date half of a metrics row's key. */
export function startOfDayUtc(date = new Date()) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

/** `YYYY-MM-DD` for a Postgres `date` column. */
export function dateKey(date = new Date()) {
  return startOfDayUtc(date).toISOString().slice(0, 10);
}

/* (likes + comments) / views as a percentage. Returns 0 rather than NaN for
   an account with no views yet, so the value is always safe to chart. */
export function engagementRate(interactions, views) {
  if (!views || views <= 0) return 0;
  return Number(((interactions / views) * 100).toFixed(2));
}
