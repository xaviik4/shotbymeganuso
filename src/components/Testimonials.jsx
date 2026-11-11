import { TESTIMONIALS } from "../data/testimonials";
import { useSiteCopy } from "../lib/language";

export default function Testimonials() {
  const { copy, language } = useSiteCopy();
  const c = copy.testimonials;
  if (!TESTIMONIALS.length) return null;
  return <section aria-labelledby="testimonials-title"><div className="section"><p className="sec-label">{c.label}</p><h2 className="sec-title" id="testimonials-title">{c.title}</h2><div className="testimonial-grid">{TESTIMONIALS.map((item) => <figure key={item.id}><blockquote>{item.quote[language] || item.quote.en}</blockquote><figcaption>{item.name}{item.business ? ` · ${item.business}` : ""}</figcaption></figure>)}</div></div></section>;
}
