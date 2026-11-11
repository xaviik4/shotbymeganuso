import { useSiteCopy } from "../lib/language";
import { SITE_CONFIG } from "../lib/site-config";

export default function Privacy() {
  const { copy } = useSiteCopy();
  const c = copy.privacy;
  const contactSectionTitle = c.sections[c.sections.length - 1].title;
  return <section className="privacy-page" aria-labelledby="privacy-title"><div className="section"><p className="sec-label">{c.label}</p><h1 className="sec-title" id="privacy-title">{c.title}</h1><p className="sec-sub">{c.intro}</p><div className="privacy-content">{c.sections.map((section) => <article key={section.title}><h2>{section.title}</h2><p>{section.body}{section.title === contactSectionTitle && <> <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>.</>}</p></article>)}</div></div></section>;
}
