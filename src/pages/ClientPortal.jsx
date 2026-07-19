import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ClientPortal() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="portal-page">
      {/* Portal nav */}
      <header className="portal-nav">
        <Link to="/" className="portal-logo">
          <span className="rec-dot portal-logo-dot" aria-hidden="true"></span>
          SHOTBYMEGANUSO
        </Link>
        <div className="portal-nav-actions">
          <Link to="/cookbook" className="portal-navlink">
            Cookbook
          </Link>
          <button className="portal-signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Portal content */}
      <main className="portal-body">
        <p className="portal-label">Client Portal</p>
        <h1 className="portal-title">Client Gallery</h1>
        <p className="portal-sub">
          Your delivered assets will appear here. Each project gets its own organized
          section with full-resolution downloads.
        </p>

        {/* Placeholder — swap this out when you add real deliverables */}
        <div className="portal-placeholder">
          <div className="portal-placeholder-icon" aria-hidden="true">🎞️</div>
          <p className="portal-placeholder-text">No deliverables yet · Check back soon</p>
        </div>

        {/* Private tools */}
        <Link to="/cookbook" className="portal-tile">
          <span className="portal-tile-label">Private</span>
          <span className="portal-tile-name">Cookbook</span>
          <span className="portal-tile-desc">
            Cutting friendly recipes across 16 cuisines, organized and portioned.
          </span>
          <span className="portal-tile-arrow" aria-hidden="true">→</span>
        </Link>

        {/* Logged-in user indicator */}
        {session?.user?.email && (
          <div className="portal-user">
            <span className="portal-user-dot" aria-hidden="true"></span>
            {session.user.email}
          </div>
        )}
      </main>
    </div>
  );
}
