import { useState } from "react";
import Reveal from "./Reveal";
import { PHOTOS, PHOTO_CATEGORIES } from "../data/photos";
import { VIDEOS } from "../data/videos";
import { useSiteCopy } from "../lib/language";

export default function Work({ hideHeading = false }) {
  const { copy, language } = useSiteCopy();
  const c = copy.work;
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState({});
  const filters = ["All", ...PHOTO_CATEGORIES, ...(VIDEOS.length ? ["Video"] : [])];
  const visiblePhotos = PHOTOS.filter((photo) => filter === "All" || photo.cat === filter);
  const shownPhotos = visiblePhotos.filter((photo) => expanded[filter] || photo.featured);
  const showingVideos = filter === "Video";

  return <section id="work" aria-labelledby="work-title"><div className="section">
    {!hideHeading && <Reveal><div className="sec-label">{c.label}</div><h2 className="sec-title" id="work-title">{c.title}</h2><p className="sec-sub">{c.description}</p></Reveal>}
    <div className="filter-row" role="tablist" aria-label={c.filterLabel}>{filters.map((category) => <button key={category} className={`filter-btn${filter === category ? " active" : ""}`} onClick={() => setFilter(category)} role="tab" aria-selected={filter === category}>{c.categories[category]}</button>)}</div>
    {showingVideos ? <div className="work-grid work-video-grid">{VIDEOS.map((video) => <article className="work-video" key={video.id}><iframe src={video.embedUrl} title={video.title} loading="lazy" style={{ aspectRatio: video.aspectRatio || "16 / 9" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /><h3>{video.title}</h3></article>)}</div> : <div className="work-grid">{shownPhotos.map((photo, index) => <div className={`work-item${photo.tall ? " tall" : ""}`} key={photo.id} tabIndex={0} aria-label={`${photo.cat}: ${photo.title}`}><img className="work-img" src={photo.src} srcSet={photo.srcSet} sizes="(max-width: 680px) 100vw, (max-width: 1024px) 50vw, 33vw" alt={language === "es" ? `${photo.title}, fotografía ${c.categories[photo.cat].toLowerCase()} de Alexander` : photo.alt} loading={index < 2 && !expanded[filter] ? "eager" : "lazy"} fetchpriority={index < 2 && !expanded[filter] ? "high" : "auto"} decoding="async" width="1280" height="1707" /><span className="fb fb-tl" aria-hidden="true" /><span className="fb fb-tr" aria-hidden="true" /><span className="fb fb-bl" aria-hidden="true" /><span className="fb fb-br" aria-hidden="true" /><div className="work-overlay"><span className="work-cat">{c.categories[photo.cat]}</span><span className="work-title">{photo.title}</span></div></div>)}</div>}
    {!showingVideos && visiblePhotos.length > 0 && <div className="work-more"><button className="btn-outline" onClick={() => setExpanded((state) => ({ ...state, [filter]: !state[filter] }))}>{expanded[filter] ? c.showFeatured : `${c.viewAll} (${visiblePhotos.length})`}</button></div>}
  </div></section>;
}
