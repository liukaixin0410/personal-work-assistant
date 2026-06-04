"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, Circle, ListTodo } from "lucide-react";
import {
  Card,
  CardContent,
  EmptyState,
  LoadingState,
  Button,
  Input,
  Select,
  Label,
  Textarea,
  Modal,
  ConfirmModal,
} from "@/components";
import { useTodos, useTodoActions } from "@/hooks/useTodos";
import { formatDate, getStatusText, getPriorityText, getPriorityColor, getStatusColor } from "@/lib/utils";
import type { Todo, TodoStatus, TodoPriority } from "@/types";

const statusOptions: { value: TodoStatus; label: string }[] = [
  { value: "todo", label: "未开始" },
  { value: "doing", label: "进行中" },
  { value: "done", label: "已完成" },
];

const priorityOptions: { value: TodoPriority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function TodosPage() {
  const { todos, loading, error } = useTodos();
  const { addTodo, updateTodo, deleteTodo } = useTodoActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [quickAddPriority, setQuickAddPriority] = useState<TodoPriority>("medium");
  const [actionError, setActionError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const pendingTodos = todos.filter((t) => t.status !== "done");
  const completedTodos = todos.filter((t) => t.status === "done");

  const handleAddTodo = () => {
    setEditingTodo(null);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleDeleteTodo = (todoId: string) => {
    setTodoToDelete(todoId);
    setIsDeleteModalOpen(true);
  };

  const handleQuickAdd = async () => {
    console.log("[Todo] 点击添加按钮:", quickAddTitle, quickAddPriority);

    // 如果快速添加输入框有内容，直接添加
    if (quickAddTitle.trim()) {
      setIsSaving(true);
      setActionError(null);
      setDebugInfo("正在请求 Firebase 保存数据...");

      try {
        const result = await addTodo({
          title: quickAddTitle,
          priority: quickAddPriority,
          isToday: true,
          status: "todo",
        });
        console.log("[Todo] 保存成功，返回ID:", result);
        setQuickAddTitle("");
        setDebugInfo("保存成功！");
        setTimeout(() => setDebugInfo(null), 2000);
      } catch (err) {
        console.error("[Todo] 保存失败:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        setActionError("添加任务失败：" + errorMsg + "（请确保已在 Firebase 控制台创建 Firestore 数据库）");
        setDebugInfo(null);
      } finally {
        setIsSaving(false);
      }
    } else {
      // 如果没有输入内容，打开详细表单弹窗
      console.log("[Todo] 快速添加输入为空，打开详细表单弹窗");
      setEditingTodo(null);
      setIsModalOpen(true);
    }
  };

  const handleSaveTodo = async (data: Omit<Todo, "id" | "createdAt" | "updatedAt" | "isToday">) => {
    setIsSaving(true);
    setActionError(null);
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, data);
      } else {
        await addTodo({ ...data, isToday: true });
      }
      setIsModalOpen(false);
      setEditingTodo(null);
    } catch (err) {
      console.error("Failed to save todo:", err);
      setActionError("保存任务失败：" + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const newStatus = todo.status === "done" ? "todo" : "done";
      await updateTodo(todo.id, { status: newStatus });
    } catch (err) {
      console.error("Failed to toggle todo:", err);
      setActionError("更新任务状态失败：" + (err as Error).message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!todoToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTodo(todoToDelete);
      setIsDeleteModalOpen(false);
      setTodoToDelete(null);
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setActionError("删除任务失败：" + (err as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">今日 To Do</h1>
          <p className="text-gray-500 mt-1">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap items-center">
            <Input
              placeholder="快速添加：输入任务标题后按回车；或直接点击添加打开详细表单..."
              value={quickAddTitle}
              onChange={(e) => {
                setQuickAddTitle(e.target.value);
                if (actionError) setActionError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleQuickAdd();
                }
              }}
              className="flex-1 min-w-[300px]"
              autoFocus
            />
            <Select
              value={quickAddPriority}
              onChange={(e) => setQuickAddPriority(e.target.value as TodoPriority)}
              className="w-32"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
            <Button
              onClick={handleQuickAdd}
              disabled={isSaving}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSaving ? "添加中..." : "添加"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <strong>❌ 错误：</strong> {actionError}
        </div>
      )}

      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-sm">
          🔄 {debugInfo}
        </div>
      )}

      {loading ? (
        <LoadingState message="加载任务中..." />
      ) : error ? (
        <EmptyState
          title="加载失败"
          description={error}
          action={<Button onClick={() => window.location.reload()}>重试</Button>}
        />
      ) : todos.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="w-12 h-12" />}
          title="今天还没有任务"
          description="添加你的第一个任务，开始高效的一天"
          action={
            <Button onClick={handleAddTodo}>
              <Plus className="w-4 h-4 mr-2" />
              添加任务
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              未完成 ({pendingTodos.length})
            </h2>
            {pendingTodos.length === 0 ? (
              <Card className="text-center py-8 text-gray-500">
                所有任务都已完成！
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </div>
            )}
          </div>

          {completedTodos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                已完成 ({completedTodos.length})
              </h2>
              <div className="grid gap-4 opacity-75">
                {completedTodos.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggleComplete={handleToggleComplete}
                    onEdit={handleEditTodo}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <TodoFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSave={handleSaveTodo}
        editingTodo={editingTodo}
        isSaving={isSaving}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTodoToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="删除任务"
        message="确定要删除这个任务吗？此操作无法撤销。"
        confirmText="删除"
        isLoading={isDeleting}
      />
    </div>
  );
}

function TodoCard({
  todo,
  onToggleComplete,
  onEdit,
  onDelete,
}: {
  todo: Todo;
  onToggleComplete: (t: Todo) => void;
  onEdit: (t: Todo) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className={todo.status === "done" ? "bg-gray-50" : ""}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <button
            onClick={() => onToggleComplete(todo)}
            className="mt-1 flex-shrink-0"
          >
            {todo.status === "done" ? (
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            ) : (
              <Circle className="w-6 h-6 text-gray-400" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className={`font-medium text-gray-900 ${
                  todo.status === "done" ? "line-through text-gray-500" : ""
                }`}
              >
                {todo.title}
              </p>
              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="icon" onClick={() => onEdit(todo)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(todo.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            {todo.description && (
              <p
                className={`text-sm text-gray-500 mt-1 ${
                  todo.status === "done" ? "line-through" : ""
                }`}
              >
                {todo.description}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                {getPriorityText(todo.priority)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                {getStatusText(todo.status)}
              </span>
              {todo.dueTime && (
                <span className="text-gray-500">
                  截止: {formatDate(todo.dueTime)}
                </span>
              )}
              <span className="text-gray-400">
                创建: {formatDate(todo.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TodoFormModal({
  isOpen,
  onClose,
  onSave,
  editingTodo,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Todo, "id" | "createdAt" | "updatedAt" | "isToday">) => void;
  editingTodo: Todo | null;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as TodoPriority,
    status: "todo" as TodoStatus,
    dueTime: "",
  });

  useEffect(() => {
    if (editingTodo) {
      setFormData({
        title: editingTodo.title,
        description: editingTodo.description || "",
        priority: editingTodo.priority,
        status: editingTodo.status,
        dueTime: editingTodo.dueTime || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        dueTime: "",
      });
    }
  }, [editingTodo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingTodo ? "编辑任务" : "新建任务"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">任务标题 *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((d) => ({ ...d, title: e.target.value }))}
            placeholder="输入任务标题"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">任务描述</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="输入任务描述"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">优先级 *</Label>
            <Select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData((d) => ({ ...d, priority: e.target.value as TodoPriority }))
              }
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">状态</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((d) => ({ ...d, status: e.target.value as TodoStatus }))
              }
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueTime">截止时间</Label>
          <Input
            id="dueTime"
            type="datetime-local"
            value={formData.dueTime}
            onChange={(e) =>
              setFormData((d) => ({ ...d, dueTime: e.target.value }))
            }
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
