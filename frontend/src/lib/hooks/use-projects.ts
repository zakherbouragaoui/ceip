"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type { ConservationProject } from "@/lib/types";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/projects");
      return data as ConservationProject[];
    },
  });
}

export function useProject(id: number | undefined) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/projects/${id}`);
      return data as ConservationProject;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (project: Partial<ConservationProject>) => {
      const { data } = await api.post("/api/v1/projects", project);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...project
    }: Partial<ConservationProject> & { id: number }) => {
      const { data } = await api.put(`/api/v1/projects/${id}`, project);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await api.delete(`/api/v1/projects/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}
