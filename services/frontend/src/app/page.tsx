"use client";

import { useEffect, useState, useCallback } from "react";
import { api, Task, Worker } from "@/lib/api";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { WorkerList } from "@/components/worker-list";
import { Activity, LayoutDashboard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [taskList, workerList] = await Promise.all([
        api.tasks.list(15),
        api.workers.list(),
      ]);
      setTasks(taskList);
      setWorkers(workerList);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20 text-primary border border-primary/30">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
              ML Scheduler
            </h1>
          </div>
          <p className="text-muted-foreground">Distributed task orchestration dashboard.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Live
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Workers */}
        <div className="lg:col-span-5 space-y-8">
          <TaskForm onTaskSubmitted={fetchData} />
          <WorkerList workers={workers} />
        </div>

        {/* Right Column: Task List */}
        <div className="lg:col-span-7">
          <TaskList tasks={tasks} />
        </div>
      </div>

      {/* Footer Info */}
      <footer className="text-center text-muted-foreground text-xs pt-8 border-t border-border/30">
        <div className="flex items-center justify-center gap-4">
          <span>Cluster status: Healthy</span>
          <span>•</span>
          <span>Next.js 15 + Tailwind 4 + Shadcn/ui</span>
        </div>
      </footer>
    </div>
  );
}
