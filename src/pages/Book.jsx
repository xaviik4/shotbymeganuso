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

  return <main className="book-page">
    <section className="book-intro"><p className="ops-eyebrow">Start a conversation</p><h1>Tell me what you’re building.</h1><p>Share a little about your business and what you need. I’ll follow up to find a good next step.</p></section>
    <form className="book-form" onSubmit={submit}>
      <div className="book-honeypot" aria-hidden="true"><label htmlFor="book-website-url">Leave this field empty</label><input id="book-website-url" name="website_url" type="text" tabIndex={-1} autoComplete="off" /></div>
      <label className="ops-field">Name *<input required name="name" autoComplete="name" value={form.name} onChange={change} /></label>
      <label className="ops-field">Email *<input required type="email" name="email" autoComplete="email" value={form.email} onChange={change} /></label>
      <label className="ops-field">Phone *<input required type="tel" name="phone" autoComplete="tel" value={form.phone} onChange={change} /></label>
      <label className="ops-field">Business name<input name="business_name" value={form.business_name} onChange={change} /></label>
      <label className="ops-field">Instagram handle<input name="instagram" placeholder="@yourbusiness" value={form.instagram} onChange={change} /></label>
      <label className="ops-field">Website<input type="url" name="website" placeholder="https://" value={form.website} onChange={change} /></label>
      <label className="ops-field book-field-wide">What would you most like help with? *<textarea required rows="4" name="wants_help" value={form.wants_help} onChange={change} /></label>
      <label className="ops-field book-field-wide">How are you getting new clients right now? *<textarea required rows="4" name="client_acquisition" value={form.client_acquisition} onChange={change} /></label>
      <label className="ops-field">Do your clients prefer Spanish, English or both? *<select required name="client_language" value={form.client_language} onChange={change}><option value="">Choose one</option><option>Spanish</option><option>English</option><option>Both</option></select></label>
      {status && <p className="book-status" role="status">{status}</p>}
      <button className="ops-button" disabled={sending}>{sending ? "Sending…" : "Send inquiry"}</button>
    </form>
    <section className="book-calendar"><p className="ops-eyebrow">Schedule a call</p><h2>Booking calendar</h2><p>Cal.com / Calendly embed goes here.</p><div className="book-calendar-placeholder" aria-label="Booking widget placeholder">Booking widget placeholder</div></section>
  </main>;
}
