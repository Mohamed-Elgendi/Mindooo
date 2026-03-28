// ─────────────────────────────────────────────────────────────────
// useAuth — encapsulates all Supabase auth logic
// Use this hook in any component that needs auth.
// Change auth provider here without touching any page.
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

export function useAuth() {
  const navigate = useNavigate();
  const [user,      setUser]      = useState(null);
  const [firstName, setFirstName] = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/signin");
        return;
      }
      setUser(session.user);
      setFirstName(extractFirstName(session.user));
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/signin");
      } else {
        setUser(session.user);
        setFirstName(extractFirstName(session.user));
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  }, [navigate]);

  return { user, firstName, loading, logout };
}

function extractFirstName(user) {
  const meta = user?.user_metadata;
  const raw  = meta?.full_name || meta?.name || user?.email?.split("@")[0] || "Boss";
  return raw.split(" ")[0];
}
