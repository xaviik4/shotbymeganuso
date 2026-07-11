import { useState } from "react";
import Reveal from "./Reveal";
import { FAQS } from "../lib/constants";

export default function Faq() {
  const [open, setOpen] = useState(null);

  return (
    <section id="faq" aria-labelledby="faq-title">
      <div className="section">
        <Reveal>
          <div className="sec-label">06 / Questions</div>
          <h2 className="sec-title" id="faq-title">FAQ</h2>
        </Reveal>

        <div className="faq-list">
          {FAQS.map((f, i) => (
            <div className={`faq-item${open === i ? " open" : ""}`} key={i}>
              <button
                className="faq-q"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                {f.q}
                <span className="faq-icon" aria-hidden="true">+</span>
              </button>
              <div className="faq-a"><p>{f.a}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
