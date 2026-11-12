import { useState } from "react";
import Reveal from "../components/Reveal";
import { useSiteCopy } from "../lib/language";
import { SITE_CONFIG } from "../lib/site-config";
import { trackLead } from "../lib/analytics";
import { C } from "../lib/constants";

export default function Pricing() {
  const { copy } = useSiteCopy();
  const c = copy.pricing;
  const [tab, setTab] = useState("ads");
  const packages = c[tab];
  return <>
    <section className="page-header" style={{ background: C.bg }}><div className="section"><Reveal><div className="page-header-content"><div className="sec-label">{c.label}</div><h1 className="sec-title">{c.title}</h1><p className="sec-sub">{c.tabIntro[tab]}</p></div></Reveal></div></section>
    <section style={{ paddingTop: 0 }}><div className="section">
      <div className="pricing-tabs" role="tablist" aria-label="Service pricing categories">{Object.entries(c.tabs).map(([key, label]) => <button className={`filter-btn${tab === key ? " active" : ""}`} role="tab" aria-selected={tab === key} key={key} onClick={() => setTab(key)}>{label}</button>)}</div>
      <div className="pricing-grid">{packages.map((tier, index) => <Reveal key={`${tab}-${tier.name}`} delay={index * 80}><article className={`pricing-card${tier.highlight ? " highlighted" : ""}`}>{tier.highlight && <span className="pricing-popular">{c.mostPopular}</span>}<h2>{tier.name}</h2><div className="pricing-price">{tier.price}<small>{tier.billing}</small></div><p>{tier.subtitle}</p><ul>{tier.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><a className={tier.highlight ? "btn-primary" : "btn-outline"} href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackLead("pricing_booking")}>{tier.cta}</a></article></Reveal>)}</div>
      <p className="pricing-note">{c.notes[tab]}</p>
    </div></section>
    <section className="pricing-final" style={{ background: C.panel }}><div className="section"><Reveal><div className="pricing-final-content"><h2 className="sec-title">{c.bottomTitle}</h2><p className="sec-sub">{c.bottomDescription}</p><a className="btn-primary" href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackLead("pricing_booking")}>{c.bottomCta}</a></div></Reveal></div></section>
  </>;
}
