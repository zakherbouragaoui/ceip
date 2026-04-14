"use client";

import { useState } from "react";
import Link from "next/link";
import { useProjects, useCreateProject, useDeleteProject } from "@/lib/hooks/use-projects";
import { ProjectForm } from "@/components/projects/project-form";
import type { ConservationProject } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MapPin, Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<"active" | "archived">("active");

  const filtered = projects?.filter((p) =>
    tab === "active" ? p.is_active === 1 : p.is_active === 0
  );

  function handleCreate(data: Partial<ConservationProject>) {
    createProject.mutate(data, {
      onSuccess: () => {
        setFormOpen(false);
        toast.success("Project created");
      },
      onError: () => toast.error("Failed to create project"),
    });
  }

  function handleArchive(id: number) {
    deleteProject.mutate(id, {
      onSuccess: () => toast.success("Project archived"),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Projects
          </h1>
          <p className="text-muted-foreground">
            Track conservation projects and receive evidence alerts.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "active" | "archived")}
      >
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-3 pt-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filtered?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {tab === "active"
                ? "No active projects yet."
                : "No archived projects."}
            </p>
            {tab === "active" && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFormOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Create your first project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="group relative hover:shadow-md transition-shadow">
              <Link href={`/projects/${p.id}`}>
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {p.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {p.species_groups?.split(",").filter(Boolean).map((s) => (
                      <Badge
                        key={s}
                        variant="secondary"
                        className="text-xs capitalize"
                      >
                        {s}
                      </Badge>
                    ))}
                  </div>
                  {p.geography && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {p.geography}
                    </p>
                  )}
                </CardContent>
              </Link>
              {tab === "active" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  onClick={(e) => {
                    e.preventDefault();
                    handleArchive(p.id);
                  }}
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <ProjectForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        loading={createProject.isPending}
      />
    </div>
  );
}
