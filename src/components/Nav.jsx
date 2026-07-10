import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { C } from "../lib/constants";

const NAV_LINKS = [
  { label: "The Grade", href: "#grade" },
  { label: "Work",      href: "#work" },
  { label: "Services",  href: "#services" },
  { label: "About",     href: "#about" },
  { label: "FAQ",       href: "#faq" },
];

export default function Nav({ menuOpen, setMenuOpen }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <nav className={`nav${scrolled ? " scrolled" : ""}`} aria-label="Main navigation">
        <a href="#top" className="nav-logo">
          <span className="rec-dot" aria-hidden="true"></span>
          SHOTBYMEGANUSO
          <span className="mono">REC</span>
        </a>

        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
          {/* Router link — same visual style as the other nav links */}
          <Link to="/clients" className="nav-link-clients">Clients</Link>
          <a href="#contact" className="nav-cta">Book a Shoot</a>
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

        {NAV_LINKS.map(l => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
        ))}

        <Link
          to="/clients"
          onClick={() => setMenuOpen(false)}
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: 4 }}
        >
          Clients
        </Link>

        <a
          href="#contact"
          style={{ color: C.orange }}
          onClick={() => setMenuOpen(false)}
        >
          Book a Shoot
        </a>
      </div>
    </>
  );
}
