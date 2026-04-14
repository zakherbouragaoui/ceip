"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { EvidenceRequest, EvidenceResult, FeedbackRequest } from "@/lib/types";

export function useEvidenceSearch() {
  return useMutation({
    mutationFn: async (req: EvidenceRequest): Promise<EvidenceResult> => {
      const { data } = await api.post("/api/v1/evidence", req);
      return data;
    },
  });
}

export function useQueryHistory(limit = 10) {
  return useQuery({
    queryKey: ["query-history", limit],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/queries/history?limit=${limit}`);
      return data;
    },
  });
}

export function useQueryResult(queryId: string | undefined) {
  return useQuery({
    queryKey: ["query-result", queryId],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/queries/${queryId}`);
      return data as EvidenceResult;
    },
    enabled: !!queryId,
  });
}

export function useFeedback() {
  return useMutation({
    mutationFn: async (req: FeedbackRequest) => {
      const { data } = await api.post("/api/v1/feedback", req);
      return data;
    },
  });
}
