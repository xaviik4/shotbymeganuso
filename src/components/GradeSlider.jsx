import { useState } from "react";
import Reveal from "./Reveal";

export default function GradeSlider() {
  const [pos, setPos] = useState(50);

  return (
    <section id="grade" aria-labelledby="grade-title">
      <div className="section">
        <Reveal>
          <div className="sec-label">01 / The Grade</div>
          <h2 className="sec-title" id="grade-title">See the Difference</h2>
          <p className="sec-sub">
            Drag the handle. Left is straight out of camera. Right is the grade that makes people
            stop scrolling. Every project gets this treatment, frame by frame.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="ba-wrap">
            <div className="ba-layer ba-after" aria-hidden="true"></div>
            <div className="ba-layer ba-clip" style={{ width: `${pos}%` }} aria-hidden="true">
              <div className="ba-layer ba-before"></div>
            </div>
            <span className="ba-tag raw">RAW / SOOC</span>
            <span className="ba-tag graded">GRADED</span>
            <span className="ba-photonote">DROP before.webp + after.webp AS BACKGROUNDS</span>
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
              aria-label="Before and after comparison slider. Left shows the unedited photo, right shows the graded photo."
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
