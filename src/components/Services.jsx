import './Services.css';

const SERVICES = [
  {
    num: '01',
    title: 'Product Photography',
    desc: 'Clean studio shots, lifestyle context, and detail-rich imagery that converts browsers into buyers. Optimized for e-commerce, ads, and social.',
  },
  {
    num: '02',
    title: 'UGC Video',
    desc: 'Authentic, scroll-stopping short-form video for paid ads and organic. Raw feel, strategic hook. Built for TikTok, Reels, and Meta ad sets.',
  },
  {
    num: '03',
    title: 'Brand Content',
    desc: 'Full creative packages for automotive, fitness, and lifestyle brands — from on-location shoots to edited deliverables ready to publish.',
  },
];

export default function Services() {
  return (
    <section id="services" className="services-section">
      <div className="max-w">
        <p className="section-eyebrow">What I Offer</p>
        <h2 className="section-title">SERVICES</h2>
        <p className="section-sub">Built for brands that need content that actually performs.</p>
        <div className="services-grid">
          {SERVICES.map(s => (
            <div className="service-card" key={s.num}>
              <div className="service-num">{s.num}</div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.desc}</p>
              <a
                href="#contact"
                className="service-link"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get a Quote →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
