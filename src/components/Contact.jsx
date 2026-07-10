import { useState } from "react";
import Reveal from "./Reveal";
import { WEB3FORMS_KEY, EMAIL, SOCIALS, C } from "../lib/constants";

export default function Contact({ setToast }) {
  const [form, setForm] = useState({ name: "", email: "", type: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setToast(res.ok
        ? "✅ Inquiry sent. I reply within 24 hours."
        : "❌ Something broke. Email me directly instead."
      );
      if (res.ok) setForm({ name: "", email: "", type: "", message: "" });
    } catch {
      setToast("❌ Connection error. Email me directly instead.");
    }
    setSending(false);
  };

  return (
    <section id="contact" aria-labelledby="contact-title" style={{ background: C.panel }}>
      <div className="closing">
        <Reveal>
          <h2 id="contact-title">Let the work<br /><em>do the talking.</em></h2>
          <p>Tell me what you're making. I reply within 24 hours, usually faster.</p>
        </Reveal>
      </div>

      <div className="section" style={{ paddingTop: 0 }}>
        <div className="contact-wrap">
          <Reveal delay={80}>
            <div>
              <div className="contact-line">
                <span className="mono">EMAIL</span>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </div>
              <div className="contact-line">
                <span className="mono">IG</span>
                <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">@shotbymeganuso</a>
              </div>
              <div className="contact-line">
                <span className="mono">TIKTOK</span>
                <a href={SOCIALS.tiktok} target="_blank" rel="noopener noreferrer">@shotbymeganuso</a>
              </div>
              <div className="contact-line">
                <span className="mono">YT</span>
                <a href={SOCIALS.youtube} target="_blank" rel="noopener noreferrer">@shotbymeganuso</a>
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="in-name">Name *</label>
                <input id="in-name" name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="Your name" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-email">Email *</label>
                <input id="in-email" name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="you@brand.com" required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-type">Project Type</label>
                <select id="in-type" name="type" value={form.type} onChange={handleChange} className="form-input">
                  <option value="">Select one</option>
                  <option>Automotive shoot</option>
                  <option>Editorial / sports</option>
                  <option>Lifestyle / portrait</option>
                  <option>UGC / short-form video</option>
                  <option>Website design</option>
                  <option>Something else</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="in-msg">Project Details *</label>
                <textarea id="in-msg" name="message" value={form.message} onChange={handleChange} className="form-input" placeholder="What are we making?" required />
              </div>
              <button type="submit" className="form-submit" disabled={sending}>
                {sending ? "Sending..." : "Send Inquiry →"}
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
