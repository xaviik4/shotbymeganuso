import './About.css';

const STATS = [
  { num: '3+',     label: 'Years Shooting' },
  { num: '50+',    label: 'Brands Worked With' },
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
              I'm <strong>Alexander</strong> — a content creator and visual storyteller based in Santa Barbara, CA.
              I specialize in <strong>product, automotive, and fitness/lifestyle photography and videography</strong> for
              brands that want content that actually converts.
            </p>
            <p className="about-bio">
              With a background in engineering and a sharp eye for detail, I bring both{' '}
              <strong>technical precision and creative instinct</strong> to every shoot. Whether it's a clean product
              flat lay, a cinematic car edit, or a high-energy UGC ad — I make brands look their best.
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
