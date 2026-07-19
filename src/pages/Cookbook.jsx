import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Reveal from "../components/Reveal";
import { CUISINES, recipesByCuisine, recipeCount } from "../lib/recipes";

export default function Cookbook() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Two levels of drill down. null at both = the cuisine grid.
  const [cuisine, setCuisine] = useState(null);
  const [recipe, setRecipe] = useState(null);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

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
      {/* Reuses the portal nav so the authed area stays consistent */}
      <header className="portal-nav">
        <Link to="/clients" className="portal-logo">
          <span className="rec-dot portal-logo-dot" aria-hidden="true"></span>
          SHOTBYMEGANUSO
        </Link>
        <button className="portal-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </header>

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
              <span className="cook-card-count">
                {String(recipeCount(c.id)).padStart(2, "0")}
              </span>
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

      <div className="cook-list">
        {list.map((r, i) => (
          <Reveal key={r.id} delay={i * 50}>
            <button className="cook-row" onClick={() => onOpen(r)}>
              <div className="cook-row-main">
                <span className="cook-row-name">{r.name}</span>
                <span className="cook-row-blurb">{r.blurb}</span>
              </div>
              <div className="cook-row-meta">
                <span className="cook-chip">{r.macros.calories} cal</span>
                <span className="cook-chip is-accent">{r.macros.protein}g protein</span>
                <span className="cook-chip">{r.cook}</span>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/* ─── LEVEL 3: a single recipe ───────────────────────────────────────── */
function RecipeDetail({ recipe, cuisine }) {
  const m = recipe.macros;

  return (
    <article className="cook-recipe">
      <Reveal>
        <p className="portal-label">{cuisine.name}</p>
        <h1 className="portal-title">{recipe.name}</h1>
        <p className="portal-sub">{recipe.blurb}</p>
      </Reveal>

      <Reveal delay={60}>
        <div className="cook-macros">
          <Macro label="Calories" value={m.calories} unit="kcal" accent />
          <Macro label="Protein" value={m.protein} unit="g" accent />
          <Macro label="Carbs" value={m.carbs} unit="g" />
          <Macro label="Fat" value={m.fat} unit="g" />
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="cook-times">
          <span className="cook-time"><em>Prep</em> {recipe.prep}</span>
          <span className="cook-time"><em>Cook</em> {recipe.cook}</span>
          <span className="cook-time"><em>Serves</em> {recipe.serves}</span>
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
