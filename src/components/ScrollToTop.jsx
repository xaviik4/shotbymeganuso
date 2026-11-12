import { useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const POSITION_PREFIX = "shotbymeganuso:scroll:";

function savePosition(key, position = { x: window.scrollX, y: window.scrollY }) {
  try {
    sessionStorage.setItem(`${POSITION_PREFIX}${key}`, JSON.stringify(position));
  } catch {
    // Scrolling still works when browser storage is unavailable.
  }
}

function readPosition(key) {
  try {
    const position = JSON.parse(sessionStorage.getItem(`${POSITION_PREFIX}${key}`) || "null");
    return position && Number.isFinite(position.x) && Number.isFinite(position.y) ? position : null;
  } catch {
    return null;
  }
}

function scrollToHash(hash) {
  let id = hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    // Keep the raw id if the hash contains invalid percent encoding.
  }
  const target = document.getElementById(id);
  if (target) target.scrollIntoView();
}

export default function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const previousLocation = useRef(location);
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    const previous = previousLocation.current;
    const initialRender = !hasMounted.current;
    const pathnameChanged = previous.pathname !== location.pathname;
    const hashChanged = previous.hash !== location.hash;
    savePosition(previous.key);

    if (initialRender) {
      if (location.hash) {
        requestAnimationFrame(() => scrollToHash(location.hash));
      } else {
        const savedPosition = readPosition(location.key);
        if (savedPosition) window.scrollTo(savedPosition.x, savedPosition.y);
      }
    } else if (pathnameChanged) {
      if (navigationType === "POP") {
        const savedPosition = readPosition(location.key);
        if (savedPosition) {
          window.scrollTo(savedPosition.x, savedPosition.y);
        } else if (location.hash) {
          requestAnimationFrame(() => scrollToHash(location.hash));
        } else {
          window.scrollTo(0, 0);
        }
      } else if (location.hash) {
        requestAnimationFrame(() => scrollToHash(location.hash));
      } else {
        window.scrollTo(0, 0);
      }
    } else if (hashChanged && location.hash) {
      requestAnimationFrame(() => scrollToHash(location.hash));
    }

    previousLocation.current = location;
    hasMounted.current = true;
  }, [location.key, location.pathname, location.hash, navigationType]);

  useLayoutEffect(() => {
    const saveCurrentPosition = () => savePosition(location.key);
    window.addEventListener("pagehide", saveCurrentPosition);
    return () => window.removeEventListener("pagehide", saveCurrentPosition);
  }, [location.key]);

  return null;
}
