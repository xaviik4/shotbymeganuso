/* ─── NUTRITION ────────────────────────────────────────────────────── */
/* Field definitions and math shared by the cookbook and the tracker.
   Every value here is per serving. The tracker multiplies by servings eaten.
   All numbers are estimates, not lab measured. */

/* Macros, in display order. `key` matches the recipe `macros` object
   and the Supabase column of the same name. */
export const MACRO_FIELDS = [
  { key: "calories", label: "Calories", unit: "kcal", accent: true },
  { key: "protein",  label: "Protein",  unit: "g",    accent: true },
  { key: "carbs",    label: "Carbs",    unit: "g" },
  { key: "fat",      label: "Fat",      unit: "g" },
];

/* Micronutrients, in display order. `key` matches the recipe `micros` object.
   `low` marks the ones where you want to stay under the target rather than
   reach it, which flips how the tracker colors the bar. */
export const MICRO_FIELDS = [
  { key: "fiber",     label: "Fiber",     unit: "g" },
  { key: "sugar",     label: "Sugar",     unit: "g",  low: true },
  { key: "sodium",    label: "Sodium",    unit: "mg", low: true },
  { key: "potassium", label: "Potassium", unit: "mg" },
  { key: "calcium",   label: "Calcium",   unit: "mg" },
  { key: "iron",      label: "Iron",      unit: "mg" },
  { key: "vitaminC",  label: "Vitamin C", unit: "mg" },
];

/* Every nutrient key. The cookbook shows all of them on a recipe. */
export const NUTRIENT_KEYS = [...MACRO_FIELDS, ...MICRO_FIELDS].map((f) => f.key);

/* What the calculator actually adds up. Everything else is still stored on the
   recipes and still shown in the cookbook — it just isn't what you count when
   you are watching calories and protein. */
export const CALC_FIELDS = MACRO_FIELDS.filter(
  (f) => f.key === "calories" || f.key === "protein"
);
export const CALC_KEYS = CALC_FIELDS.map((f) => f.key);

/* Snapshot a recipe's per serving nutrition into a flat object.
   Flat is what the tracker stores and what the manual form produces, so
   recipe entries and manual entries stay the same shape end to end. */
export function nutritionFromRecipe(recipe) {
  const flat = {};
  for (const key of NUTRIENT_KEYS) {
    flat[key] = recipe.macros?.[key] ?? recipe.micros?.[key] ?? 0;
  }
  return flat;
}

/* An all zero nutrition object, the base for an empty list. */
export function emptyTotals(keys = NUTRIENT_KEYS) {
  const t = {};
  for (const key of keys) t[key] = 0;
  return t;
}

/* Sum a list of entries. Each entry holds PER SERVING values plus a servings
   count, so the multiply happens here and nowhere else. */
export function sumEntries(entries, keys = NUTRIENT_KEYS) {
  const totals = emptyTotals(keys);
  for (const entry of entries) {
    const servings = Number(entry.servings) || 0;
    for (const key of keys) {
      totals[key] += (Number(entry[key]) || 0) * servings;
    }
  }
  // Round once at the end so repeated fractional servings do not drift.
  for (const key of keys) totals[key] = round(totals[key]);
  return totals;
}

/* Totals for a single entry, used for the per row readout. */
export function entryTotals(entry, keys = NUTRIENT_KEYS) {
  return sumEntries([entry], keys);
}

/* One decimal place, and drop a trailing .0 so whole numbers read clean. */
export function round(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

/* The day helpers and target math that used to live here went with the daily
   log. The calculator keeps a running total for the current session only, so
   there is no date key to compute and no target to measure against. */
