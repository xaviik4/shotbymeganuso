import Reveal from "../components/Reveal";
import Work from "../components/Work";
import { C } from "../lib/constants";
import { useSiteCopy } from "../lib/language";

export default function WorkPage() {
  const { copy } = useSiteCopy();
  const c = copy.work;
  return (
    <>
      {/* HERO HEADER */}
      <section className="page-header" aria-labelledby="work-page-title" style={{ background: C.bg }}>
        <div className="section">
          <Reveal><div className="page-header-content">
            <div className="sec-label">{c.label}</div>
            <h1 className="sec-title" id="work-page-title">{c.title}</h1>
            <p className="sec-sub">{c.description}</p>
          </div></Reveal>
        </div>
      </section>

      {/* GRID — reuses the existing Work component with heading suppressed */}
      <Work hideHeading />
    </>
  );
}
