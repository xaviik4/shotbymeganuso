import { SOCIALS } from "../lib/constants";

export default function Hero() {
  return (
    <section className="hero" id="top" aria-label="Introduction">
      <div className="hero-meta mono fade-up" style={{ animationDelay: "0.1s" }}>
        <span className="rec-dot" aria-hidden="true"></span>
        <span>ALEXANDER · PHOTO / VIDEO / WEB</span>
      </div>

      <h1 className="hero-title fade-up" style={{ animationDelay: "0.2s" }}>
        Content for brands<br />that refuse<br />to <em>blend in.</em>
      </h1>

      <p className="hero-sub fade-up" style={{ animationDelay: "0.35s" }}>
        Cinematic photo and video with a dark, graded look you can spot from across the feed.
        Shot with intention, delivered fast, in English y español.
      </p>

      <div className="hero-actions fade-up" style={{ animationDelay: "0.5s" }}>
        <a href="#work" className="btn-primary">View Work</a>
        <a href="#contact" className="btn-outline">Start a Project</a>
      </div>

      <div className="hero-socials fade-up" style={{ animationDelay: "0.6s" }}>
        <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">INSTAGRAM</a>
        <a href={SOCIALS.tiktok}    target="_blank" rel="noopener noreferrer">TIKTOK</a>
        <a href={SOCIALS.youtube}   target="_blank" rel="noopener noreferrer">YOUTUBE</a>
      </div>
    </section>
  );
}
