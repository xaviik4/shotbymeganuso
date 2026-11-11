import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SECTIONS = [
  { heading: "Overview", links: [{ to: "/dashboard", label: "Dashboard", icon: "◫" }] },
  { heading: "Sell", links: [{ to: "/dashboard/pipeline", label: "Pipeline", icon: "◎" }, { to: "/dashboard/clients", label: "Clients", icon: "▦" }] },
  { heading: "Grow", links: [{ to: "/book", label: "Intake form", icon: "↗" }, { to: "/dashboard/content", label: "Content", icon: "▤" }] },
];

export default function OperationsLayout({ active, children }) {
  const [open, setOpen] = useState(false);
  const { session } = useAuth();
  const close = () => setOpen(false);

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
        <nav className="ops-menu" aria-label="Operations navigation">
          {SECTIONS.map((section) => (
            <section className="ops-menu-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.links.map((link) => (
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
            <span><strong>{session?.user?.email || "Signed in"}</strong><small>Workspace member</small></span>
          </div>
        </div>
      </aside>
      <div className="ops-main">{children}</div>
    </div>
  );
}
