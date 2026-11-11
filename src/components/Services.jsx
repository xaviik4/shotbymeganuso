import Reveal from "./Reveal";
import { C } from "../lib/constants";
import { useSiteCopy } from "../lib/language";

export default function Services() {
  const { copy } = useSiteCopy();
  const c = copy.services;
  return <section id="services" aria-labelledby="services-title" style={{ background: C.panel }}>
    <div className="section">
      <Reveal><div className="sec-label">{c.label}</div><h2 className="sec-title" id="services-title">{c.title}</h2></Reveal>
      <div className="svc-list">{c.items.map((service, index) => <Reveal key={service.num} delay={index * 80}>
        <div className={`svc-row${service.featured ? " svc-featured" : ""}`}><span className="svc-num">/{service.num}</span><h3 className="svc-name">{service.name}</h3><div><p className="svc-desc">{service.desc}</p><div className="svc-items">{service.items.map((item) => <span className="svc-chip" key={item}>{item}</span>)}</div></div></div>
      </Reveal>)}</div>
    </div>
  </section>;
}
