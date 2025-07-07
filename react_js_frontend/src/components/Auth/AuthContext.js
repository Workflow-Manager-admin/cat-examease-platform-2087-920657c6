import React, { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || "https://jzytsedlsvhnrfypwasm.supabase.co",
  process.env.REACT_APP_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eXRzZWRsc3ZobnJmeXB3YXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjEyMjAsImV4cCI6MjA2NzQ5NzIyMH0.Y_NeTtEhMP-mhFRFORnhQ_H3spyF6GQexR-k8-AWOn0"
);

const AuthContext = createContext({});

/**
 * PUBLIC_INTERFACE
 * @returns Authentication context provider for the whole app.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch session/user from Supabase on mount
  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ? { ...data.session.user, role: data.session.user.user_metadata?.role || "candidate" } : null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ? { ...session.user, role: session.user.user_metadata?.role || "candidate" } : null);
      setLoading(false);
    });
    return () => { listener?.subscription?.unsubscribe?.(); };
  }, []);

  // PUBLIC_INTERFACE
  const login = async (email, password) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setSession(data.session);
    setUser(data.session?.user ? { ...data.session.user, role: data.session.user.user_metadata?.role || "candidate" } : null);
    setLoading(false);
    if (error) throw error;
    return data;
  };

  // PUBLIC_INTERFACE
  const register = async (email, password, name) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { name, role: "candidate" }
      }
    });
    setSession(data.session);
    setUser(data.session?.user ? { ...data.session.user, role: "candidate" } : null);
    setLoading(false);
    if (error) throw error;
    return data;
  };

  // PUBLIC_INTERFACE
  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, logout, register, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * PUBLIC_INTERFACE
 * @returns AuthContext for use throughout the app
 */
export const useAuth = () => useContext(AuthContext);
export { AuthContext, supabase };
