export const SITE_CONFIG = Object.freeze({
  brandName: "meganusopr",
  ownerName: "Alexander",
  siteUrl: "https://www.shotbymeganuso.com",
  email: "hello@shotbymeganuso.com",
  instagramUrl: "https://instagram.com/meganusopr",
  tiktokUrl: "https://tiktok.com/@meganusopr",
  youtubeUrl: "https://youtube.com/@meganusopr",
  bookingUrl: "https://calendar.app.google/Sh3XTkwN6UL22d9y9",
  analytics: {
    ga4Id: import.meta.env?.VITE_GA4_ID || "",
    metaPixelId: import.meta.env?.VITE_META_PIXEL_ID || "",
  },
});

export const SOCIALS = Object.freeze({
  instagram: SITE_CONFIG.instagramUrl,
  tiktok: SITE_CONFIG.tiktokUrl,
  youtube: SITE_CONFIG.youtubeUrl,
});
