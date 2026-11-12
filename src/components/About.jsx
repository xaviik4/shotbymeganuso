import Reveal from "./Reveal";
import { C } from "../lib/constants";
import { useSiteCopy } from "../lib/language";
import aboutImage from "../data/about-image.generated.json";

export default function About() {
  const { copy } = useSiteCopy();
  const c = copy.about;
  return (
    <section id="about" aria-labelledby="about-title" style={{ background: C.panel }}>
      <div className="section">
        <div className="about-wrap">
          <Reveal>
            <div className="about-visual">
              {aboutImage ? <img src={aboutImage.src} srcSet={aboutImage.srcSet} sizes="(max-width: 820px) 100vw, 40vw" width={aboutImage.width} height={aboutImage.height} alt="Alexander, founder of meganusopr" loading="lazy" decoding="async" /> : <span className="about-wordmark">meganusopr</span>}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              <div className="sec-label">{c.label}</div>
              <h2 className="sec-title" id="about-title">{c.title}</h2>
              {c.paragraphs.map((p, i) => <p className="about-text" style={i === 0 ? { marginTop: 18 } : undefined} key={p}>{p}</p>)}

              <div className="stats-row">
                {c.stats.map(s => (
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
