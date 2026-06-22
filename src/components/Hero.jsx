import './Hero.css';

export default function Hero() {
  return (
    <section id="hero">
      <p className="hero-eyebrow">Content Creator · Available Worldwide</p>
      <h1 className="hero-title">
        SHOT<em>BY</em><br />MEGA<em>NUSO</em>
      </h1>
      <p className="hero-tag">
        <strong>Product, automotive &amp; lifestyle</strong> content that sells.
      </p>
      <a href="#contact" className="btn-primary" onClick={(e) => {
        e.preventDefault();
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }}>
        Work with Me
      </a>
      <div className="hero-scroll">
        <div className="scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
