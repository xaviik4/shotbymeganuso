import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import WorkPage from "./pages/WorkPage";
import Pricing from "./pages/Pricing";
import Book from "./pages/Book";
import Privacy from "./pages/Privacy";
import { getPageMetadata } from "./lib/site-copy";
import { getLanguage } from "./lib/language";
import { SITE_CONFIG } from "./lib/site-config";
import { loadAnalytics, trackPageView } from "./lib/analytics";

const Login = lazy(() => import("./pages/Login"));
const Cookbook = lazy(() => import("./pages/Cookbook"));
const Tracker = lazy(() => import("./pages/Tracker"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Clients = lazy(() => import("./pages/Clients"));
const Settings = lazy(() => import("./pages/Settings"));
const ContentPage = lazy(() => import("./pages/ContentPage"));

const PRIVATE_METADATA = {
  "/login": { title: "Client Login | meganusopr", description: "Sign in to access your private client tools." },
  "/portal": { title: "Client Portal | meganusopr", description: "Access your private client tools." },
  "/dashboard": { title: "Dashboard | meganusopr", description: "Review weekly sales activity, follow-ups, and client work." },
  "/dashboard/pipeline": { title: "Pipeline | meganusopr", description: "Manage the sales pipeline." },
  "/dashboard/clients": { title: "Clients | meganusopr", description: "Manage active client accounts." },
  "/dashboard/content": { title: "Content | meganusopr", description: "Review YouTube and Instagram performance." },
  "/dashboard/settings": { title: "Settings | meganusopr", description: "Operations workspace settings." },
  "/cookbook": { title: "Cookbook | meganusopr", description: "Browse recipes in your private client tools." },
  "/tracker": { title: "Nutrition Calculator | meganusopr", description: "Use the private nutrition calculator." },
};

function RouteMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const metadata = PRIVATE_METADATA[pathname] || getPageMetadata(pathname, getLanguage(pathname));
    const canonical = `${SITE_CONFIG.siteUrl}${pathname === "/" ? "/" : pathname}`;
    const language = getLanguage(pathname);
    const englishPath = pathname.replace(/^\/es(?=\/|$)/, "") || "/";
    const spanishPath = `/es${englishPath === "/" ? "" : englishPath}`;
    const privateRoute = /^\/(dashboard|portal|cookbook|tracker|login)(\/|$)/.test(pathname);
    document.documentElement.lang = language;
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[name="robots"]')?.setAttribute("content", privateRoute ? "noindex,nofollow" : "index,follow");
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", canonical);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", canonical);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", metadata.description);
    document.querySelector('link[hreflang="en"]')?.setAttribute("href", `${SITE_CONFIG.siteUrl}${englishPath}`);
    document.querySelector('link[hreflang="es"]')?.setAttribute("href", `${SITE_CONFIG.siteUrl}${spanishPath}`);
    if (!privateRoute) { loadAnalytics(); trackPageView(pathname); }
  }, [pathname]);
  return null;
}

function PublicLayout({ children, menuOpen, setMenuOpen, toast }) {
  return <><a href="#main" className="skip-link">Skip to main content</a><Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} /><main id="main">{children}</main><Footer /><div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div></>;
}

export function AppRoutes() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  const publicPage = (page) => <PublicLayout menuOpen={menuOpen} setMenuOpen={setMenuOpen} toast={toast}>{page}</PublicLayout>;
  const home = publicPage(<Home setToast={setToast} />);
  const work = publicPage(<WorkPage />);
  const pricing = publicPage(<Pricing />);
  const book = publicPage(<Book />);
  const privacy = publicPage(<Privacy />);
  return <AuthProvider><RouteMetadata /><Suspense fallback={<div className="track-loading" role="status">Loading page...</div>}><Routes>
    <Route path="/" element={home} /><Route path="/work" element={work} /><Route path="/pricing" element={pricing} /><Route path="/book" element={book} /><Route path="/privacy" element={privacy} />
    <Route path="/es" element={home} /><Route path="/es/work" element={work} /><Route path="/es/pricing" element={pricing} /><Route path="/es/book" element={book} /><Route path="/es/privacy" element={privacy} />
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}><Route path="/portal" element={<Navigate to="/dashboard" replace />} /><Route path="/dashboard" element={<Dashboard />} /><Route path="/dashboard/pipeline" element={<Pipeline />} /><Route path="/dashboard/clients" element={<Clients />} /><Route path="/dashboard/content" element={<ContentPage />} /><Route path="/dashboard/settings" element={<Settings />} /><Route path="/cookbook" element={<Cookbook />} /><Route path="/tracker" element={<Tracker />} /></Route>
  </Routes></Suspense></AuthProvider>;
}

export default function App() {
  return <BrowserRouter><ScrollToTop /><AppRoutes /></BrowserRouter>;
}
