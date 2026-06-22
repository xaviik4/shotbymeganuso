import './About.css';

const STATS = [
  { num: '3+',     label: 'Years Shooting' },
  { num: '5+',     label: 'Years Editing' },
  { num: 'Canon',  label: 'R6 Mark II' },
  { num: '24h',    label: 'Response Time' },
];

export default function About() {
  return (
    <section id="about">
      <div className="max-w">
        <div className="about-inner">
          <div className="about-img-col">
            <div className="about-img-wrap">
              {/* SWAP: Replace with <img src="/images/headshot.jpg" alt="Alexander" /> */}
              <div className="about-img-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <span>Add Headshot</span>
              </div>
            </div>
            <div className="about-accent" />
          </div>

          <div className="about-content">
            <p className="section-eyebrow">About</p>
            <h2 className="section-title" style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}>WHO I AM</h2>
            <p className="about-bio">
              I'm <strong>Alexander</strong>, a photographer and videographer based in Corvallis, Oregon.
              I shoot automotive, editorial, lifestyle, and portrait work, focused on creating clean,
              cinematic content that actually looks good and holds attention.
            </p>
            <p className="about-bio">
              I care about the details: framing, light, color, and pacing. I bring that same intention to
              every shoot, whether it's a car edit, a live music set, or a portrait session. My goal is
              simple. Make the people and brands I work with look their best, and create content they're
              genuinely proud to share.
            </p>
            <div className="about-stats">
              {STATS.map(s => (
                <div className="stat-item" key={s.label}>
                  <div className="stat-num">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
