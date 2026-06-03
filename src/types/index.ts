export interface DashboardMetric {
  id: string;
  name: string;
  value: string | number;
  delta: string | number;
  updatedAt: string;
  detailUrl: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "not_started" | "in_progress" | "pending" | "blocked" | "done";
  priority: "high" | "medium" | "low";
  startDate?: string;
  dueDate?: string;
  progress?: string;
  nextAction?: string;
  risk?: string;
  link?: string;
  updatedAt: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "doing" | "done";
  dueTime?: string;
  isToday: boolean;
  updatedAt: string;
  createdAt: string;
}

export type ProjectStatus = Project["status"];
export type ProjectPriority = Project["priority"];
export type TodoStatus = Todo["status"];
export type TodoPriority = Todo["priority"];
