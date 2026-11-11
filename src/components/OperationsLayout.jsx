import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SECTIONS = [
  { heading: "Overview", links: [{ to: "/dashboard", label: "Dashboard", icon: "◫" }] },
  { heading: "Sell", links: [{ to: "/dashboard/pipeline", label: "Pipeline", icon: "◎" }, { to: "/dashboard/clients", label: "Clients", icon: "▦" }] },
  { heading: "Grow", links: [{ to: "/book", label: "Intake form", icon: "↗", newTab: true }, { to: "/dashboard/content", label: "Content", icon: "▤" }] },
];

export default function OperationsLayout({ active, children }) {
  const [open, setOpen] = useState(false);
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const close = () => setOpen(false);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      close();
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="ops-shell">
      <button className="ops-mobile-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle dashboard navigation">
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
        <span>Operations</span>
      </button>
      {open && <button className="ops-scrim" aria-label="Close dashboard navigation" onClick={close} />}
      <aside className={`ops-sidebar${open ? " is-open" : ""}`}>
        <NavLink to="/dashboard" className="ops-brand" onClick={close}>
          <span className="ops-brand-mark" aria-hidden="true">m</span>
          <span><strong>meganusopr</strong><small>Operations</small></span>
        </NavLink>
        <Link to="/" className="ops-back-link" onClick={close}>← Back to site</Link>
        <nav className="ops-menu" aria-label="Operations navigation">
          {SECTIONS.map((section) => (
            <section className="ops-menu-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.links.map((link) => (
                link.newTab ? (
                  <a
                    key={link.to}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ops-nav-link"
                    onClick={close}
                  >
                    <span className="ops-nav-icon" aria-hidden="true">{link.icon}</span>
                    {link.label}<span className="ops-new-tab-mark" aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === "/dashboard"}
                    className={({ isActive }) => `ops-nav-link${isActive || active === link.label.toLowerCase() ? " is-active" : ""}`}
                    onClick={close}
                  >
                    <span className="ops-nav-icon" aria-hidden="true">{link.icon}</span>
                    {link.label}
                  </NavLink>
                )
              ))}
            </section>
          ))}
        </nav>
        <div className="ops-sidebar-bottom">
          <NavLink to="/dashboard/settings" className={({ isActive }) => `ops-nav-link${isActive || active === "settings" ? " is-active" : ""}`} onClick={close}>
            <span className="ops-nav-icon" aria-hidden="true">⚙</span>Settings
          </NavLink>
          <div className="ops-account">
            <span className="ops-avatar" aria-hidden="true">{(session?.user?.email || "A").slice(0, 1).toUpperCase()}</span>
            <span className="ops-account-copy"><strong>{session?.user?.email || "Signed in"}</strong><small>Operations access</small></span>
            <button type="button" className="ops-logout" onClick={handleSignOut}>Log out</button>
          </div>
        </div>
      </aside>
      <div className="ops-main">{children}</div>
    </div>
  );
}
