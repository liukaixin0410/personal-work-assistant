import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

export function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    not_started: "未开始",
    in_progress: "进行中",
    pending: "待确认",
    blocked: "已阻塞",
    done: "已完成",
    todo: "未开始",
    doing: "进行中",
  };
  return statusMap[status] || status;
}

export function getPriorityText(priority: string) {
  const priorityMap: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低",
  };
  return priorityMap[priority] || priority;
}

export function getPriorityColor(priority: string) {
  const colorMap: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };
  return colorMap[priority] || "bg-gray-100 text-gray-800";
}

export function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    not_started: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    pending: "bg-yellow-100 text-yellow-800",
    blocked: "bg-red-100 text-red-800",
    done: "bg-green-100 text-green-800",
    todo: "bg-gray-100 text-gray-800",
    doing: "bg-blue-100 text-blue-800",
  };
  return colorMap[status] || "bg-gray-100 text-gray-800";
}
