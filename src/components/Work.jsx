import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { PHOTOS, PHOTO_CATEGORIES } from "../data/photos";
import { useSiteCopy } from "../lib/language";

export default function Work({ hideHeading = false }) {
  const { copy, language } = useSiteCopy();
  const c = copy.work;
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const [touchDetailsId, setTouchDetailsId] = useState(null);
  useEffect(() => {
    const closeDetails = (event) => {
      const item = event.target.closest?.(".masonry-item");
      if (!item || item.dataset.photoId !== touchDetailsId) setTouchDetailsId(null);
    };
    document.addEventListener("pointerdown", closeDetails);
    return () => document.removeEventListener("pointerdown", closeDetails);
  }, [touchDetailsId]);
  const categories = ["All", ...PHOTO_CATEGORIES];
  const visiblePhotos = useMemo(() => PHOTOS.filter((photo) => filter === "All" || photo.cat === filter)
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt)), [filter]);
  const limit = filter === "All" ? 12 : 8;
  const shownPhotos = expanded[filter] ? visiblePhotos : visiblePhotos.slice(0, limit);
  const categoryLabel = (category) => category === "All" ? c.categories.All : (c.categories[category] || category);
  if (!PHOTOS.length) return null;

  return <section id="work" className="work-gallery" aria-labelledby="work-title"><div className="section">
    {!hideHeading && <Reveal><div className="sec-label">{c.label}</div><h2 className="sec-title" id="work-title">{c.title}</h2><p className="sec-sub">{c.description}</p></Reveal>}
    <div className="filter-row" role="tablist" aria-label={c.filterLabel}>{categories.map((category) => <button key={category} className={`filter-btn${filter === category ? " active" : ""}`} onClick={() => { setFilter(category); }} role="tab" aria-selected={filter === category}>{categoryLabel(category)}</button>)}</div>
    <div className="masonry-grid">{shownPhotos.map((photo, index) => {
      const details = [photo.exif.camera, photo.exif.lens, [photo.exif.focalLength, photo.exif.aperture, photo.exif.shutterSpeed, photo.exif.iso ? `ISO ${photo.exif.iso}` : null].filter(Boolean).join(" · "), photo.capturedAt ? new Date(photo.capturedAt).toLocaleDateString(language === "es" ? "es-US" : "en-US", { year: "numeric", month: "short", day: "numeric" }) : null].filter(Boolean);
      return <article className={`masonry-item${touchDetailsId === photo.id ? " is-details-visible" : ""}`} key={photo.id} data-photo-id={photo.id} tabIndex={0} aria-label={`${categoryLabel(photo.cat)}: ${photo.title}`} aria-expanded={touchDetailsId === photo.id} onClick={() => { if (window.matchMedia("(hover: none)").matches) setTouchDetailsId((id) => id === photo.id ? null : photo.id); }} onContextMenu={(event) => event.preventDefault()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => event.preventDefault()}>
      <img className="masonry-image" src={photo.src} srcSet={photo.srcSet} sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw" alt={language === "es" ? `${photo.title}, fotografía de ${categoryLabel(photo.cat)} de Alexander` : photo.alt} loading={index < 2 && !expanded[filter] ? "eager" : "lazy"} fetchpriority={index < 2 && !expanded[filter] ? "high" : "auto"} decoding="async" width={photo.width} height={photo.height} draggable="false" />
      <span className="image-protection-shield" aria-hidden="true" />
      <div className="work-overlay"><span className="work-cat">{categoryLabel(photo.cat)}</span><span className="work-title">{photo.title}</span>{details.length > 0 && <span className="work-exif">{details.map((detail) => <span key={detail}>{detail}</span>)}</span>}</div>
    </article>;
    })}</div>
    {visiblePhotos.length > limit && <div className="work-more"><button className="btn-outline" onClick={() => setExpanded((state) => ({ ...state, [filter]: !state[filter] }))}>{expanded[filter] ? c.showFeatured : `${c.viewAll} (${visiblePhotos.length})`}</button></div>}
  </div></section>;
}
