"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  where,
  QueryConstraint,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { Project } from "@/types";

// 模拟数据，当没有配置 Firebase 时使用
const mockProjects: Project[] = [
  {
    id: "1",
    name: "个人工作助手开发",
    description: "开发个人工作管理 Web 应用",
    status: "in_progress",
    priority: "high",
    progress: "75%",
    nextAction: "完成任务详情页面",
    risk: "暂无",
    dueDate: "2026-06-15",
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-03T00:00:00Z",
  },
  {
    id: "2",
    name: "数据看板优化",
    description: "优化数据看板的展示和交互",
    status: "pending",
    priority: "medium",
    progress: "20%",
    nextAction: "收集数据需求",
    risk: "暂无",
    createdAt: "2026-06-02T00:00:00Z",
    updatedAt: "2026-06-02T00:00:00Z",
  },
];

const projectPriorityOrder: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function useProjects(filters?: {
  status?: string;
  priority?: string;
  keyword?: string;
  sortBy?: string;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 如果没有配置 Firebase，使用模拟数据
    if (!isFirebaseConfigured || !db) {
      setTimeout(() => {
        setProjects(mockProjects);
        setLoading(false);
      }, 500);
      return;
    }

    const q = query(collection(db, "projects"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let projectList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Project[];

        // 客户端筛选（避免需要 Firebase 复合索引）
        if (filters?.status && filters.status !== "all") {
          projectList = projectList.filter((p) => p.status === filters.status);
        }
        if (filters?.priority && filters.priority !== "all") {
          projectList = projectList.filter((p) => p.priority === filters.priority);
        }
        if (filters?.keyword) {
          const keyword = filters.keyword.toLowerCase();
          projectList = projectList.filter((project) =>
            project.name.toLowerCase().includes(keyword)
          );
        }

        // 客户端排序
        const sortBy = filters?.sortBy || "updatedAt";
        if (sortBy === "priority") {
          projectList.sort((a, b) => projectPriorityOrder[a.priority] - projectPriorityOrder[b.priority]);
        } else if (sortBy === "dueDate") {
          projectList.sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          });
        } else {
          projectList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }

        setProjects(projectList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching projects:", err);
        setError("加载项目失败：" + (err as Error).message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [filters]);

  return { projects, loading, error };
}

export function useProjectActions() {
  const addProject = async (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    if (!isFirebaseConfigured || !db) {
      console.log("Mock add project:", project);
      return "mock-id";
    }
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "projects"), {
      ...project,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  };

  const updateProject = async (id: string, project: Partial<Project>) => {
    if (!isFirebaseConfigured || !db) {
      console.log("Mock update project:", id, project);
      return;
    }
    const projectRef = doc(db, "projects", id);
    await updateDoc(projectRef, {
      ...project,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteProject = async (id: string) => {
    if (!isFirebaseConfigured || !db) {
      console.log("Mock delete project:", id);
      return;
    }
    const projectRef = doc(db, "projects", id);
    await deleteDoc(projectRef);
  };

  return { addProject, updateProject, deleteProject };
}
