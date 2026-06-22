import { useState, useEffect } from 'react';
import './Nav.css';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    closeMenu();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, menuOpen ? 300 : 0);
  };

  return (
    <>
      <nav className={scrolled ? 'scrolled' : ''}>
        <a href="#hero" className="nav-logo" onClick={(e) => handleNavClick(e, 'hero')}>
          SHOTBYMEGANUSO
        </a>
        <ul className="nav-links">
          <li><a href="#reel"      onClick={(e) => handleNavClick(e, 'reel')}>Reel</a></li>
          <li><a href="#portfolio" onClick={(e) => handleNavClick(e, 'portfolio')}>Work</a></li>
          <li><a href="#services"  onClick={(e) => handleNavClick(e, 'services')}>Services</a></li>
          <li><a href="#about"     onClick={(e) => handleNavClick(e, 'about')}>About</a></li>
          <li><a href="#contact"   onClick={(e) => handleNavClick(e, 'contact')} className="nav-cta">Let's Build</a></li>
        </ul>
        <button
          className={`hamburger${menuOpen ? ' open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu — rendered in DOM always, visibility via CSS */}
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <a href="#reel"      onClick={(e) => handleNavClick(e, 'reel')}>Reel</a>
        <a href="#portfolio" onClick={(e) => handleNavClick(e, 'portfolio')}>Work</a>
        <a href="#services"  onClick={(e) => handleNavClick(e, 'services')}>Services</a>
        <a href="#about"     onClick={(e) => handleNavClick(e, 'about')}>About</a>
        <a href="#contact"   onClick={(e) => handleNavClick(e, 'contact')} className="accent">Work with Me</a>
      </div>
    </>
  );
}
