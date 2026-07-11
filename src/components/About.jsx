import Reveal from "./Reveal";
import { C } from "../lib/constants";

const STATS = [
  { num: "3+",       label: "Years Shooting" },
  { num: "5+",       label: "Years Editing" },
  { num: "R6 MK II", label: "Canon Body" },
  { num: "24h",      label: "Response Time" },
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
                Photographer and videographer based in Corvallis, Oregon. I shoot
                automotive, editorial, lifestyle, and portrait work, focused on making
                content that holds attention.
              </p>

              <p className="about-text">
                I care about the details: framing, light, color, and pacing. I approach
                every shoot with the same intention, whether it's a car edit at golden
                hour, a live music set in a packed venue, or a portrait session outside
                a college campus. Good content takes preparation, patience, and knowing
                what to look for when the moment arrives.
              </p>

              <p className="about-text">
                Editing has been a hobby for over five years and shooting seriously for
                the last three. My editing background shapes how I shoot. I frame with
                the final edit already in mind, which means less wasted footage, tighter
                turnaround, and content that fits together the way it should. Canon R6
                Mark II, DaVinci Resolve, Adobe Lightroom.
              </p>

              <p className="about-text">
                Right now I'm building shotbymeganuso into a full creative studio. That
                means content, but also web design and helping small businesses show up
                online the way they deserve to. If you have a project in mind, I'd love
                to hear about it.
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
