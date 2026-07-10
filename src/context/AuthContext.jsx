import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // undefined = still resolving, null = no session, object = authenticated
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // onAuthStateChange fires once immediately with the current session
    // (or null if none), then again on every login / logout / token refresh.
    // This is the only place we read session state — no manual localStorage.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
