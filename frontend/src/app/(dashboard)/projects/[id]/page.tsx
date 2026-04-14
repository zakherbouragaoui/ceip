"use client";

import { use, useState } from "react";
import { useProject, useUpdateProject } from "@/lib/hooks/use-projects";
import { useAlerts, useMarkAlertRead } from "@/lib/hooks/use-alerts";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, MapPin, Bell, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = parseInt(id, 10);
  const { data: project, isLoading } = useProject(projectId);
  const { data: alerts } = useAlerts(projectId);
  const markRead = useMarkAlertRead();
  const updateProject = useUpdateProject();
  const [editOpen, setEditOpen] = useState(false);

  function handleUpdate(data: Partial<ConservationProject>) {
    updateProject.mutate(
      { ...data, id: projectId },
      {
        onSuccess: () => {
          setEditOpen(false);
          toast.success("Project updated");
        },
      }
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return <p className="text-muted-foreground">Project not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {project.name}
          </h1>
          <p className="text-muted-foreground">
            {project.description || "No description"}
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">
            Alert Feed
            {alerts?.filter((a) => !a.sent).length ? (
              <Badge variant="destructive" className="ml-2 h-5 px-1 text-xs">
                {alerts.filter((a) => !a.sent).length}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Species Groups
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.species_groups?.split(",").filter(Boolean).map((s) => (
                    <Badge key={s} variant="secondary" className="capitalize">
                      {s}
                    </Badge>
                  )) || (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Intervention Types
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.intervention_types
                    ?.split(",")
                    .filter(Boolean)
                    .map((iv) => (
                      <Badge key={iv} variant="secondary">
                        {iv.replace(/_/g, " ")}
                      </Badge>
                    )) || (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
              <Separator />
              {project.geography && (
                <p className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  {project.geography}
                </p>
              )}
              <p className="flex items-center gap-1 text-sm">
                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                Alerts:{" "}
                <span className="capitalize">{project.alert_frequency}</span>
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4 space-y-3">
          {!alerts?.length ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No alerts yet. New research matching your project will appear
                here.
              </CardContent>
            </Card>
          ) : (
            alerts.map((a) => (
              <Card key={a.id}>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      {a.paper_title || a.paper_id}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Relevance: {(a.score * 100).toFixed(0)}% &middot;{" "}
                      {a.created_at &&
                        formatDistanceToNow(new Date(a.created_at), {
                          addSuffix: true,
                        })}
                    </CardDescription>
                  </div>
                  {!a.sent ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markRead.mutate(a.id)}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" /> Mark read
                    </Button>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Read
                    </Badge>
                  )}
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {project && (
        <ProjectForm
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={handleUpdate}
          initial={project}
          loading={updateProject.isPending}
        />
      )}
    </div>
  );
}
