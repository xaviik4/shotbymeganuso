import { lazy, Suspense, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import WorkPage from "./pages/WorkPage";
import Pricing from "./pages/Pricing";

// Keep authenticated tools and the login UI out of the public page bundle.
const Login = lazy(() => import("./pages/Login"));
const Cookbook = lazy(() => import("./pages/Cookbook"));
const Tracker = lazy(() => import("./pages/Tracker"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Book = lazy(() => import("./pages/Book"));
const Pipeline = lazy(() => import("./pages/Pipeline"));
const Clients = lazy(() => import("./pages/Clients"));
const Settings = lazy(() => import("./pages/Settings"));
const ContentPage = lazy(() => import("./pages/ContentPage"));

const PAGE_METADATA = {
  "/": {
    title: "shotbymeganuso",
    description: "Cinematic photography, video, and web design by Alexander. Based in Oregon and available for travel.",
  },
  "/work": {
    title: "Work | shotbymeganuso",
    description: "Browse automotive, editorial, lifestyle, and portrait photography by Alexander.",
  },
  "/pricing": {
    title: "Pricing | shotbymeganuso",
    description: "Explore photography, video, and custom web design packages by Alexander.",
  },
  "/book": {
    title: "Intake | shotbymeganuso",
    description: "Tell Alexander about your business and what you'd like help with.",
  },
  "/login": {
    title: "Client Login | shotbymeganuso",
    description: "Sign in to access your private client tools.",
  },
  "/portal": {
    title: "Client Portal | shotbymeganuso",
    description: "Access your private client tools.",
  },
  "/dashboard": {
    title: "Dashboard | shotbymeganuso",
    description: "Review weekly sales activity, follow-ups, and client work.",
  },
  "/dashboard/pipeline": { title: "Pipeline | shotbymeganuso", description: "Manage the sales pipeline." },
  "/dashboard/clients": { title: "Clients | shotbymeganuso", description: "Manage active client accounts." },
  "/dashboard/content": { title: "Content | shotbymeganuso", description: "Review YouTube and Instagram performance." },
  "/dashboard/settings": { title: "Settings | shotbymeganuso", description: "Operations workspace settings." },
  "/cookbook": {
    title: "Cookbook | shotbymeganuso",
    description: "Browse recipes in your private client tools.",
  },
  "/tracker": {
    title: "Nutrition Calculator | shotbymeganuso",
    description: "Use the private nutrition calculator.",
  },
};

function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = PAGE_METADATA[pathname] || PAGE_METADATA["/"];
    document.title = metadata.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", metadata.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", metadata.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", metadata.description);
  }, [pathname]);

  return null;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (toast) {
      setShowToast(true);
      const t = setTimeout(() => {
        setShowToast(false);
        setTimeout(() => setToast(""), 400);
      }, 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Shared public layout — Nav, main, Footer, toast
  const PublicLayout = ({ children }) => (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main id="main">{children}</main>
      <Footer />
      <div
        className={`toast${showToast ? " show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </>
  );

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <RouteMetadata />
        <Suspense fallback={<div className="track-loading" role="status">Loading page...</div>}>
          <Routes>
            {/* ── Public: Home ── */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <Home setToast={setToast} />
                </PublicLayout>
              }
            />

            {/* ── Public: Work (full portfolio) ── */}
            <Route
              path="/work"
              element={
                <PublicLayout>
                  <WorkPage />
                </PublicLayout>
              }
            />

            {/* ── Public: Pricing (web design) ── */}
            <Route
              path="/pricing"
              element={
                <PublicLayout>
                  <Pricing />
                </PublicLayout>
              }
            />

            <Route
              path="/book"
              element={
                <PublicLayout>
                  <Book />
                </PublicLayout>
              }
            />

            {/* ── Public: login page (no Nav/Footer) ── */}
            <Route path="/login" element={<Login />} />

            {/* ── Protected: private tools (no Nav/Footer, hidden from public nav) ── */}
            <Route element={<ProtectedRoute />}>
              <Route path="/portal" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/pipeline" element={<Pipeline />} />
              <Route path="/dashboard/clients" element={<Clients />} />
              <Route path="/dashboard/content" element={<ContentPage />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/cookbook" element={<Cookbook />} />
              <Route path="/tracker" element={<Tracker />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
