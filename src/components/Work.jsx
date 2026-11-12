import { useMemo, useState } from "react";
import Reveal from "./Reveal";
import { PHOTOS, PHOTO_CATEGORIES } from "../data/photos";
import { useSiteCopy } from "../lib/language";

export default function Work({ hideHeading = false }) {
  const { copy, language } = useSiteCopy();
  const c = copy.work;
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const categories = ["All", ...PHOTO_CATEGORIES];
  const visiblePhotos = useMemo(() => PHOTOS.filter((photo) => filter === "All" || photo.cat === filter)
    .sort((a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt)), [filter]);
  const limit = filter === "All" ? 12 : 8;
  const shownPhotos = expanded[filter] ? visiblePhotos : visiblePhotos.slice(0, limit);
  const categoryLabel = (category) => category === "All" ? c.categories.All : (c.categories[category] || category);

  return <section id="work" aria-labelledby="work-title"><div className="section">
    {!hideHeading && <Reveal><div className="sec-label">{c.label}</div><h2 className="sec-title" id="work-title">{c.title}</h2><p className="sec-sub">{c.description}</p></Reveal>}
    <div className="filter-row" role="tablist" aria-label={c.filterLabel}>{categories.map((category) => <button key={category} className={`filter-btn${filter === category ? " active" : ""}`} onClick={() => { setFilter(category); }} role="tab" aria-selected={filter === category}>{categoryLabel(category)}</button>)}</div>
    <div className="masonry-grid">{shownPhotos.map((photo, index) => <article className="masonry-item" key={photo.id} tabIndex={0} aria-label={`${categoryLabel(photo.cat)}: ${photo.title}`}>
      <img className="masonry-image" src={photo.src} srcSet={photo.srcSet} sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw" alt={language === "es" ? `${photo.title}, fotografía de ${categoryLabel(photo.cat)} de Alexander` : photo.alt} loading={index < 2 && !expanded[filter] ? "eager" : "lazy"} fetchpriority={index < 2 && !expanded[filter] ? "high" : "auto"} decoding="async" width={photo.width} height={photo.height} />
      <div className="work-overlay"><span className="work-cat">{categoryLabel(photo.cat)}</span><span className="work-title">{photo.title}</span></div>
    </article>)}</div>
    {visiblePhotos.length > limit && <div className="work-more"><button className="btn-outline" onClick={() => setExpanded((state) => ({ ...state, [filter]: !state[filter] }))}>{expanded[filter] ? c.showFeatured : `${c.viewAll} (${visiblePhotos.length})`}</button></div>}
  </div></section>;
}
