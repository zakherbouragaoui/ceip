"use client";

import { useQuery } from "@tanstack/react-query";
import { useQueryHistory } from "@/lib/hooks/use-evidence";
import api from "@/lib/api";
import type { DashboardStats, QueryHistoryItem } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, FolderKanban, Bug, FileText, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

function useStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/dashboard/stats");
      return data as DashboardStats;
    },
  });
}

const statCards = [
  { key: "total_queries" as const, label: "Total Queries", icon: Search },
  { key: "total_projects" as const, label: "Projects", icon: FolderKanban },
  { key: "total_species" as const, label: "Species Tracked", icon: Bug },
  { key: "total_papers" as const, label: "Papers Indexed", icon: FileText },
  { key: "unread_alerts" as const, label: "Unread Alerts", icon: Bell },
];

function confidenceBadge(c: string) {
  const map: Record<string, string> = {
    strong: "bg-green-100 text-green-800",
    moderate: "bg-yellow-100 text-yellow-800",
    weak: "bg-orange-100 text-orange-800",
    none: "bg-red-100 text-red-800",
  };
  return (
    <Badge variant="outline" className={map[c] ?? ""}>
      {c}
    </Badge>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: history, isLoading: historyLoading } = useQueryHistory(10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your conservation intelligence activity.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription className="text-xs font-medium">
                {s.label}
              </CardDescription>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p className="text-2xl font-bold">
                  {stats?.[s.key]?.toLocaleString() ?? 0}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent queries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Queries</CardTitle>
          <CardDescription>Your latest evidence searches</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !history?.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No queries yet.{" "}
              <Link href="/evidence" className="text-primary hover:underline">
                Search for evidence
              </Link>
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-28">Confidence</TableHead>
                  <TableHead className="w-24 text-right">Latency</TableHead>
                  <TableHead className="w-32 text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history as QueryHistoryItem[]).map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {q.question}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {q.query_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{confidenceBadge(q.confidence)}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {(q.latency_ms / 1000).toFixed(1)}s
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {q.timestamp
                        ? formatDistanceToNow(new Date(q.timestamp), {
                            addSuffix: true,
                          })
                        : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
