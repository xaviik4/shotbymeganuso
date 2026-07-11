import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";
import {
  PRICING_TIERS, PHOTO_TIERS, VIDEO_TIERS,
  PRICING_PROOF, PRICING_FAQ, C,
} from "../lib/constants";

const TABS = [
  { key: "web",   label: "Web Design", data: PRICING_TIERS },
  { key: "photo", label: "Photography", data: PHOTO_TIERS },
  { key: "video", label: "Video",       data: VIDEO_TIERS },
];

const TAB_INTRO = {
  web:   "Custom-built websites for creators, small businesses, and personal brands.",
  photo: "Sessions built around your goals. Every image fully edited and color graded.",
  video: "Cinematic short and long-form video, shot and edited to stop the scroll.",
};

function TierCard({ tier, onCta }) {
  return (
    <div
      style={{
        background: tier.highlight
          ? `linear-gradient(180deg, rgba(255,77,0,0.05) 0%, ${C.card} 100%)`
          : C.card,
        border: `1px solid ${tier.highlight ? C.orange : C.border}`,
        padding: "44px 36px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {tier.highlight && (
        <div
          style={{
            position: "absolute", top: -12, left: 36,
            background: C.orange, color: C.white,
            padding: "5px 12px", fontSize: 10, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
          }}
        >
          Most Popular
        </div>
      )}

      <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.04em", marginBottom: 16, color: C.white }}>
        {tier.name}
      </h3>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 56, lineHeight: 1, color: C.white }}>
          {tier.price}
        </span>
        <span style={{ fontSize: 11, color: C.gray, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          {tier.billing}
        </span>
      </div>

      {tier.monthly && (
        <div style={{ fontSize: 13, color: C.orange, letterSpacing: "0.04em", marginBottom: 20, fontWeight: 500 }}>
          {tier.monthly}
        </div>
      )}

      <p
        style={{
          color: C.gray, fontSize: 14, lineHeight: 1.6,
          marginBottom: 24, paddingBottom: 24,
          borderBottom: `1px solid ${C.border}`,
          marginTop: tier.monthly ? 0 : 16,
        }}
      >
        {tier.subtitle}
      </p>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px 0", flex: 1 }}>
        {tier.features.map((f, idx) => (
          <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "9px 0", fontSize: 14, lineHeight: 1.5, color: C.grayLight }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.orange} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 4 }} aria-hidden="true">
              <path d="M5 12l4 4L19 7" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onCta}
        style={{
          width: "100%",
          background: tier.highlight ? C.orange : "transparent",
          color: C.white,
          border: tier.highlight ? "none" : `1px solid ${C.border}`,
          padding: "16px",
          fontFamily: "'Inter', sans-serif",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.15em",
          textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          if (tier.highlight) e.currentTarget.style.background = C.orangeDim;
          else { e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.background = "rgba(255,77,0,0.06)"; }
        }}
        onMouseLeave={(e) => {
          if (tier.highlight) e.currentTarget.style.background = C.orange;
          else { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = "transparent"; }
        }}
      >
        {tier.cta}
      </button>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("web");
  const [openFaq, setOpenFaq] = useState(null);

  const goToContact = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  const activeTab = TABS.find(t => t.key === tab);

  return (
    <>
      {/* HERO HEADER */}
      <section
        aria-labelledby="pricing-title"
        style={{ background: C.bg, paddingTop: "clamp(120px, 18vw, 200px)", paddingBottom: "clamp(40px, 6vw, 70px)" }}
      >
        <div className="section" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="sec-label">01 / Pricing</div>
            <h1 className="sec-title" id="pricing-title">Simple, Transparent Pricing</h1>
            <p className="sec-sub" style={{ maxWidth: 620, margin: "0 auto" }}>
              {TAB_INTRO[tab]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* TABS */}
      <section style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div
            role="tablist"
            aria-label="Service pricing categories"
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 48,
            }}
          >
            {TABS.map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => { setTab(t.key); setOpenFaq(null); }}
                style={{
                  background: tab === t.key ? C.orange : "transparent",
                  color: C.white,
                  border: `1px solid ${tab === t.key ? C.orange : C.border}`,
                  padding: "12px 28px",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (tab !== t.key) e.currentTarget.style.borderColor = C.orange; }}
                onMouseLeave={(e) => { if (tab !== t.key) e.currentTarget.style.borderColor = C.border; }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* TIER CARDS */}
      <section style={{ paddingTop: 0 }}>
        <div className="section">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: activeTab.data.length === 2
                ? "repeat(auto-fit, minmax(280px, 1fr))"
                : "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
              maxWidth: activeTab.data.length === 2 ? 900 : 1080,
              margin: "0 auto",
              alignItems: "stretch",
            }}
          >
            {activeTab.data.map((tier, i) => (
              <Reveal key={`${tab}-${tier.name}`} delay={i * 80}>
                <div style={{ height: "100%" }}>
                  <TierCard tier={tier} onCta={goToContact} />
                </div>
              </Reveal>
            ))}
          </div>

          <p style={{ textAlign: "center", color: C.gray, fontSize: 13, marginTop: 40, fontWeight: 300, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
            {tab === "web"
              ? "The monthly care plan covers hosting, security, updates, and ongoing changes so you never have to touch a thing. Prices in USD."
              : "Every project is fully edited and color graded. Prices in USD."}
            {" "}Need something different? <a href="#contact" onClick={(e) => { e.preventDefault(); goToContact(); }} style={{ color: C.orange }}>Reach out for a custom quote.</a>
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF — only on web tab */}
      {tab === "web" && (
        <section aria-labelledby="proof-title" style={{ background: C.panel }}>
          <div className="section">
            <Reveal>
              <div className="sec-label">02 / Recent Work</div>
              <h2 className="sec-title" id="proof-title">Built for real clients.</h2>
            </Reveal>
            <Reveal delay={100}>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, padding: 40, maxWidth: 700, marginTop: 32 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "0.04em", marginBottom: 4, color: C.white }}>
                  {PRICING_PROOF.name}
                </div>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.orange, marginBottom: 20 }}>
                  {PRICING_PROOF.location}
                </div>
                <p style={{ color: C.grayLight, fontSize: 15, lineHeight: 1.7 }}>
                  {PRICING_PROOF.desc}
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* FAQ — only on web tab (web-specific questions) */}
      {tab === "web" && (
        <section aria-labelledby="pricing-faq-title">
          <div className="section">
            <Reveal>
              <div className="sec-label">03 / Questions</div>
              <h2 className="sec-title" id="pricing-faq-title">Web Design FAQ</h2>
            </Reveal>
            <div className="faq-list">
              {PRICING_FAQ.map((f, i) => (
                <div className={`faq-item${openFaq === i ? " open" : ""}`} key={i}>
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                    {f.q}
                    <span className="faq-icon" aria-hidden="true">+</span>
                  </button>
                  <div className="faq-a"><p>{f.a}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section style={{ background: C.panel, textAlign: "center" }}>
        <div className="section">
          <Reveal>
            <h2 className="sec-title">Ready to start?</h2>
            <p className="sec-sub" style={{ maxWidth: 480, margin: "0 auto 32px" }}>
              Let's talk through what you need.
            </p>
            <button
              onClick={goToContact}
              style={{
                background: C.orange, color: C.white, border: "none",
                padding: "18px 44px", fontFamily: "'Inter', sans-serif",
                fontSize: 13, fontWeight: 700, letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.orangeDim)}
              onMouseLeave={(e) => (e.currentTarget.style.background = C.orange)}
            >
              Get in Touch
            </button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
