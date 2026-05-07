"use client";

import { Worker } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Server, Activity } from "lucide-react";

export function WorkerList({ workers }: { workers: Worker[] }) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Worker Cluster
        </CardTitle>
        <CardDescription>{workers.length} active nodes registered.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((worker) => (
            <div
              key={worker.workerId}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Cpu className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm truncate max-w-[120px]">{worker.hostname}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                    {worker.workerId.slice(0, 8)}...
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant={worker.status === "ONLINE" ? "default" : "destructive"}
                  className={`text-[10px] px-1 py-0 ${worker.status === "ONLINE" ? "bg-green-600 hover:bg-green-700" : ""}`}
                >
                  {worker.status}
                </Badge>
                <div className="text-[10px] text-muted-foreground">
                  Jobs: {worker.activeJobs}
                </div>
              </div>
            </div>
          ))}
          {workers.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground italic text-sm">
              No workers found. Start some nodes!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
