import Reveal from "./Reveal";
import { C } from "../lib/constants";

const SERVICES = [
  {
    num: "01", name: "Photography",
    desc: "Automotive, editorial, lifestyle, and portrait work. Every set is shot with a plan and finished with the full cinematic grade.",
    items: ["Automotive shoots", "Editorial & sports", "Lifestyle sets", "Portraits"],
  },
  {
    num: "02", name: "UGC & Video",
    desc: "Short-form content made for the feed. Hook-first, native pacing, cut for TikTok, Reels, and ads.",
    items: ["UGC ads & organic", "Brand reels", "Product demos", "Script to edit"],
  },
  {
    num: "03", name: "Web Design",
    desc: "Premium websites for small businesses. Live booking that syncs to your Google Calendar, every inquiry logged, local SEO, and accessibility built in.",
    items: ["Custom design & build", "Live booking systems", "Local SEO", "Monthly care plans"],
  },
];

export default function Services() {
  return (
    <section id="services" aria-labelledby="services-title" style={{ background: C.panel }}>
      <div className="section">
        <Reveal>
          <div className="sec-label">04 / Services</div>
          <h2 className="sec-title" id="services-title">What I Do</h2>
        </Reveal>

        <div className="svc-list">
          {SERVICES.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="svc-row">
                <span className="svc-num">/{s.num}</span>
                <h3 className="svc-name">{s.name}</h3>
                <div>
                  <p className="svc-desc">{s.desc}</p>
                  <div className="svc-items">
                    {s.items.map(it => <span className="svc-chip" key={it}>{it}</span>)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="featured">
            <div>
              <span className="featured-tag">Featured Build</span>
              <h3>Barbería de Rafi · Ceiba, PR</h3>
              <p>
                A full website for a five-barber shop in Puerto Rico. Customers book real appointment
                slots online with no account needed, and every booking lands on the owner's Google
                Calendar, gets logged to a spreadsheet, and triggers an email. Bilingual, mobile-first,
                and accessibility compliant.
              </p>
              <ul className="featured-list">
                <li>Live availability synced to Google Calendar</li>
                <li>Every booking and message logged automatically</li>
                <li>Built-in promos, reviews engine, and WhatsApp</li>
                <li>WCAG 2.1 AA accessible</li>
              </ul>
            </div>
            <div className="featured-visual">
              <span aria-hidden="true">💈</span>
              <small>SCREENSHOT: rafi-site.webp</small>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
