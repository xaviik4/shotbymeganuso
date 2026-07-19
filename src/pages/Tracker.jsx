import { useState, useEffect, useMemo, useCallback } from "react";
import AuthedNav from "../components/AuthedNav";
import { useAuth } from "../context/AuthContext";
import { CUISINES, RECIPES, recipesByCuisine } from "../lib/recipes";
import {
  MACRO_FIELDS, MICRO_FIELDS, ALL_FIELDS, NUTRIENT_KEYS,
  nutritionFromRecipe, sumEntries, entryTotals, round, pctOfTarget,
  todayKey, formatDayLabel, shiftDay,
} from "../lib/nutrition";
import {
  fetchEntries, addEntry, removeEntry, fetchTargets, saveTargets,
} from "../lib/intake";

export default function Tracker() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  const [day, setDay] = useState(todayKey());
  const [entries, setEntries] = useState([]);
  const [targets, setTargets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTargets, setEditingTargets] = useState(false);

  const totals = useMemo(() => sumEntries(entries), [entries]);

  /* Load the day's log and the user's targets together. */
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      const [dayEntries, savedTargets] = await Promise.all([
        fetchEntries(userId, day),
        fetchTargets(userId),
      ]);
      setEntries(dayEntries);
      setTargets(savedTargets);
    } catch (err) {
      setError(err.message || "Could not load the log.");
    } finally {
      setLoading(false);
    }
  }, [userId, day]);

  useEffect(() => { load(); }, [load]);

  /* If the tab sits open past midnight, roll the day over on refocus. */
  useEffect(() => {
    function checkRollover() {
      const now = todayKey();
      setDay((current) => (current < now ? now : current));
    }
    window.addEventListener("focus", checkRollover);
    return () => window.removeEventListener("focus", checkRollover);
  }, []);

  async function handleAdd(entry) {
    setError("");
    try {
      const saved = await addEntry(entry, userId, day);
      setEntries((prev) => [saved, ...prev]);
    } catch (err) {
      setError(err.message || "Could not save that entry.");
    }
  }

  async function handleRemove(entryId) {
    setError("");
    const previous = entries;
    // Optimistic, with a rollback so a failed delete does not lie.
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    try {
      await removeEntry(entryId, userId);
    } catch (err) {
      setEntries(previous);
      setError(err.message || "Could not remove that entry.");
    }
  }

  async function handleSaveTargets(next) {
    setError("");
    const previous = targets;
    setTargets(next);
    setEditingTargets(false);
    try {
      await saveTargets(next, userId);
    } catch (err) {
      setTargets(previous);
      setError(err.message || "Could not save your targets.");
    }
  }

  const isToday = day === todayKey();

  return (
    <div className="portal-page">
      <AuthedNav />

      <main className="portal-body track-body">
        <p className="portal-label">Daily Intake</p>
        <h1 className="portal-title">Tracker</h1>

        {/* Day switcher */}
        <div className="track-daybar">
          <button
            className="track-daynav"
            onClick={() => setDay((d) => shiftDay(d, -1))}
            aria-label="Previous day"
          >
            ←
          </button>
          <span className="track-day">{formatDayLabel(day)}</span>
          <button
            className="track-daynav"
            onClick={() => setDay((d) => shiftDay(d, 1))}
            disabled={isToday}
            aria-label="Next day"
          >
            →
          </button>
          {!isToday && (
            <button className="track-today" onClick={() => setDay(todayKey())}>
              Jump to today
            </button>
          )}
        </div>

        {error && <div className="track-error" role="alert">{error}</div>}

        {loading || !targets ? (
          <p className="track-loading">Loading the log...</p>
        ) : (
          <>
            <TotalsPanel
              totals={totals}
              targets={targets}
              onEdit={() => setEditingTargets(true)}
            />

            {editingTargets && (
              <TargetEditor
                targets={targets}
                onSave={handleSaveTargets}
                onCancel={() => setEditingTargets(false)}
              />
            )}

            <div className="track-adders">
              <RecipeAdder onAdd={handleAdd} />
              <ManualAdder onAdd={handleAdd} />
            </div>

            <EntryList entries={entries} onRemove={handleRemove} />

            <p className="track-note">
              All nutrition values are estimates. Recipe entries use the
              cookbook's per serving numbers multiplied by servings eaten.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

/* ─── TOTALS: consumed vs target vs remaining ────────────────────────── */
function TotalsPanel({ totals, targets, onEdit }) {
  return (
    <section className="track-panel">
      <div className="track-panel-head">
        <h2 className="cook-panel-title track-panel-title">Today's Totals</h2>
        <button className="track-edit" onClick={onEdit}>Adjust Targets</button>
      </div>

      <div className="track-macros">
        {MACRO_FIELDS.map((f) => (
          <MacroDial key={f.key} field={f} consumed={totals[f.key]} target={targets[f.key]} />
        ))}
      </div>

      <div className="track-micros">
        {MICRO_FIELDS.map((f) => (
          <MicroBar key={f.key} field={f} consumed={totals[f.key]} target={targets[f.key]} />
        ))}
      </div>
    </section>
  );
}

function MacroDial({ field, consumed, target }) {
  const pct = pctOfTarget(consumed, target);
  const remaining = round(target - consumed);
  const over = remaining < 0;

  return (
    <div className={`track-dial${field.accent ? " is-accent" : ""}`}>
      <span className="track-dial-label">{field.label}</span>
      <span className="track-dial-value">
        {round(consumed)}
        <em>/ {round(target)} {field.unit}</em>
      </span>
      <div className="track-bar">
        <div
          className={`track-bar-fill${over ? " is-over" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`track-dial-left${over ? " is-over" : ""}`}>
        {over ? `${Math.abs(remaining)} ${field.unit} over` : `${remaining} ${field.unit} left`}
      </span>
    </div>
  );
}

function MicroBar({ field, consumed, target }) {
  const pct = pctOfTarget(consumed, target);
  const remaining = round(target - consumed);
  const over = remaining < 0;
  // For sodium and sugar, going over is the bad outcome. For everything else
  // hitting the target is the goal, so a full bar reads as good.
  const bad = field.low ? over : false;
  const good = !field.low && pct >= 100;

  return (
    <div className="track-micro">
      <div className="track-micro-head">
        <span className="track-micro-label">{field.label}</span>
        <span className="track-micro-value">
          {round(consumed)} / {round(target)} {field.unit}
        </span>
      </div>
      <div className="track-bar is-thin">
        <div
          className={`track-bar-fill${bad ? " is-over" : ""}${good ? " is-met" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="track-micro-left">
        {over
          ? `${Math.abs(remaining)} ${field.unit} over`
          : `${remaining} ${field.unit} left`}
      </span>
    </div>
  );
}

/* ─── TARGET EDITOR ──────────────────────────────────────────────────── */
function TargetEditor({ targets, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => {
    const d = {};
    for (const key of NUTRIENT_KEYS) d[key] = String(targets[key]);
    return d;
  });

  function submit(e) {
    e.preventDefault();
    const next = {};
    for (const key of NUTRIENT_KEYS) {
      const value = Number(draft[key]);
      next[key] = Number.isFinite(value) && value >= 0 ? value : targets[key];
    }
    onSave(next);
  }

  return (
    <form className="track-panel track-targets" onSubmit={submit}>
      <h2 className="cook-panel-title">Daily Targets</h2>
      <div className="track-target-grid">
        {ALL_FIELDS.map((f) => (
          <div className="form-group track-target-field" key={f.key}>
            <label className="form-label" htmlFor={`target-${f.key}`}>
              {f.label} ({f.unit})
            </label>
            <input
              id={`target-${f.key}`}
              className="form-input"
              type="number"
              min="0"
              step="any"
              value={draft[f.key]}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          </div>
        ))}
      </div>
      <div className="track-form-actions">
        <button type="submit" className="track-submit">Save Targets</button>
        <button type="button" className="track-cancel" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

/* ─── ADD FROM THE COOKBOOK (the main workflow) ──────────────────────── */
function RecipeAdder({ onAdd }) {
  const [cuisineId, setCuisineId] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [servings, setServings] = useState("1");

  // No cuisine picked means search the whole book rather than showing nothing.
  const available = cuisineId ? recipesByCuisine(cuisineId) : RECIPES;
  const recipe = available.find((r) => r.id === recipeId) || null;
  const count = Number(servings) || 0;

  function submit(e) {
    e.preventDefault();
    if (!recipe || count <= 0) return;
    onAdd({
      name: recipe.name,
      servings: count,
      source: "recipe",
      recipeId: recipe.id,
      ...nutritionFromRecipe(recipe),
    });
    setServings("1");
  }

  return (
    <form className="track-panel track-adder" onSubmit={submit}>
      <h2 className="cook-panel-title">Add From Cookbook</h2>

      <div className="form-group">
        <label className="form-label" htmlFor="add-cuisine">Cuisine</label>
        <select
          id="add-cuisine"
          className="form-input"
          value={cuisineId}
          onChange={(e) => { setCuisineId(e.target.value); setRecipeId(""); }}
        >
          <option value="">All cuisines</option>
          {CUISINES.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="add-recipe">Recipe</label>
        <select
          id="add-recipe"
          className="form-input"
          value={recipeId}
          onChange={(e) => setRecipeId(e.target.value)}
          required
        >
          <option value="">Pick a recipe</option>
          {available.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.macros.calories} cal, {r.macros.protein}g protein)
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="add-servings">Servings eaten</label>
        <input
          id="add-servings"
          className="form-input"
          type="number"
          min="0.25"
          max="99"
          step="0.25"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
          required
        />
        {recipe && (
          <p className="track-hint">
            This batch makes {recipe.makes} servings. Logging {count || 0} of them.
          </p>
        )}
      </div>

      {recipe && count > 0 && (
        <div className="track-preview">
          {MACRO_FIELDS.map((f) => (
            <span className="cook-chip" key={f.key}>
              {round(recipe.macros[f.key] * count)} {f.unit === "kcal" ? "cal" : f.unit} {f.label.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      <button type="submit" className="track-submit" disabled={!recipe || count <= 0}>
        Add To Today
      </button>
    </form>
  );
}

/* ─── ADD MANUALLY ───────────────────────────────────────────────────── */
function ManualAdder({ onAdd }) {
  const blank = { name: "", servings: "1" };
  for (const key of NUTRIENT_KEYS) blank[key] = "";

  const [form, setForm] = useState(blank);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  function submit(e) {
    e.preventDefault();
    const count = Number(form.servings) || 0;
    if (!form.name.trim() || count <= 0) return;

    const entry = {
      name: form.name.trim(),
      servings: count,
      source: "manual",
      recipeId: null,
    };
    // Blank fields log as zero rather than blocking the entry.
    for (const key of NUTRIENT_KEYS) entry[key] = Number(form[key]) || 0;

    onAdd(entry);
    setForm(blank);
  }

  return (
    <form className="track-panel track-adder" onSubmit={submit}>
      <h2 className="cook-panel-title">Add Manually</h2>

      <div className="form-group">
        <label className="form-label" htmlFor="man-name">Food</label>
        <input
          id="man-name"
          className="form-input"
          type="text"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Greek yogurt, 200g"
          maxLength={120}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="man-servings">Servings</label>
        <input
          id="man-servings"
          className="form-input"
          type="number"
          min="0.25"
          max="99"
          step="0.25"
          value={form.servings}
          onChange={(e) => set("servings", e.target.value)}
          required
        />
      </div>

      <p className="track-hint">Enter values per serving. Leave anything you do not know blank.</p>

      <div className="track-manual-grid">
        {ALL_FIELDS.map((f) => (
          <div className="form-group track-target-field" key={f.key}>
            <label className="form-label" htmlFor={`man-${f.key}`}>
              {f.label} ({f.unit})
            </label>
            <input
              id={`man-${f.key}`}
              className="form-input"
              type="number"
              min="0"
              step="any"
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <button type="submit" className="track-submit">Add To Today</button>
    </form>
  );
}

/* ─── THE DAY'S ENTRIES ──────────────────────────────────────────────── */
function EntryList({ entries, onRemove }) {
  if (!entries.length) {
    return (
      <div className="portal-placeholder track-empty">
        <p className="portal-placeholder-text">Nothing logged yet today</p>
      </div>
    );
  }

  return (
    <section className="track-entries">
      <h2 className="cook-panel-title">Logged ({entries.length})</h2>
      {entries.map((entry) => {
        const t = entryTotals(entry);
        return (
          <div className="track-entry" key={entry.id}>
            <div className="track-entry-main">
              <span className="track-entry-name">{entry.name}</span>
              <span className="track-entry-meta">
                {entry.servings} {entry.servings === 1 ? "serving" : "servings"}
                {entry.source === "recipe" ? " · Cookbook" : " · Manual"}
              </span>
            </div>
            <div className="track-entry-macros">
              <span className="cook-chip">{t.calories} cal</span>
              <span className="cook-chip is-accent">{t.protein}g protein</span>
              <span className="cook-chip">{t.carbs}g carbs</span>
              <span className="cook-chip">{t.fat}g fat</span>
            </div>
            <button
              className="track-remove"
              onClick={() => onRemove(entry.id)}
              aria-label={`Remove ${entry.name}`}
            >
              Remove
            </button>
          </div>
        );
      })}
    </section>
  );
}
