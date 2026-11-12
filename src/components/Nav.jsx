import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { C } from "../lib/constants";
import { SITE_CONFIG } from "../lib/site-config";
import { useSiteCopy, localizedPath } from "../lib/language";
import { trackLead } from "../lib/analytics";

/**
 * Nav links.
 * - `to`   → React Router route (top-level pages)
 * - `hash` → section on the Home page (about, contact, etc.)
 */
export default function Nav({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { copy, language } = useSiteCopy();
  const NAV_LINKS = [
    { label: copy.nav.home, to: localizedPath("/", language) },
    { label: copy.nav.work, to: localizedPath("/work", language) },
    { label: copy.nav.pricing, to: localizedPath("/pricing", language) },
    { label: copy.nav.about, hash: "about" },
    { label: copy.nav.contact, hash: "contact" },
  ];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // For hash links: if not on Home, navigate to Home then scroll.
  const handleHashClick = (hash) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    const homePath = localizedPath("/", language);
    if (location.pathname !== homePath) {
      navigate(homePath);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderLink = (l) => {
    const closeMenu = () => setMenuOpen(false);
    if (l.to) {
      return (
        <Link key={l.label} to={l.to} onClick={closeMenu}>
          {l.label}
        </Link>
      );
    }
    return (
      <a
        key={l.label}
        href={`#${l.hash}`}
        onClick={handleHashClick(l.hash)}
      >
        {l.label}
      </a>
    );
  };

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Main navigation">
        <Link to={localizedPath("/", language)} className="nav-logo">
          <span className="rec-dot" aria-hidden="true"></span>
          {SITE_CONFIG.brandName.toUpperCase()}
          <span className="mono">REC</span>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map(l => renderLink(l))}
          <a href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer" className="nav-cta" onClick={() => trackLead("booking_click")}>{copy.nav.bookCall}</a>
          <Link className="nav-language" to={localizedPath(location.pathname.replace(/^\/es(?=\/|$)/, "") || "/", language === "es" ? "en" : "es")} aria-label={`Switch language to ${copy.nav.language}`}>{copy.nav.language}</Link>
        </div>

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`mobile-drawer${menuOpen ? " open" : ""}`}
        role="dialog"
        aria-label="Mobile menu"
        aria-hidden={!menuOpen}
      >
        <button
          className="mobile-drawer-close"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          ✕
        </button>

        {NAV_LINKS.map(l => renderLink(l, true))}

        <a href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer" style={{ color: C.orange }} onClick={() => trackLead("booking_click")}>{copy.nav.bookCall}</a>
        <Link className="nav-language" to={localizedPath(location.pathname.replace(/^\/es(?=\/|$)/, "") || "/", language === "es" ? "en" : "es")}>{copy.nav.language}</Link>
      </div>
    </>
  );
}
