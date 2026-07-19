import { useState } from "react";
import AuthedNav from "../components/AuthedNav";
import Reveal from "../components/Reveal";
import { CUISINES, recipesByCuisine } from "../lib/recipes";
import { MACRO_FIELDS, MICRO_FIELDS, nutritionFromRecipe } from "../lib/nutrition";

export default function Cookbook() {
  // Two levels of drill down. null at both = the cuisine grid.
  const [cuisine, setCuisine] = useState(null);
  const [recipe, setRecipe] = useState(null);

  function openCuisine(c) {
    setCuisine(c);
    setRecipe(null);
    window.scrollTo(0, 0);
  }

  function openRecipe(r) {
    setRecipe(r);
    window.scrollTo(0, 0);
  }

  return (
    <div className="portal-page">
      <AuthedNav />

      <main className="portal-body cook-body">
        {/* Breadcrumb doubles as the back navigation */}
        <nav className="cook-crumbs" aria-label="Breadcrumb">
          <button
            className="cook-crumb"
            onClick={() => {
              setCuisine(null);
              setRecipe(null);
            }}
          >
            Cookbook
          </button>
          {cuisine && (
            <>
              <span className="cook-crumb-sep" aria-hidden="true">/</span>
              <button className="cook-crumb" onClick={() => setRecipe(null)}>
                {cuisine.name}
              </button>
            </>
          )}
          {recipe && (
            <>
              <span className="cook-crumb-sep" aria-hidden="true">/</span>
              <span className="cook-crumb is-current">{recipe.name}</span>
            </>
          )}
        </nav>

        {!cuisine && <CuisineGrid onOpen={openCuisine} />}
        {cuisine && !recipe && <RecipeList cuisine={cuisine} onOpen={openRecipe} />}
        {recipe && <RecipeDetail recipe={recipe} cuisine={cuisine} />}
      </main>
    </div>
  );
}

/* ─── RECIPE IMAGE ───────────────────────────────────────────────────── */
/* Every recipe points at /images/Cookbook/<id>.jpg. Those files are not in the
   repo yet, so until they are, a failed load falls back to a tinted tile
   rather than a broken-image icon. Dropping the real photos into
   public/images/Cookbook/ needs no code change — they simply stop erroring. */
function RecipeImage({ recipe, cuisine, className, decorative }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    /* Hue is derived from the cuisine id so each section reads distinctly,
       while staying inside the site's dark palette. */
    const hue = [...recipe.cuisine].reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
    return (
      <div
        className={`${className} cook-img-fallback`}
        style={{ "--fallback-hue": hue }}
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : recipe.name}
        aria-hidden={decorative ? "true" : undefined}
      >
        <span className="cook-img-fallback-text">
          {cuisine?.name || recipe.cuisine.replace("-", " ")}
        </span>
      </div>
    );
  }

  return (
    <img
      className={className}
      src={recipe.image}
      alt={decorative ? "" : recipe.name}
      aria-hidden={decorative ? "true" : undefined}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ─── LANDING: cuisine grid ──────────────────────────────────────────── */
function CuisineGrid({ onOpen }) {
  return (
    <>
      <Reveal>
        <p className="portal-label">Private Collection</p>
        <h1 className="portal-title">Cookbook</h1>
        <p className="portal-sub">
          Recipes built for a cut. High protein, calorie conscious, whole ingredients,
          portioned per serving. Pick a cuisine to start.
        </p>
      </Reveal>

      <div className="cook-grid">
        {CUISINES.map((c, i) => (
          <Reveal key={c.id} delay={i * 40}>
            <button className="cook-card" onClick={() => onOpen(c)}>
              <span className="cook-card-name">{c.name}</span>
              <span className="cook-card-note">{c.note}</span>
              <span className="cook-card-arrow" aria-hidden="true">→</span>
            </button>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/* ─── LEVEL 2: recipes inside one cuisine ────────────────────────────── */
function RecipeList({ cuisine, onOpen }) {
  const list = recipesByCuisine(cuisine.id);

  return (
    <>
      <Reveal>
        <p className="portal-label">{cuisine.note}</p>
        <h1 className="portal-title">{cuisine.name}</h1>
        <p className="portal-sub">
          {list.length} {list.length === 1 ? "recipe" : "recipes"} in this section.
        </p>
      </Reveal>

      {/* Without this the chips read as batch totals, since "Makes 4" sits
          right beside them. The detail view says so too, but by then the
          reader has already done the division. */}
      <p className="cook-unit-note">Nutrition shown per serving.</p>

      <div className="cook-list">
        {list.map((r, i) => {
          const n = nutritionFromRecipe(r);
          return (
            <Reveal key={r.id} delay={i * 50}>
              <button className="cook-row" onClick={() => onOpen(r)}>
                <RecipeImage
                  recipe={r}
                  cuisine={cuisine}
                  className="cook-row-img"
                  decorative
                />
                <div className="cook-row-main">
                  <span className="cook-row-name">{r.name}</span>
                  <span className="cook-row-blurb">{r.blurb}</span>
                </div>
                <div className="cook-row-meta">
                  <span className="cook-chip">{n.calories} cal</span>
                  <span className="cook-chip is-accent">{n.protein}g protein</span>
                  <span className="cook-chip">Makes {r.makes}</span>
                </div>
              </button>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

/* ─── LEVEL 3: a single recipe ───────────────────────────────────────── */
function RecipeDetail({ recipe, cuisine }) {
  /* Same helper the calculator uses, so both read the recipe identically. */
  const n = nutritionFromRecipe(recipe);

  return (
    <article className="cook-recipe">
      <Reveal>
        <p className="portal-label">{cuisine.name}</p>
        <h1 className="portal-title">{recipe.name}</h1>
        <p className="portal-sub">{recipe.blurb}</p>
      </Reveal>

      <Reveal delay={40}>
        <RecipeImage recipe={recipe} cuisine={cuisine} className="cook-hero" />
      </Reveal>

      <Reveal delay={60}>
        <p className="cook-unit-note">
          Per serving. This batch makes {recipe.makes} servings. Values are estimates.
        </p>
        <div className="cook-macros">
          {MACRO_FIELDS.map((f) => (
            <Macro
              key={f.key}
              label={f.label}
              value={n[f.key]}
              unit={f.unit}
              accent={f.accent}
            />
          ))}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="cook-micros">
          {MICRO_FIELDS.map((f) => (
            <div className="cook-micro" key={f.key}>
              <span className="cook-micro-label">{f.label}</span>
              <span className="cook-micro-value">
                {n[f.key]}
                <em>{f.unit}</em>
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="cook-times">
          <span className="cook-time"><em>Prep</em> {recipe.prep}</span>
          <span className="cook-time"><em>Cook</em> {recipe.cook}</span>
          <span className="cook-time"><em>Makes</em> {recipe.makes} servings</span>
        </div>
      </Reveal>

      <div className="cook-cols">
        <Reveal delay={140}>
          <section className="cook-panel">
            <h2 className="cook-panel-title">Ingredients</h2>
            <ul className="cook-ingredients">
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={180}>
          <section className="cook-panel">
            <h2 className="cook-panel-title">Method</h2>
            <ol className="cook-steps">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="cook-step-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="cook-step-text">{step}</span>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>
      </div>
    </article>
  );
}

function Macro({ label, value, unit, accent }) {
  return (
    <div className={`cook-macro${accent ? " is-accent" : ""}`}>
      <span className="cook-macro-label">{label}</span>
      <span className="cook-macro-value">
        {value}
        <em>{unit}</em>
      </span>
    </div>
  );
}
