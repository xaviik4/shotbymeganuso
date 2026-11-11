import { WORK as sourcePhotos } from "../lib/constants";

export const PHOTOS = sourcePhotos.map((photo, index) => {
  const original = photo.img || "";
  const relative = original.replace(/^\/images\//, "");
  const stem = relative.replace(/\.[^.]+$/, "");
  return {
    ...photo,
    id: `${photo.cat}-${index}`,
    src: `/images-optimized/${stem}-1280.webp`,
    srcSet: [640, 1280, 2000].map((width) => `/images-optimized/${stem}-${width}.webp ${width}w`).join(", "),
    alt: `${photo.title} ${photo.cat.toLowerCase()} photography by Alexander`,
    featured: sourcePhotos.filter((item) => item.cat === photo.cat).indexOf(photo) < 8,
  };
});

export const PHOTO_CATEGORIES = ["Automotive", "Editorial", "Lifestyle", "Portrait"];
