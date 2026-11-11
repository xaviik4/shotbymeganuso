import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const root = path.resolve("dist");
const { render, SITE_CONFIG, getLanguage, getPageMetadata } = await import(pathToFileURL(path.resolve("dist-ssr/entry-server.js")));
const baseShell = await fs.readFile(path.join(root, "index.html"), "utf8");
const privateShell = baseShell
  .replace('<meta name="robots" content="index,follow" />', '<meta name="robots" content="noindex,nofollow" />')
  .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, "")
  .replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/>/g, "")
  .replace(/<title>[\s\S]*?<\/title>/, "<title>meganusopr</title>");
await fs.writeFile(path.join(root, "spa.html"), privateShell);
const paths = ["/", "/work", "/pricing", "/book", "/privacy", "/es", "/es/work", "/es/pricing", "/es/book", "/es/privacy"];
const escapeHtml = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

for (const route of paths) {
  const language = getLanguage(route);
  const key = route.replace(/^\/es(?=\/|$)/, "") || "/";
  const canonical = `${SITE_CONFIG.siteUrl}${route === "/" ? "/" : route}`;
  const english = `${SITE_CONFIG.siteUrl}${key === "/" ? "/" : key}`;
  const spanish = `${SITE_CONFIG.siteUrl}/es${key === "/" ? "" : key}`;
  const metadata = getPageMetadata(route, language);
  const nestedPath = route === "/" ? path.join(root, "index.html") : path.join(root, route.replace(/^\//, ""), "index.html");
  const cleanPath = route === "/" ? path.join(root, "index.html") : path.join(root, `${route.replace(/^\//, "")}.html`);
  await Promise.all([fs.mkdir(path.dirname(nestedPath), { recursive: true }), fs.mkdir(path.dirname(cleanPath), { recursive: true })]);
  let shell = baseShell;
  const markup = render(route);
  shell = shell.replace('<html lang="en">', `<html lang="${language}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(metadata.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<link rel="alternate" hreflang="en" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="en" href="${english}" />`)
    .replace(/<link rel="alternate" hreflang="es" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="es" href="${spanish}" />`)
    .replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"\s*\/>/, `<link rel="alternate" hreflang="x-default" href="${english}" />`)
    .replace(/<div id="root"><\/div>/, `<div id="root" data-prerendered="true">${markup}</div>`);
  await Promise.all([fs.writeFile(nestedPath, shell), ...(cleanPath === nestedPath ? [] : [fs.writeFile(cleanPath, shell)])]);
}
console.log(`Prerendered ${paths.length} public English and Spanish routes.`);
