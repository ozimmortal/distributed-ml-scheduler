"use client";

import { Task } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function TaskList({ tasks }: { tasks: Task[] }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "RUNNING":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/50">COMPLETED</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="bg-red-600/20 text-red-400 border-red-600/50">FAILED</Badge>;
      case "RUNNING":
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/50">RUNNING</Badge>;
      default:
        return <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/50">PENDING</Badge>;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          Task Monitor
        </CardTitle>
        <CardDescription>Real-time view of recent job executions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/20">
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Task Type</TableHead>
                <TableHead>Worker</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-primary/5 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      {getStatusBadge(task.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium font-mono text-xs">{task.taskType}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{task.assignedWorkerId || "---"}</TableCell>
                  <TableCell>
                    {task.resultJson?.accuracy ? (
                      <span className="text-green-500 font-bold">
                        {(task.resultJson.accuracy * 100).toFixed(1)}%
                      </span>
                    ) : task.errorText ? (
                      <span className="text-red-500 text-[10px] truncate max-w-[100px] inline-block" title={task.errorText}>
                        Error: {task.errorText}
                      </span>
                    ) : "---"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-[10px]">
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              ))}
              {tasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    Queue is empty. Submit a task to begin.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
