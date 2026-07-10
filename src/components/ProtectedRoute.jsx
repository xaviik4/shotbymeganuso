import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires authentication.
 * - session === undefined  → still resolving (render nothing, avoid flash)
 * - session === null       → not authenticated → hard redirect to /login
 * - session is an object   → authenticated → render the child route via <Outlet>
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/clients" element={<ClientPortal />} />
 *   </Route>
 */
export default function ProtectedRoute() {
  const { session } = useAuth();

  // Still waiting for Supabase to resolve the initial session check.
  // Render nothing so we never flash the login page for an authenticated user.
  if (session === undefined) return null;

  // No session — hard redirect. `replace` removes /clients from history
  // so the back button doesn't loop them back to a protected route.
  if (!session) return <Navigate to="/login" replace />;

  // Authenticated — render whatever child route is nested inside.
  return <Outlet />;
}
