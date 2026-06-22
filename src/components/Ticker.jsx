import './Ticker.css';

const ITEMS = [
  'PRODUCT PHOTOGRAPHY', 'AUTOMOTIVE CONTENT', 'FITNESS & LIFESTYLE', 'UGC VIDEO ADS',
  'BRAND CONTENT', 'SHORT-FORM VIDEO', 'CONTENT THAT CONVERTS', 'AVAILABLE WORLDWIDE',
];

// Double the array so the seamless loop works
const doubled = [...ITEMS, ...ITEMS];

export default function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {doubled.map((item, i) => (
          <span className="ticker-item" key={i}>
            {item}<span className="ticker-dot">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
