import { useState } from "react";
import Reveal from "./Reveal";
import { useSiteCopy } from "../lib/language";

export default function GradeSlider() {
  const { copy } = useSiteCopy();
  const c = copy.grade;
  const [pos, setPos] = useState(50);

  return (
    <section id="grade" aria-labelledby="grade-title">
      <div className="section">
        <Reveal>
          <div className="sec-label">{c.label}</div><h2 className="sec-title" id="grade-title">{c.title}</h2><p className="sec-sub">{c.description}</p>
        </Reveal>

        <Reveal delay={100}>
          <div className="ba-wrap">
            <div className="ba-layer ba-after" aria-hidden="true"></div>
            <div className="ba-layer ba-clip" style={{ width: `${pos}%` }} aria-hidden="true">
              <div className="ba-layer ba-before"></div>
            </div>
            {/* TO ADD REAL IMAGES: set background-image on .ba-before and .ba-after
                in global.css — before.webp = ungraded/SOOC, after.webp = graded */}
            <span className="ba-tag raw">{c.raw}</span><span className="ba-tag graded">{c.graded}</span>
            <div className="ba-divider" style={{ left: `${pos}%` }} aria-hidden="true">
              <div className="ba-handle">↔</div>
            </div>
            <input
              type="range"
              min="2"
              max="98"
              value={pos}
              onChange={e => setPos(Number(e.target.value))}
              className="ba-range"
              aria-label={c.sliderLabel}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
