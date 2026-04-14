"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Alert } from "@/lib/types";

export function useAlerts(projectId?: number) {
  return useQuery({
    queryKey: ["alerts", projectId],
    queryFn: async () => {
      const params = projectId ? `?project_id=${projectId}` : "";
      const { data } = await api.get(`/api/v1/alerts${params}`);
      return data as Alert[];
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["alerts-unread"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/alerts/unread/count");
      return data.count as number;
    },
    refetchInterval: 60000,
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.put(`/api/v1/alerts/${id}/read`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alerts-unread"] });
    },
  });
}
