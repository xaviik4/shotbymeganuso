import { useState } from 'react';
import './Contact.css';

const WEB3FORMS_KEY = '81971473-9c81-4cb7-a1f0-f17cfcc42191';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: 'New inquiry from shotbymeganuso.com',
          botcheck: '',
          ...form,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus('success');
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setStatus('idle'), 4000);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const btnLabel = {
    idle:    'Send Message',
    sending: 'Sending...',
    success: 'Message Sent ✓',
    error:   'Something went wrong — try again',
  }[status];

  return (
    <section id="contact" className="contact-section">
      <div className="max-w">
        <div className="contact-inner">
          <div className="contact-info">
            <p className="section-eyebrow">Let's Collaborate</p>
            <h2 className="contact-info-title">READY TO<br />CREATE?</h2>
            <p className="contact-info-sub">
              Got a campaign, launch, or brand shoot in mind? Fill out the form and I'll get back to you within 24 hours.
            </p>
            <div className="social-links">
              <a href="https://instagram.com/shotbymeganuso" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5"/>
                    <circle cx="12" cy="12" r="5"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                </span>
                @shotbymeganuso
              </a>
              <a href="https://tiktok.com/@shotbymeganuso" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
                  </svg>
                </span>
                @shotbymeganuso
              </a>
              <a href="https://youtube.com/@shotbymeganuso" target="_blank" rel="noopener noreferrer" className="social-link">
                <span className="social-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 7s-.3-2-1.2-2.8c-1.1-1.2-2.4-1.2-3-1.3C16.6 2.7 12 2.7 12 2.7s-4.6 0-6.8.2c-.6.1-1.9.1-3 1.3C1.3 5 1 7 1 7S.7 9.2.7 11.5v2.1c0 2.2.3 4.4.3 4.4s.3 2 1.2 2.8c1.1 1.2 2.6 1.1 3.3 1.2C7.5 22.2 12 22.2 12 22.2s4.6 0 6.8-.3c.6-.1 1.9-.1 3-1.3.9-.8 1.2-2.8 1.2-2.8s.3-2.2.3-4.4v-2.1C23.3 9.2 23 7 23 7zM9.7 15.5V8.3l8.1 3.6-8.1 3.6z"/>
                  </svg>
                </span>
                shotbymeganuso
              </a>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text" id="name" name="name"
                placeholder="Brand or contact name"
                value={form.name} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email" id="email" name="email"
                placeholder="you@brand.com"
                value={form.email} onChange={handleChange} required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Tell Me About Your Project</label>
              <textarea
                id="message" name="message"
                placeholder="What are you shooting? Timeline? Budget range?"
                value={form.message} onChange={handleChange} required
              />
            </div>
            <button
              type="submit"
              className={`submit-btn${status === 'success' ? ' success' : ''}${status === 'error' ? ' error' : ''}`}
              disabled={status === 'sending'}
            >
              {btnLabel}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
