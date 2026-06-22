import { useState, useEffect, useRef } from 'react';
import './Portfolio.css';

const ITEMS = [
  // AUTOMOTIVE
  { title: 'BMW M4',        cat: 'automotive', img: '/images/Automotive/DSC05096.jpg' },
  { title: 'BMW M4',        cat: 'automotive', img: '/images/Automotive/DSC05115.jpg' },
  { title: 'BMW M4',        cat: 'automotive', img: '/images/Automotive/DSC05173.jpg' },
  { title: 'BMW M4',        cat: 'automotive', img: '/images/Automotive/DSC05179.jpg' },
  { title: 'Coastal Drive', cat: 'automotive', img: '/images/Automotive/DSC06288.jpg' },
  { title: 'Coastal Drive', cat: 'automotive', img: '/images/Automotive/DSC06299.jpg' },
  { title: 'Car Shoot',     cat: 'automotive', img: '/images/Automotive/CH0A1961.jpg' },
  { title: 'Car Shoot',     cat: 'automotive', img: '/images/Automotive/CH0A1967.jpg' },

  // EDITORIAL
  { title: 'Carson',         cat: 'editorial', img: '/images/Editorial/CH0A1414.jpg' },
  { title: 'Carson',         cat: 'editorial', img: '/images/Editorial/CH0A1422.jpg' },
  { title: 'OSU Basketball', cat: 'editorial', img: '/images/Editorial/CH0A3104.jpg' },
  { title: 'OSU Basketball', cat: 'editorial', img: '/images/Editorial/CH0A3105.jpg' },
  { title: 'OSU Basketball', cat: 'editorial', img: '/images/Editorial/CH0A3115.jpg' },
  { title: 'OSU Basketball', cat: 'editorial', img: '/images/Editorial/CH0A3139.jpg' },
  { title: 'Fashion',        cat: 'editorial', img: '/images/Editorial/CH0A4981.jpg' },
  { title: 'Fashion',        cat: 'editorial', img: '/images/Editorial/CH0A4994.jpg' },
  { title: 'Fashion',        cat: 'editorial', img: '/images/Editorial/CH0A5008.jpg' },
  { title: 'Fashion',        cat: 'editorial', img: '/images/Editorial/CH0A5016.jpg' },
  { title: 'Fashion',        cat: 'editorial', img: '/images/Editorial/CH0A5018.jpg' },
  { title: 'Fashion',        cat: 'editorial', img: '/images/Editorial/CH0A5063.jpg' },
  { title: 'Fashion',        cat: 'editorial', img: '/images/Editorial/CH0A5116.jpg' },
  { title: 'The Bricklayers',cat: 'editorial', img: '/images/Editorial/CH0A7091.jpg' },
  { title: 'The Bricklayers',cat: 'editorial', img: '/images/Editorial/CH0A7120.jpg' },
  { title: 'The Bricklayers',cat: 'editorial', img: '/images/Editorial/CH0A7125.jpg' },
  { title: 'The Bricklayers',cat: 'editorial', img: '/images/Editorial/CH0A7137.jpg' },
  { title: 'The Bricklayers',cat: 'editorial', img: '/images/Editorial/CH0A7148.jpg' },
  { title: 'The Bricklayers',cat: 'editorial', img: '/images/Editorial/CH0A7172.jpg' },

  // LIFESTYLE
  { title: 'Crater Lake',  cat: 'lifestyle', img: '/images/Lifestyle/CH0A3033.jpg' },
  { title: 'Crater Lake',  cat: 'lifestyle', img: '/images/Lifestyle/CH0A3036.jpg' },
  { title: 'Morning Fog',  cat: 'lifestyle', img: '/images/Lifestyle/CH0A3075.jpg' },
  { title: 'Coastline',    cat: 'lifestyle', img: '/images/Lifestyle/CH0A2018.jpg' },
  { title: 'On Location',  cat: 'lifestyle', img: '/images/Lifestyle/CH0A2037.jpg' },
  { title: 'On Location',  cat: 'lifestyle', img: '/images/Lifestyle/CH0A2226.jpg' },
  { title: 'On Location',  cat: 'lifestyle', img: '/images/Lifestyle/CH0A2333.jpg' },
  { title: 'Overlook',     cat: 'lifestyle', img: '/images/Lifestyle/CH0A1955.jpg' },
  { title: 'Overlook',     cat: 'lifestyle', img: '/images/Lifestyle/CH0A1969.jpg' },
  { title: 'Summit',       cat: 'lifestyle', img: '/images/Lifestyle/DSC05837.jpg' },
  { title: 'Summit',       cat: 'lifestyle', img: '/images/Lifestyle/DSC05839.jpg' },
  { title: "Mary's Peak",  cat: 'lifestyle', img: '/images/Lifestyle/DSC06315.jpg' },
  { title: "Mary's Peak",  cat: 'lifestyle', img: '/images/Lifestyle/DSC06338.jpg' },
  { title: 'Chicago',      cat: 'lifestyle', img: '/images/Lifestyle/Chi-Town2.jpg' },
  { title: 'Chicago',      cat: 'lifestyle', img: '/images/Lifestyle/Chi-Town4.jpg' },

  // PORTRAIT
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5513.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5516.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5522.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5638.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5674.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5700.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5720.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5735.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5778.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5786.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5866.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5929.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A5937.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6187.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6213.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6324.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6337.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6341.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6394.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6397.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6451.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6525.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6531.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6560.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6587.jpg' },
  { title: 'Grad Session', cat: 'portrait', img: '/images/Portrait/CH0A6660.jpg' },
];

const FILTERS = [
  { key: 'all',        label: 'All' },
  { key: 'automotive', label: 'Automotive' },
  { key: 'editorial',  label: 'Editorial' },
  { key: 'lifestyle',  label: 'Lifestyle' },
  { key: 'portrait',   label: 'Portrait' },
];

const CAT_LABEL = {
  automotive: 'Automotive',
  editorial:  'Editorial',
  lifestyle:  'Lifestyle',
  portrait:   'Portrait',
};

export default function Portfolio() {
  const [active, setActive] = useState('all');
  const itemRefs = useRef([]);

  const filtered = active === 'all' ? ITEMS : ITEMS.filter(i => i.cat === active);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filtered.length);
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.08 }
    );
    itemRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [active]);

  return (
    <section id="portfolio">
      <div className="max-w">
        <p className="section-eyebrow">Selected Work</p>
        <h2 className="section-title">THE WORK</h2>
        <p className="section-sub">Tap any filter to browse by category.</p>

        <div className="filter-bar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-btn${active === f.key ? ' active' : ''}`}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="portfolio-grid">
          {filtered.map((item, i) => (
            <div
              key={`${item.img}`}
              className="portfolio-item"
              ref={el => itemRefs.current[i] = el}
            >
              <img src={item.img} alt={item.title} loading="lazy" />
              <div className="portfolio-overlay">
                <div className="portfolio-cat">{CAT_LABEL[item.cat]}</div>
                <div className="portfolio-title">{item.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
