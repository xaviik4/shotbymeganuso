import { Link } from "react-router-dom";
import { SOCIALS, EMAIL } from "../lib/constants";

export default function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-logo">
          <span className="rec-dot" aria-hidden="true"></span>
          SHOTBYMEGANUSO
        </div>
        <div className="footer-links">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={`mailto:${EMAIL}`}>Email</a>
          <Link to="/clients">Client Portal</Link>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "#777" }}>
          © {new Date().getFullYear()} ALEXANDER · EN / ES
        </span>
      </div>
      <p className="footer-a11y">
        ♿ Built to WCAG 2.1 AA accessibility standards. Found a barrier? Email me and I'll fix it.
      </p>
    </footer>
  );
}
