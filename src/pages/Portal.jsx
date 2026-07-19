import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthedNav from "../components/AuthedNav";
import Reveal from "../components/Reveal";
import { useAuth } from "../context/AuthContext";
import { fetchAccessibleAccountId, fetchLatest } from "../lib/content";

/* The landing page behind the login. Everything private hangs off here, so no
   one tool has to double as the home page. */

const TOOLS = [
  {
    to: "/dashboard",
    name: "Dashboard",
    note: "YouTube and Instagram performance, synced daily",
    gated: true,
  },
  {
    to: "/cookbook",
    name: "Cookbook",
    note: "High protein recipes, portioned per serving",
  },
  {
    to: "/tracker",
    name: "Calculator",
    note: "Add up calories and protein for the day",
  },
];

export default function Portal() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const userId = session?.user?.id;

  /* undefined while we work out whether this account has any content stats,
     so the Dashboard card never flashes in and then vanishes. */
  const [hasStats, setHasStats] = useState(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!userId) return;

    (async () => {
      try {
        const accountId = await fetchAccessibleAccountId(userId);
        const latest = await fetchLatest(accountId);
        if (!cancelled) setHasStats(latest.length > 0 || accountId === userId);
      } catch {
        // A client with no grant reads nothing under RLS, which is not an
        // error worth showing on a menu page — just hide the card.
        if (!cancelled) setHasStats(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  const tools = TOOLS.filter((t) => !t.gated || hasStats);

  return (
    <div className="portal-page">
      <AuthedNav />

      <main className="portal-body">
        <Reveal>
          <p className="portal-label">Private Tools</p>
          <h1 className="portal-title">Portal</h1>
          <p className="portal-sub">Pick where you are headed.</p>
        </Reveal>

        <div className="cook-grid">
          {tools.map((tool, i) => (
            <Reveal key={tool.to} delay={i * 40}>
              <button className="cook-card" onClick={() => navigate(tool.to)}>
                <span className="cook-card-name">{tool.name}</span>
                <span className="cook-card-note">{tool.note}</span>
                <span className="cook-card-arrow" aria-hidden="true">→</span>
              </button>
            </Reveal>
          ))}
        </div>
      </main>
    </div>
  );
}
