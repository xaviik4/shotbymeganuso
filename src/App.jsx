import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Cookbook from "./pages/Cookbook";
import Tracker from "./pages/Tracker";
import Dashboard from "./pages/Dashboard";
import Portal from "./pages/Portal";
import WorkPage from "./pages/WorkPage";
import Pricing from "./pages/Pricing";

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
      <AuthProvider>
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

          {/* ── Public: login page (no Nav/Footer) ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Protected: private tools (no Nav/Footer, hidden from public nav) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/portal" element={<Portal />} />
            <Route path="/cookbook" element={<Cookbook />} />
            <Route path="/tracker" element={<Tracker />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
