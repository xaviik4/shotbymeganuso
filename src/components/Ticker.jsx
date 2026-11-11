import { useSiteCopy } from "../lib/language";
export default function Ticker() {
  const { copy } = useSiteCopy();
  const items = copy.ticker;
  const row = items.map((it, i) => (
    <span className="ticker-item" key={i}><span>●</span>{it}</span>
  ));
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">{row}{row}</div>
    </div>
  );
}
