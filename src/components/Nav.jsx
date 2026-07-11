import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { C } from "../lib/constants";

/**
 * Nav links.
 * - `to`   → React Router route (top-level pages)
 * - `hash` → section on the Home page (about, contact, etc.)
 */
const NAV_LINKS = [
  { label: "Home",    to: "/" },
  { label: "Work",    to: "/work" },
  { label: "Pricing", to: "/pricing" },
  { label: "About",   hash: "about" },
  { label: "Contact", hash: "contact" },
];

export default function Nav({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // For hash links: if not on Home, navigate to Home then scroll.
  const handleHashClick = (hash) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 120);
    } else {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // For "Book a Shoot" CTA — always goes to Contact
  const goToContact = (e) => {
    e.preventDefault();
    handleHashClick("contact")(e);
  };

  const renderLink = (l, isMobile = false) => {
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
        <Link to="/" className="nav-logo">
          <span className="rec-dot" aria-hidden="true"></span>
          SHOTBYMEGANUSO
          <span className="mono">REC</span>
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map(l => renderLink(l))}
          <a href="#contact" className="nav-cta" onClick={goToContact}>
            Book a Shoot
          </a>
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

        <a
          href="#contact"
          style={{ color: C.orange }}
          onClick={goToContact}
        >
          Book a Shoot
        </a>
      </div>
    </>
  );
}
