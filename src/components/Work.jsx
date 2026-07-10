import { useState } from "react";
import Reveal from "./Reveal";
import { WORK, CATEGORIES } from "../lib/constants";

export default function Work() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? WORK : WORK.filter(w => w.cat === filter);

  return (
    <section id="work" aria-labelledby="work-title">
      <div className="section">
        <Reveal>
          <div className="sec-label">03 / Selected Work</div>
          <h2 className="sec-title" id="work-title">The Portfolio</h2>
          <p className="sec-sub">
            Shot on the Canon R6 Mark II. Automotive, editorial, lifestyle, and portrait work,
            with UGC in the mix.
          </p>
        </Reveal>

        <div className="filter-row" role="tablist" aria-label="Filter portfolio by category">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`filter-btn${filter === c ? " active" : ""}`}
              onClick={() => setFilter(c)}
              role="tab"
              aria-selected={filter === c}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="work-grid">
          {filtered.map((w) => (
            <div
              className={`work-item${w.tall ? " tall" : ""}`}
              key={w.title}
              tabIndex={0}
              aria-label={`${w.cat}: ${w.title}`}
            >
              {w.img ? (
                <img className="work-img" src={w.img} alt={`${w.cat}, ${w.title}`} loading="lazy" />
              ) : (
                <div className="work-ph">
                  <span className="work-ph-icon" aria-hidden="true">🎞️</span>
                  <span className="work-ph-note">
                    images/{w.cat}/{w.title.replace(/\s/g, "-").toLowerCase()}.webp
                  </span>
                </div>
              )}
              <span className="fb fb-tl" aria-hidden="true"></span>
              <span className="fb fb-tr" aria-hidden="true"></span>
              <span className="fb fb-bl" aria-hidden="true"></span>
              <span className="fb fb-br" aria-hidden="true"></span>
              <div className="work-overlay">
                <span className="work-cat">{w.cat}</span>
                <span className="work-title">{w.title}</span>
                <span className="work-exif">{w.exif}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
