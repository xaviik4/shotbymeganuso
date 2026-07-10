import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ClientPortal from "./pages/ClientPortal";

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

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public: full portfolio with shared Nav + Footer ── */}
          <Route
            path="/"
            element={
              <>
                <a href="#main" className="skip-link">Skip to main content</a>
                <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
                <main id="main">
                  <Home setToast={setToast} />
                </main>
                <Footer />
                <div
                  className={`toast${showToast ? " show" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {toast}
                </div>
              </>
            }
          />

          {/* ── Public: login page (no Nav/Footer) ── */}
          <Route path="/login" element={<Login />} />

          {/* ── Protected: client portal (no Nav/Footer) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/clients" element={<ClientPortal />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
