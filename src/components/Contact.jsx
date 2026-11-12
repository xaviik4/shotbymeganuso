import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";
import { WEB3FORMS_KEY, C } from "../lib/constants";
import { SITE_CONFIG, SOCIALS } from "../lib/site-config";
import { useSiteCopy } from "../lib/language";
import { trackLead } from "../lib/analytics";

export default function Contact({ setToast }) {
  const { copy } = useSiteCopy();
  const c = copy.contact;
  const [form, setForm] = useState({ name: "", email: "", type: "", message: "", botcheck: "" });
  const [sending, setSending] = useState(false);
  const formStartedAt = useRef(0);
  useEffect(() => { formStartedAt.current = Date.now(); }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quietly discard submissions that fill the off-screen honeypot.
    if (form.botcheck) return;

    // Filter instant automated submits while allowing normal fast completion.
    if (Date.now() - formStartedAt.current < 2000) {
      setToast(c.fast);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `📸 New inquiry: ${form.name} · ${form.type || "General"}`,
          ...form,
        }),
      });
      setToast(res.ok ? c.success : c.failure);
      if (res.ok) {
        trackLead("contact_form");
        setForm({ name: "", email: "", type: "", message: "", botcheck: "" });
        formStartedAt.current = Date.now();
      }
    } catch {
      setToast(c.network);
    }
    setSending(false);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" style={{ background: C.panel }}>
      <div className="closing">
        <Reveal>
          <h2 id="contact-title">{c.heading[0]}<br /><em>{c.heading[1]}</em></h2>
          <p>{c.intro}</p>
          <p><a className="btn-primary" href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => { trackLead("booking_click"); }}>{c.book}</a></p>
          <p>{c.prompt}</p>
        </Reveal>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="contact-wrap">
          <Reveal delay={80}>
            <div>
              <div className="contact-line">
                <span className="mono">{c.email.toUpperCase()}</span>
                <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>
              </div>
              <div className="contact-line">
                <span className="mono">{c.instagram.toUpperCase()}</span>
                <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">@{SITE_CONFIG.brandName}</a>
              </div>
              <div className="contact-line">
                <span className="mono">{c.tiktok.toUpperCase()}</span>
                <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer">@{SITE_CONFIG.brandName}</a>
              </div>
              <div className="contact-line">
                <span className="mono">{c.youtube.toUpperCase()}</span>
                <a href={SOCIALS.youtube} target="_blank" rel="noopener noreferrer">@{SITE_CONFIG.brandName}</a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <form onSubmit={handleSubmit}>
              <div className="contact-honeypot" aria-hidden="true">
                <label htmlFor="in-website">Leave this field empty</label>
                <input
                  id="in-website"
                  name="botcheck"
                  type="text"
                  value={form.botcheck}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-name">{c.name}</label>
                <input id="in-name" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder={c.nameHint} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-email">{c.emailLabel}</label>
                <input id="in-email" name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder={c.emailHint} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-type">{c.type}</label>
                <select id="in-type" name="type" value={form.type} onChange={handleChange} className="form-input">
                  <option value="">{c.choose}</option>
                  {c.typeOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-msg">{c.details}</label>
                <textarea id="in-msg" name="message" value={form.message} onChange={handleChange} className="form-input" placeholder={c.detailsHint} required />
              </div>
              <button type="submit" className="form-submit" disabled={sending}>
                {sending ? c.sending : c.submit}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
