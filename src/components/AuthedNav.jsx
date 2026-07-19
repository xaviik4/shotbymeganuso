import { useNavigate, NavLink, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Shared header for every page behind the auth gate.
 * Keeps the private tools (Cookbook, Tracker, Dashboard) on one consistent shell.
 */
export default function AuthedNav() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="portal-nav">
      <Link to="/cookbook" className="portal-logo">
        <span className="rec-dot portal-logo-dot" aria-hidden="true"></span>
        SHOTBYMEGANUSO
      </Link>

      <div className="portal-nav-actions">
        <NavLink
          to="/cookbook"
          className={({ isActive }) =>
            `portal-navlink${isActive ? " is-active" : ""}`
          }
        >
          Cookbook
        </NavLink>
        <NavLink
          to="/tracker"
          className={({ isActive }) =>
            `portal-navlink${isActive ? " is-active" : ""}`
          }
        >
          Tracker
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `portal-navlink${isActive ? " is-active" : ""}`
          }
        >
          Dashboard
        </NavLink>
        <button className="portal-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  );
}
