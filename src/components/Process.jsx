import Reveal from "./Reveal";
import { useSiteCopy } from "../lib/language";
import { C } from "../lib/constants";

export default function Process() {
  const { copy } = useSiteCopy();
  const c = copy.process;
  return (
    <section aria-labelledby="process-title" style={{ background: C.panel }}>
      <div className="section">
        <Reveal>
          <div className="sec-label">{c.label}</div>
          <h2 className="sec-title" id="process-title">{c.title}</h2>
        </Reveal>

        <div className="proc-grid">
          {c.steps.map((p, i) => (
            <Reveal key={p.step} delay={i * 90}>
              <div className="proc-card">
                <div className="proc-step">{p.step}</div>
                <div className="proc-sub">{p.sub}</div>
                <p className="proc-desc">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
