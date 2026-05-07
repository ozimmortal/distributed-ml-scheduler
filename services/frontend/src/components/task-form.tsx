"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Send } from "lucide-react";

export function TaskForm({ onTaskSubmitted }: { onTaskSubmitted: () => void }) {
  const [loading, setLoading] = useState(false);
  const [taskType, setTaskType] = useState("iris_logreg_train");
  const [priority, setPriority] = useState("5");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.tasks.submit({
        taskType,
        dataset: "iris",
        priority: parseInt(priority),
      });
      toast.success("Task submitted successfully");
      onTaskSubmitted();
    } catch (error) {
      toast.error("Failed to submit task");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Command Center
        </CardTitle>
        <CardDescription>Dispatch new ML training jobs to the cluster.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-type">Task Type</Label>
            <Select value={taskType} onValueChange={(val) => val && setTaskType(val)}>
              <SelectTrigger id="task-type">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iris_logreg_train">Iris Logistic Regression</SelectItem>
                <SelectItem value="iris_random_forest_train">Iris Random Forest</SelectItem>
                <SelectItem value="iris_model_eval">Iris Model Evaluation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority (1-10)</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full gap-2 transition-all hover:scale-[1.02]" disabled={loading}>
            {loading ? "Submitting..." : (
              <>
                <Send className="w-4 h-4" />
                Submit Task
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
