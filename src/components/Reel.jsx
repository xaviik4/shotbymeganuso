import { useState } from 'react';
import './Reel.css';

// ← Swap this with your actual YouTube video ID when ready
const REEL_VIDEO_ID = 'YOUR_VIDEO_ID';

export default function Reel() {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    if (REEL_VIDEO_ID === 'YOUR_VIDEO_ID') return;
    setPlaying(true);
  };

  return (
    <section id="reel" className="reel-section">
      <div className="reel-inner">
        <p className="section-eyebrow">The Reel</p>
        <div className="reel-frame" onClick={handlePlay}>
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${REEL_VIDEO_ID}?autoplay=1&rel=0`}
              allow="autoplay; fullscreen"
              allowFullScreen
              title="Showreel"
            />
          ) : (
            <>
              <div className="play-btn">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="white">
                  <path d="M0 0L18 10L0 20V0Z" />
                </svg>
              </div>
              <p className="reel-label">Play Showreel 2024</p>
              {REEL_VIDEO_ID === 'YOUR_VIDEO_ID' && (
                <p className="reel-placeholder-note">Add your YouTube video ID in Reel.jsx</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
