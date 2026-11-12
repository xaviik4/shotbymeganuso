/* eslint react-refresh/only-export-components: off */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { AppRoutes } from "./App";
export { getLanguage } from "./lib/language";
export { getPageMetadata } from "./lib/site-copy";
export { SITE_CONFIG } from "./lib/site-config";

export function render(url) {
  return renderToString(<StaticRouter location={url}><AppRoutes /></StaticRouter>);
}
