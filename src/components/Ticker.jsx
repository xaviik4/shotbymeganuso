export default function Ticker() {
  const items = ["Automotive", "Editorial", "Lifestyle", "Portrait", "UGC", "Web Design", "Reels", "Product"];
  const row = items.map((it, i) => (
    <span className="ticker-item" key={i}><span>●</span>{it}</span>
  ));
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">{row}{row}</div>
    </div>
  );
}
