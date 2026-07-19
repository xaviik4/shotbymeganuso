import { useState, useMemo } from "react";
import AuthedNav from "../components/AuthedNav";
import { CUISINES, RECIPES, recipesByCuisine } from "../lib/recipes";
import {
  CALC_FIELDS, CALC_KEYS, nutritionFromRecipe, sumEntries, entryTotals, round,
} from "../lib/nutrition";

/* A calculator, not a log. Nothing is saved — no Supabase, no localStorage —
   so closing the tab clears it. That is the point: add what you ate, read the
   total, move on. */

let nextId = 1;

export default function Tracker() {
  const [entries, setEntries] = useState([]);

  const totals = useMemo(() => sumEntries(entries, CALC_KEYS), [entries]);

  function addEntry(entry) {
    setEntries((prev) => [{ ...entry, id: nextId++ }, ...prev]);
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="portal-page">
      <AuthedNav />

      <main className="portal-body track-body">
        <p className="portal-label">Calories &amp; Protein</p>
        <h1 className="portal-title">Calculator</h1>
        <p className="portal-sub">
          Add recipes from the cookbook or type in anything with a label. Totals
          are for this session only — nothing is saved.
        </p>

        <TotalsPanel
          totals={totals}
          count={entries.length}
          onClear={() => setEntries([])}
        />

        <div className="track-adders">
          <RecipeAdder onAdd={addEntry} />
          <QuickAdder onAdd={addEntry} />
        </div>

        <EntryList entries={entries} onRemove={removeEntry} />
      </main>
    </div>
  );
}

/* ─── TOTALS ─────────────────────────────────────────────────────────── */
function TotalsPanel({ totals, count, onClear }) {
  return (
    <div className="track-panel">
      <div className="track-panel-head">
        <div className="track-panel-title">
          <p className="portal-label">Running Total</p>
        </div>
        {count > 0 && (
          <button className="track-edit" onClick={onClear}>
            Clear All
          </button>
        )}
      </div>

      <div className="track-macros">
        {CALC_FIELDS.map((f) => (
          <div className="track-dial is-accent" key={f.key}>
            <span className="track-dial-label">{f.label}</span>
            <span className="track-dial-value">
              {totals[f.key]}
              <em>{f.unit}</em>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ADD FROM THE COOKBOOK ──────────────────────────────────────────── */
function RecipeAdder({ onAdd }) {
  const [cuisineId, setCuisineId] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [servings, setServings] = useState(1);

  const list = cuisineId ? recipesByCuisine(cuisineId) : RECIPES;
  const recipe = RECIPES.find((r) => r.id === recipeId) || null;
  const count = Number(servings) || 0;

  function submit(e) {
    e.preventDefault();
    if (!recipe || count <= 0) return;

    onAdd({
      name: recipe.name,
      servings: count,
      source: "recipe",
      ...nutritionFromRecipe(recipe),
    });

    // Clear the recipe too, so a second submit cannot silently double-add.
    setRecipeId("");
    setServings(1);
  }

  return (
    <form className="track-adder" onSubmit={submit}>
      <h2 className="cook-panel-title">From the Cookbook</h2>

      <div className="form-group">
        <label className="form-label" htmlFor="calc-cuisine">Cuisine</label>
        <select
          id="calc-cuisine"
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
        <label className="form-label" htmlFor="calc-recipe">Recipe</label>
        <select
          id="calc-recipe"
          className="form-input"
          value={recipeId}
          onChange={(e) => setRecipeId(e.target.value)}
        >
          <option value="">Pick a recipe</option>
          {list.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {r.macros.calories} cal, {r.macros.protein}g protein
              {" "}per serving
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="calc-servings">Servings</label>
        <input
          id="calc-servings"
          className="form-input"
          type="number"
          min="0.25"
          step="0.25"
          value={servings}
          onChange={(e) => setServings(e.target.value)}
        />
      </div>

      {recipe && count > 0 && (
        <p className="track-preview">
          {CALC_FIELDS.map((f) => (
            <span className="cook-chip" key={f.key}>
              {round(recipe.macros[f.key] * count)} {f.unit} {f.label.toLowerCase()}
            </span>
          ))}
        </p>
      )}

      <button className="track-submit" type="submit" disabled={!recipe || count <= 0}>
        Add Recipe
      </button>
    </form>
  );
}

/* ─── ADD ANYTHING ELSE ──────────────────────────────────────────────── */
/* Protein bars, a shake, whatever is on a label. One serving of the thing you
   typed, so there is no servings field to get wrong. */
function QuickAdder({ onAdd }) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  const valid = name.trim().length > 0;

  function submit(e) {
    e.preventDefault();
    if (!valid) return;

    onAdd({
      name: name.trim(),
      servings: 1,
      source: "manual",
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
    });

    setName("");
    setCalories("");
    setProtein("");
  }

  return (
    <form className="track-adder" onSubmit={submit}>
      <h2 className="cook-panel-title">Anything Else</h2>

      <div className="form-group">
        <label className="form-label" htmlFor="calc-name">What was it</label>
        <input
          id="calc-name"
          className="form-input"
          type="text"
          placeholder="Protein bar"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="track-quick-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="calc-cal">Calories</label>
          <input
            id="calc-cal"
            className="form-input"
            type="number"
            min="0"
            placeholder="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="calc-pro">Protein (g)</label>
          <input
            id="calc-pro"
            className="form-input"
            type="number"
            min="0"
            placeholder="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
          />
        </div>
      </div>

      <p className="track-hint">Straight off the label. No servings math.</p>

      <button className="track-submit" type="submit" disabled={!valid}>
        Add Item
      </button>
    </form>
  );
}

/* ─── WHAT'S BEEN ADDED ──────────────────────────────────────────────── */
function EntryList({ entries, onRemove }) {
  if (entries.length === 0) {
    return (
      <div className="portal-placeholder track-empty">
        <p className="portal-placeholder-text">Nothing added yet</p>
      </div>
    );
  }

  return (
    <div className="track-entries">
      {entries.map((entry) => {
        const t = entryTotals(entry, CALC_KEYS);
        return (
          <div className="track-entry" key={entry.id}>
            <div className="track-entry-main">
              <span className="track-entry-name">{entry.name}</span>
              <span className="track-entry-meta">
                {entry.servings} {entry.servings === 1 ? "serving" : "servings"}
                {" · "}
                {entry.source === "recipe" ? "Cookbook" : "Manual"}
              </span>
            </div>
            <div className="track-entry-macros">
              <span className="cook-chip">{t.calories} cal</span>
              <span className="cook-chip is-accent">{t.protein}g protein</span>
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
    </div>
  );
}
