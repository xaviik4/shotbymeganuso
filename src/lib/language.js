import { useLocation } from "react-router-dom";
import { getCopy } from "./site-copy";

export function getLanguage(pathname = "/") {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
}

export function useSiteCopy() {
  const { pathname } = useLocation();
  const language = getLanguage(pathname);
  return { language, copy: getCopy(language) };
}

export function localizedPath(path, language) {
  const clean = path === "/" ? "" : path;
  return language === "es" ? (clean ? `/es${clean}` : "/es") : path;
}
