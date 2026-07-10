import Reveal from "./Reveal";
import { C } from "../lib/constants";

const STATS = [
  { num: "3+",      label: "Years Shooting" },
  { num: "5+",      label: "Years Editing" },
  { num: "R6 MK II", label: "Canon Body" },
  { num: "24h",     label: "Response Time" },
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" style={{ background: C.panel }}>
      <div className="section">
        <div className="about-wrap">
          <Reveal>
            <div
              className="about-visual"
              role="img"
              aria-label="Portrait placeholder, swap with a photo of Alexander"
            />
          </Reveal>

          <Reveal delay={120}>
            <div>
              <div className="sec-label">06 / Behind the Lens</div>
              <h2 className="sec-title" id="about-title">I'm Alexander</h2>
              <p className="about-text" style={{ marginTop: 18 }}>
                I shoot the kind of content I want to see: dark, cinematic, and intentional.
                Automotive, editorial, lifestyle, and portrait work, with an engineer's eye for
                getting the details right.
              </p>
              <p className="about-text">
                I also build websites that work as hard as the content does. Fully bilingual,
                English y español, so your brand connects with everyone.
              </p>
              <div className="stats-row">
                {STATS.map(s => (
                  <div className="stat-box" key={s.label}>
                    <div className="stat-num">{s.num}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
