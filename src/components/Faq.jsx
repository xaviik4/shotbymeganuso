import { useState } from "react";
import Reveal from "./Reveal";
import { useSiteCopy } from "../lib/language";

export default function Faq() {
  const [open, setOpen] = useState(null);
  const { copy } = useSiteCopy();
  const c = copy.faq;

  return (
    <section id="faq" aria-labelledby="faq-title">
      <div className="section">
        <Reveal>
          <div className="sec-label">{c.label}</div>
          <h2 className="sec-title" id="faq-title">{c.title}</h2>
        </Reveal>

        <div className="faq-list">
          {c.items.map((f, i) => (
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
