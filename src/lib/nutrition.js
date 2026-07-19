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

export const ALL_FIELDS = [...MACRO_FIELDS, ...MICRO_FIELDS];

/* Every nutrient key, used for zeroing totals and validating form input. */
export const NUTRIENT_KEYS = ALL_FIELDS.map((f) => f.key);

/* Starting targets for a cut. Adjustable in the tracker and stored per user.
   Sodium and sugar are ceilings, the rest are floors to reach. */
export const DEFAULT_TARGETS = {
  calories: 2100,
  protein: 180,
  carbs: 180,
  fat: 60,
  fiber: 30,
  sugar: 45,
  sodium: 2300,
  potassium: 3400,
  calcium: 1000,
  iron: 18,
  vitaminC: 90,
};

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

/* An all zero nutrition object, the base for an empty log. */
export function emptyTotals() {
  const t = {};
  for (const key of NUTRIENT_KEYS) t[key] = 0;
  return t;
}

/* Sum a day's entries. Each entry holds PER SERVING values plus a servings
   count, so the multiply happens here and nowhere else. */
export function sumEntries(entries) {
  const totals = emptyTotals();
  for (const entry of entries) {
    const servings = Number(entry.servings) || 0;
    for (const key of NUTRIENT_KEYS) {
      totals[key] += (Number(entry[key]) || 0) * servings;
    }
  }
  // Round once at the end so repeated fractional servings do not drift.
  for (const key of NUTRIENT_KEYS) totals[key] = round(totals[key]);
  return totals;
}

/* Totals for a single entry, used for the per row readout. */
export function entryTotals(entry) {
  return sumEntries([entry]);
}

/* One decimal place, and drop a trailing .0 so whole numbers read clean. */
export function round(n) {
  return Math.round((Number(n) || 0) * 10) / 10;
}

/* Percentage of target consumed, clamped to 100 for bar width. */
export function pctOfTarget(consumed, target) {
  if (!target) return 0;
  return Math.min(100, Math.round((consumed / target) * 100));
}

/* Local calendar date as YYYY-MM-DD. Deliberately local, not UTC, so the day
   rolls over at the user's midnight rather than somewhere in the Atlantic. */
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* Readable form of a date key, for the tracker header. */
export function formatDayLabel(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/* Shift a date key by N days. Powers the previous and next day arrows. */
export function shiftDay(key, delta) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return todayKey(date);
}
