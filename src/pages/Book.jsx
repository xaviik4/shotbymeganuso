import { useState } from "react";

const initial = { name: "", email: "", phone: "", business_name: "", instagram: "", website: "", wants_help: "", client_acquisition: "", client_language: "" };

export default function Book() {
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
      setStatus("Thanks. Your inquiry has been received.");
    } catch (error) { setStatus(error.message); }
    finally { setSending(false); }
  }

  return <div className="book-page">
    <section className="book-intro" aria-labelledby="book-title"><p className="sec-label">Start a conversation</p><h1 className="sec-title" id="book-title">Tell me what you’re building.</h1><p className="sec-sub">Share a little about your business and what you need. I’ll follow up to find a good next step.</p></section>
    <form className="book-form" onSubmit={submit}>
      <div className="book-honeypot" aria-hidden="true"><label htmlFor="book-website-url">Leave this field empty</label><input id="book-website-url" name="website_url" type="text" tabIndex={-1} autoComplete="off" /></div>
      <label className="form-group book-field"> <span className="form-label">Name *</span><input className="form-input" required name="name" autoComplete="name" value={form.name} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">Email *</span><input className="form-input" required type="email" name="email" autoComplete="email" value={form.email} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">Phone *</span><input className="form-input" required type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">Business name</span><input className="form-input" name="business_name" value={form.business_name} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">Instagram handle</span><input className="form-input" name="instagram" placeholder="@yourbusiness" value={form.instagram} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">Website</span><input className="form-input" type="url" name="website" placeholder="https://" value={form.website} onChange={change} /></label>
      <label className="form-group book-field book-field-wide"> <span className="form-label">What would you most like help with? *</span><textarea className="form-input" required rows="4" name="wants_help" value={form.wants_help} onChange={change} /></label>
      <label className="form-group book-field book-field-wide"> <span className="form-label">How are you getting new clients right now? *</span><textarea className="form-input" required rows="4" name="client_acquisition" value={form.client_acquisition} onChange={change} /></label>
      <label className="form-group book-field"> <span className="form-label">Do your clients prefer Spanish, English or both? *</span><select className="form-input" required name="client_language" value={form.client_language} onChange={change}><option value="">Choose one</option><option>Spanish</option><option>English</option><option>Both</option></select></label>
      {status && <p className="book-status" role="status">{status}</p>}
      <button className="form-submit book-submit" disabled={sending}>{sending ? "Sending…" : "Send inquiry →"}</button>
    </form>
    <section className="book-calendar"><p className="sec-label">Schedule a call</p><h2 className="sec-title">Booking calendar</h2><p className="sec-sub">Cal.com / Calendly embed goes here.</p><div className="book-calendar-placeholder dash-chart" aria-label="Booking widget placeholder">Booking widget placeholder</div></section>
  </div>;
}
