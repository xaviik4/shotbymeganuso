import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { useSiteCopy } from "../lib/language";
import gradePairs from "../data/grade-pairs.generated.json";

export default function GradeSlider() {
  const { copy } = useSiteCopy();
  const c = copy.grade;
  const [position, setPosition] = useState(50);
  const [pairIndex, setPairIndex] = useState(0);
  const frame = useRef(0);
  const pending = useRef(50);
  const pointerActive = useRef(false);
  const pair = gradePairs[pairIndex];
  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  if (!pair) return null;

  const updateFromPointer = (event) => {
    if (!pointerActive.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pending.current = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
    if (!frame.current) frame.current = requestAnimationFrame(() => {
      setPosition(pending.current);
      frame.current = 0;
    });
  };
  const selectPair = (index) => { setPairIndex(index); setPosition(50); };
  const onKeyDown = (event) => {
    const delta = event.shiftKey ? 10 : 2;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") { event.preventDefault(); setPosition((value) => Math.max(0, value - delta)); }
    if (event.key === "ArrowRight" || event.key === "ArrowUp") { event.preventDefault(); setPosition((value) => Math.min(100, value + delta)); }
    if (event.key === "Home") { event.preventDefault(); setPosition(0); }
    if (event.key === "End") { event.preventDefault(); setPosition(100); }
  };

  return <section id="grade" aria-labelledby="grade-title"><div className="section grade-layout">
    <Reveal><div className="grade-copy"><div className="sec-label">{c.label}</div><h2 className="sec-title" id="grade-title">{c.title}</h2><p className="sec-sub">{c.description}</p></div></Reveal>
    <Reveal delay={100}><div className="ba-wrap protected-media" style={{ aspectRatio: `${pair.width} / ${pair.height}`, "--grade-ratio": pair.width / pair.height }} onPointerDown={(event) => { pointerActive.current = true; event.currentTarget.setPointerCapture(event.pointerId); updateFromPointer(event); }} onPointerMove={updateFromPointer} onPointerUp={() => { pointerActive.current = false; }} onPointerCancel={() => { pointerActive.current = false; }} onContextMenu={(event) => event.preventDefault()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => event.preventDefault()}>
      <img className="ba-image ba-before" src={pair.before.src} srcSet={pair.before.srcSet} sizes="(max-width: 768px) 100vw, 90vw" width={pair.before.width} height={pair.before.height} alt="" aria-hidden="true" draggable="false" />
      <img className="ba-image ba-after" src={pair.after.src} srcSet={pair.after.srcSet} sizes="(max-width: 768px) 100vw, 90vw" width={pair.after.width} height={pair.after.height} alt="" aria-hidden="true" draggable="false" style={{ clipPath: `inset(0 0 0 ${position}%)` }} />
      <span className="image-protection-shield" aria-hidden="true" />
      <span className="ba-tag raw">{c.raw}</span><span className="ba-tag graded">{c.graded}</span>
      <div className="ba-divider" style={{ left: `${position}%` }} aria-hidden="true"><div className="ba-handle">↔</div></div>
      <div className="ba-keyboard" role="slider" tabIndex={0} aria-label={c.sliderLabel} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(position)} onKeyDown={onKeyDown} />
    </div></Reveal>
    {gradePairs.length > 1 && <div className="ba-dots" aria-label="Choose a before and after example">{gradePairs.map((item, index) => <button key={item.id} className={`ba-dot${pairIndex === index ? " active" : ""}`} aria-label={`Example ${index + 1}`} aria-pressed={pairIndex === index} onClick={() => selectPair(index)} />)}</div>}
  </div></section>;
}
