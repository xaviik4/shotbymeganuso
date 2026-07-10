import Reveal from "./Reveal";
import { FEATURES } from "../lib/constants";

export default function Features() {
  return (
    <section aria-labelledby="features-title">
      <div className="section">
        <Reveal>
          <div className="sec-label">05 / The Standard</div>
          <h2 className="sec-title" id="features-title">What You Get</h2>
        </Reveal>

        <div className="feat-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.name} delay={i * 50}>
              <div className="feat-card">
                <div className="feat-name">{f.name}</div>
                <p className="feat-desc">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
