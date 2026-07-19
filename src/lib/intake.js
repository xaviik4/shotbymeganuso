/* ─── INTAKE DATA ──────────────────────────────────────────────────── */
/* Supabase reads and writes for the daily tracker.
   See supabase/migrations for the tables and their RLS policies.

   Only one key differs between the app and the database: vitaminC in JS is
   vitamin_c in Postgres. Everything routes through the two mappers below so
   that mismatch lives in exactly one place. */

import { supabase } from "./supabase";
import { NUTRIENT_KEYS, DEFAULT_TARGETS, round } from "./nutrition";

const TO_DB = { vitaminC: "vitamin_c" };
const dbKey = (key) => TO_DB[key] || key;

/* DB row -> app entry. */
function fromRow(row) {
  const entry = {
    id: row.id,
    name: row.name,
    servings: Number(row.servings),
    source: row.source,
    recipeId: row.recipe_id,
    createdAt: row.created_at,
  };
  for (const key of NUTRIENT_KEYS) entry[key] = Number(row[dbKey(key)]) || 0;
  return entry;
}

/* App entry -> DB row. Nutrition values are stored per serving. */
function toRow(entry, userId, dayKey) {
  const row = {
    user_id: userId,
    log_date: dayKey,
    name: entry.name.trim(),
    servings: entry.servings,
    source: entry.source || "manual",
    recipe_id: entry.recipeId || null,
  };
  for (const key of NUTRIENT_KEYS) row[dbKey(key)] = round(entry[key] || 0);
  return row;
}

/* ─── ENTRIES ───────────────────────────────────────────────────────── */

export async function fetchEntries(userId, dayKey) {
  const { data, error } = await supabase
    .from("intake_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", dayKey)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(fromRow);
}

export async function addEntry(entry, userId, dayKey) {
  const { data, error } = await supabase
    .from("intake_entries")
    .insert(toRow(entry, userId, dayKey))
    .select()
    .single();

  if (error) throw error;
  return fromRow(data);
}

export async function removeEntry(entryId, userId) {
  // The user_id filter is redundant against RLS, but it keeps a bad id from
  // silently matching nothing and reading as success.
  const { error } = await supabase
    .from("intake_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);

  if (error) throw error;
}

/* ─── TARGETS ───────────────────────────────────────────────────────── */

/* Returns the saved targets, or the defaults if the user has never set any.
   maybeSingle keeps a missing row from being treated as an error. */
export async function fetchTargets(userId) {
  const { data, error } = await supabase
    .from("intake_targets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { ...DEFAULT_TARGETS };

  const targets = {};
  for (const key of NUTRIENT_KEYS) {
    const value = Number(data[dbKey(key)]);
    targets[key] = Number.isFinite(value) ? value : DEFAULT_TARGETS[key];
  }
  return targets;
}

export async function saveTargets(targets, userId) {
  const row = { user_id: userId, updated_at: new Date().toISOString() };
  for (const key of NUTRIENT_KEYS) row[dbKey(key)] = round(targets[key] || 0);

  const { error } = await supabase
    .from("intake_targets")
    .upsert(row, { onConflict: "user_id" });

  if (error) throw error;
}
