import { Link } from "react-router-dom";
import { SITE_CONFIG, SOCIALS } from "../lib/site-config";
import { useSiteCopy, localizedPath } from "../lib/language";
import { trackLead } from "../lib/analytics";

export default function Hero() {
  const { copy, language } = useSiteCopy();
  const c = copy.hero;
  return (
    <section className="hero" id="top" aria-label="Introduction">
      <div className="hero-meta mono fade-up" style={{ animationDelay: "0.1s" }}>
        <span className="rec-dot" aria-hidden="true"></span>
        <span>{c.eyebrow}</span>
      </div>

      <h1 className="hero-title fade-up" style={{ animationDelay: "0.2s" }}>
        {c.headline[0]}<br />{c.headline[1]}<br /><em>{c.headline[2]}</em>
      </h1>

      <p className="hero-sub fade-up" style={{ animationDelay: "0.35s" }}>
        {c.description}
      </p>

      <div className="hero-actions fade-up" style={{ animationDelay: "0.5s" }}>
        <a href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary" onClick={() => trackLead("booking_click")}>{c.book}</a>
        <Link to={localizedPath("/work", language)} className="btn-outline">{c.work}</Link>
      </div>

      <div className="hero-socials fade-up" style={{ animationDelay: "0.6s" }}>
        <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
        <a href={SOCIALS.tiktok}    target="_blank" rel="noopener noreferrer">TIKTOK</a>
        <a href={SOCIALS.youtube}   target="_blank" rel="noopener noreferrer">YOUTUBE</a>
      </div>
    </section>
  );
}
