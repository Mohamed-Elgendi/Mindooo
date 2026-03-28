// ─────────────────────────────────────────────────────────────────
// useData.js — Dashboard data hook
//
// Loads all stats needed for the Home section.
// Refreshes when called. Caches in component state.
// ─────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { loadDashboardStats } from "../services/db";

export function useDashboardData(userId) {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await loadDashboardStats(userId);
      setStats(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
