const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3000";
const SCHEDULER_URL = process.env.NEXT_PUBLIC_SCHEDULER_URL || "http://localhost:3001";

export interface Task {
  id: string;
  taskType: string;
  status: string;
  priority: number;
  attempts: number;
  maxAttempts: number;
  assignedWorkerId: string | null;
  resultJson: any | null;
  errorText: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Worker {
  workerId: string;
  hostname: string;
  status: string;
  activeJobs: number;
  lastHeartbeatAt: string;
}

export const api = {
  tasks: {
    list: async (limit = 20): Promise<Task[]> => {
      const res = await fetch(`${GATEWAY_URL}/tasks?limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    submit: async (data: { taskType: string; dataset?: string; priority?: number }) => {
      const res = await fetch(`${GATEWAY_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit task");
      return res.json();
    },
    get: async (id: string): Promise<Task> => {
      const res = await fetch(`${GATEWAY_URL}/tasks/${id}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
  },
  workers: {
    list: async (): Promise<Worker[]> => {
      const res = await fetch(`${SCHEDULER_URL}/workers`);
      if (!res.ok) throw new Error("Failed to fetch workers");
      return res.json();
    },
  },
};
