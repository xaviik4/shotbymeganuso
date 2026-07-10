import Reveal from "./Reveal";
import { PROCESS, C } from "../lib/constants";

export default function Process() {
  return (
    <section aria-labelledby="process-title" style={{ background: C.panel }}>
      <div className="section">
        <Reveal>
          <div className="sec-label">02 / The Workflow</div>
          <h2 className="sec-title" id="process-title">Shoot. Grade. Deliver.</h2>
        </Reveal>

        <div className="proc-grid">
          {PROCESS.map((p, i) => (
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
