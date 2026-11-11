import { useState } from "react";
import { useSiteCopy } from "../lib/language";
import { SITE_CONFIG } from "../lib/site-config";
import { trackLead } from "../lib/analytics";

const initial = { name: "", email: "", phone: "", business_name: "", instagram: "", website: "", wants_help: "", client_acquisition: "", client_language: "" };

export default function Book() {
  const { copy } = useSiteCopy();
  const c = copy.book;
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setSending(true); setStatus("");
    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website_url: event.currentTarget.elements.website_url.value }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Could not send your inquiry. Please try again.");
      }
      setForm(initial);
      trackLead("intake_form");
      setStatus(c.success);
    } catch (error) { setStatus(error.message); }
    finally { setSending(false); }
  }

  return <div className="book-page">
    <section className="book-intro" aria-labelledby="book-title"><p className="sec-label">{c.label}</p><h1 className="sec-title" id="book-title">{c.title}</h1><p className="sec-sub">{c.description}</p><a className="btn-primary" href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackLead("booking_click")}>{c.call}</a></section>
    <form className="book-form" onSubmit={submit}>
      <div className="book-honeypot" aria-hidden="true"><label htmlFor="book-website-url">Leave this field empty</label><input id="book-website-url" name="website_url" type="text" tabIndex={-1} autoComplete="off" /></div>
      <label className="form-group book-field"> <span className="form-label">{c.name}</span><input className="form-input" required name="name" autoComplete="name" value={form.name} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">{c.email}</span><input className="form-input" required type="email" name="email" autoComplete="email" value={form.email} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">{c.phone}</span><input className="form-input" required type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">{c.business}</span><input className="form-input" name="business_name" value={form.business_name} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">{c.instagram}</span><input className="form-input" name="instagram" placeholder="@yourbusiness" value={form.instagram} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">{c.website}</span><input className="form-input" type="url" name="website" placeholder="https://" value={form.website} onChange={change} /></label>
      <label className="form-group book-field book-field-wide"> <span className="form-label">{c.help}</span><textarea className="form-input" required rows="4" name="wants_help" value={form.wants_help} onChange={change} /></label>
      <label className="form-group book-field book-field-wide"> <span className="form-label">{c.clients}</span><textarea className="form-input" required rows="4" name="client_acquisition" value={form.client_acquisition} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">{c.language}</span><select className="form-input" required name="client_language" value={form.client_language} onChange={change}><option value="">{c.select}</option>{c.languageOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
      {status && <p className="book-status" role="status">{status}</p>}
      <button className="form-submit book-submit" disabled={sending}>{sending ? c.sending : c.submit}</button>
    </form>
    <section className="book-calendar"><p className="sec-label">{c.schedule}</p><h2 className="sec-title">{c.call}</h2><p className="sec-sub">{c.formIntro}</p><a className="btn-outline" href={SITE_CONFIG.bookingUrl} target="_blank" rel="noopener noreferrer">{c.call}</a>{/* Cal.com/Calendly booking widget embed slot. */}</section>
  </div>;
}
