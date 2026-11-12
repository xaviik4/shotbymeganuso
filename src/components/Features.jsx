import Reveal from "./Reveal";
import { useSiteCopy } from "../lib/language";

export default function Features() {
  const { copy } = useSiteCopy();
  const c = copy.features;
  return (
    <section aria-labelledby="features-title">
      <div className="section">
        <Reveal>
          <div className="sec-label">{c.label}</div>
          <h2 className="sec-title" id="features-title">{c.title}</h2>
        </Reveal>

        <div className="feat-grid">
          {c.items.map((f, i) => (
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
