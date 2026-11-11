import { SITE_CONFIG } from "./site-config";

let loaded = false;
let ga4Enabled = false;
let metaPixelEnabled = false;

export function loadAnalytics() {
  if (typeof window === "undefined" || loaded) return;
  loaded = true;
  const { ga4Id, metaPixelId } = SITE_CONFIG.analytics;
  ga4Enabled = Boolean(ga4Id);
  metaPixelEnabled = Boolean(metaPixelId);
  if (ga4Id) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", ga4Id, { send_page_view: false });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(script);
  }
  if (metaPixelId) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments);};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s);}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq("init", metaPixelId);
  }
}

export function trackPageView(pathname) {
  if (typeof window === "undefined") return;
  if (ga4Enabled && window.gtag) window.gtag("event", "page_view", { page_path: pathname });
  if (metaPixelEnabled && window.fbq) window.fbq("track", "PageView");
}

export function trackLead(source = "contact") {
  if (typeof window === "undefined") return;
  if (window.gtag) window.gtag("event", "generate_lead", { lead_source: source });
  if (window.fbq) window.fbq("track", "Lead", { content_name: source });
}
