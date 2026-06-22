import './Footer.css';

export default function Footer() {
  return (
    <footer>
      <div className="footer-logo">SHOTBYMEGANUSO</div>
      <div className="footer-copy">© {new Date().getFullYear()} shotbymeganuso. All rights reserved.</div>
      <div className="footer-socials">
        <a href="https://instagram.com/shotbymeganuso" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://tiktok.com/@shotbymeganuso" target="_blank" rel="noopener noreferrer">TikTok</a>
        <a href="https://youtube.com/@shotbymeganuso" target="_blank" rel="noopener noreferrer">YouTube</a>
      </div>
    </footer>
  );
}
