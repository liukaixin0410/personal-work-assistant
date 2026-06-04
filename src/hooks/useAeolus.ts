"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchAeolusData, type AeolusMetric, type AeolusDashboardType, DASHBOARD_CONFIGS } from "@/lib/aeolus";

export function useAeolus(type: AeolusDashboardType) {
  const [metrics, setMetrics] = useState<AeolusMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAeolusData(type);
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch aeolus data:", err);
      setError(err instanceof Error ? err.message : "获取数据失败");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { metrics, loading, error, refresh: fetchData, config: DASHBOARD_CONFIGS[type] };
}
