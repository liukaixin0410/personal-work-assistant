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
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { Todo } from "@/types";

// 模拟数据，当没有配置 Firebase 时使用
const mockTodos: Todo[] = [
  {
    id: "1",
    title: "完成项目首页开发",
    description: "开发个人工作助手的首页功能",
    priority: "high",
    status: "in_progress",
    dueTime: "2026-06-04T18:00:00",
    isToday: true,
    createdAt: "2026-06-03T08:00:00Z",
    updatedAt: "2026-06-03T09:00:00Z",
  },
  {
    id: "2",
    title: "整理上周工作总结",
    description: "整理上周的工作成果和问题",
    priority: "medium",
    status: "todo",
    isToday: true,
    createdAt: "2026-06-03T07:00:00Z",
    updatedAt: "2026-06-03T07:00:00Z",
  },
  {
    id: "3",
    title: "发送周报",
    priority: "low",
    status: "done",
    isToday: true,
    createdAt: "2026-06-03T06:00:00Z",
    updatedAt: "2026-06-03T08:30:00Z",
  },
];

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // 如果没有配置 Firebase，使用模拟数据
    if (!isFirebaseConfigured || !db) {
      setTimeout(() => {
        setTodos(mockTodos);
        setLoading(false);
      }, 500);
      return;
    }

    const q = query(
      collection(db, "todos"),
      where("isToday", "==", true),
      orderBy("priority", "asc"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const todoList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Todo[];
        setTodos(todoList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching todos:", err);
        setError("加载任务失败");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { todos, loading, error };
}

export function useTodoActions() {
  const addTodo = async (todo: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    if (!isFirebaseConfigured || !db) {
      console.log("Mock add todo:", todo);
      return "mock-id";
    }
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, "todos"), {
      ...todo,
      isToday: true,
      status: "todo",
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  };

  const updateTodo = async (id: string, todo: Partial<Todo>) => {
    if (!isFirebaseConfigured || !db) {
      console.log("Mock update todo:", id, todo);
      return;
    }
    const todoRef = doc(db, "todos", id);
    await updateDoc(todoRef, {
      ...todo,
      updatedAt: new Date().toISOString(),
    });
  };

  const deleteTodo = async (id: string) => {
    if (!isFirebaseConfigured || !db) {
      console.log("Mock delete todo:", id);
      return;
    }
    const todoRef = doc(db, "todos", id);
    await deleteDoc(todoRef);
  };

  return { addTodo, updateTodo, deleteTodo };
}
