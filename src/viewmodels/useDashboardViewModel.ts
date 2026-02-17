import { useState, useEffect, useCallback } from "react";
import type { DashboardStats, RevenueData, RecentActivity } from "@/models/Dashboard";
import { dashboardService } from "@/services/dashboardService";

export function useDashboardViewModel() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [s, r, a] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRevenueData(),
        dashboardService.getRecentActivity(),
      ]);
      setStats(s);
      setRevenueData(r);
      setRecentActivity(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { stats, revenueData, recentActivity, isLoading, error, refetch: fetchData };
}
