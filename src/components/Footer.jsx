import { Link } from "react-router-dom";
import { SITE_CONFIG, SOCIALS } from "../lib/site-config";
import { useSiteCopy, localizedPath } from "../lib/language";
import { useLocation } from "react-router-dom";

export default function Footer() {
  const { copy, language } = useSiteCopy();
  const { pathname } = useLocation();
  const otherLanguagePath = localizedPath(pathname.replace(/^\/es(?=\/|$)/, "") || "/", language === "es" ? "en" : "es");
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-logo">
          <span className="rec-dot" aria-hidden="true"></span>
          {SITE_CONFIG.brandName.toUpperCase()}
        </div>
        <div className="footer-links">
          <Link to={localizedPath("/work", language)}>{copy.footer.work}</Link>
          <Link to={localizedPath("/pricing", language)}>{copy.footer.pricing}</Link>
          <Link to={localizedPath("/privacy", language)}>{copy.footer.privacy}</Link>
          <Link to={otherLanguagePath}>{copy.nav.language}</Link>
          <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://tiktok.com/@meganusopr" target="_blank" rel="noopener noreferrer">TikTok</a>
          <a href="https://youtube.com/@meganusopr" target="_blank" rel="noopener noreferrer">YouTube</a>
          <a href={`mailto:${SITE_CONFIG.email}`}>{copy.footer.email}</a>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "#777" }}>
          © {new Date().getFullYear()} {SITE_CONFIG.brandName}. All rights reserved.
        </span>
      </div>
      <p className="footer-a11y">{copy.footer.accessibility}</p>
    </footer>
  );
}
