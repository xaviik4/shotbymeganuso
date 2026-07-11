import Reveal from "../components/Reveal";
import Work from "../components/Work";
import { C } from "../lib/constants";

export default function WorkPage() {
  return (
    <>
      {/* HERO HEADER */}
      <section
        aria-labelledby="work-page-title"
        style={{
          background: C.bg,
          paddingTop: "clamp(120px, 18vw, 200px)",
          paddingBottom: "clamp(60px, 8vw, 100px)",
        }}
      >
        <div className="section" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="sec-label">Selected Work</div>
            <h1 className="sec-title" id="work-page-title">The Archive</h1>
            <p className="sec-sub" style={{ maxWidth: 620, margin: "0 auto" }}>
              A collection of photography across automotive, editorial, lifestyle,
              and portrait. Every image shot, edited, and delivered by me.
            </p>
          </Reveal>
        </div>
      </section>

      {/* GRID — reuses the existing Work component with heading suppressed */}
      <Work hideHeading />
    </>
  );
}
