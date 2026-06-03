"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, FolderCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { useProjects, useProjectActions } from "@/hooks/useProjects";
import {
  formatDate,
  getStatusText,
  getPriorityText,
  getPriorityColor,
  getStatusColor,
} from "@/lib/utils";
import type { Project, ProjectStatus, ProjectPriority } from "@/types";

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "not_started", label: "未开始" },
  { value: "in_progress", label: "进行中" },
  { value: "pending", label: "待确认" },
  { value: "blocked", label: "已阻塞" },
  { value: "done", label: "已完成" },
];

const priorityOptions: { value: ProjectPriority; label: string }[] = [
  { value: "high", label: "高" },
  { value: "medium", label: "中" },
  { value: "low", label: "低" },
];

export default function ProjectsPage() {
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all",
    keyword: "",
    sortBy: "updatedAt",
  });
  const { projects, loading, error } = useProjects(filters);
  const { addProject, updateProject, deleteProject } = useProjectActions();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsDeleteModalOpen(true);
  };

  const handleSaveProject = async (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    setIsSaving(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await addProject(data);
      }
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await deleteProject(projectToDelete);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">最近跟进的项目</h1>
        </div>
        <Button onClick={handleAddProject}>
          <Plus className="w-4 h-4 mr-2" />
          新建项目
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="搜索项目名称..."
                  value={filters.keyword}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, keyword: e.target.value }))
                  }
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="all">全部</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, priority: e.target.value }))
                }
              >
                <option value="all">全部</option>
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>排序</Label>
              <Select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, sortBy: e.target.value }))
                }
              >
                <option value="updatedAt">更新时间</option>
                <option value="priority">优先级</option>
                <option value="dueDate">截止日期</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <LoadingState message="加载项目中..." />
      ) : error ? (
        <EmptyState
          title="加载失败"
          description={error}
          action={<Button onClick={() => window.location.reload()}>重试</Button>}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderCheck className="w-12 h-12" />}
          title="暂无项目"
          description="创建你的第一个项目，开始追踪进度"
          action={
            <Button onClick={handleAddProject}>
              <Plus className="w-4 h-4 mr-2" />
              创建项目
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        editingProject={editingProject}
        isSaving={isSaving}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="删除项目"
        message="确定要删除这个项目吗？此操作无法撤销。"
        confirmText="删除"
        isLoading={isDeleting}
      />
    </div>
  );
}

function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base">{project.name}</CardTitle>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="ghost" size="icon" onClick={() => onEdit(project)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex gap-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {getPriorityText(project.priority)}
            </span>
          </div>
          <div className="flex justify-end gap-4 text-gray-500">
            {project.startDate && (
              <span>开始: {formatDate(project.startDate)}</span>
            )}
            {project.dueDate && (
              <span>截止: {formatDate(project.dueDate)}</span>
            )}
            <span>更新: {formatDate(project.updatedAt)}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
          {project.progress && (
            <div>
              <span className="text-gray-500">当前进度:</span>
              <p className="text-gray-900">{project.progress}</p>
            </div>
          )}
          {project.nextAction && (
            <div>
              <span className="text-gray-500">下一步:</span>
              <p className="text-gray-900">{project.nextAction}</p>
            </div>
          )}
          {project.risk && (
            <div>
              <span className="text-gray-500">风险/阻塞:</span>
              <p className="text-red-600">{project.risk}</p>
            </div>
          )}
          {project.link && (
            <div className="md:col-span-3">
              <span className="text-gray-500">相关链接:</span>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-2"
              >
                {project.link}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  editingProject,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  editingProject: Project | null;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "not_started" as ProjectStatus,
    priority: "medium" as ProjectPriority,
    startDate: "",
    dueDate: "",
    progress: "",
    nextAction: "",
    risk: "",
    link: "",
  });

  useEffect(() => {
    if (editingProject) {
      setFormData({
        name: editingProject.name,
        description: editingProject.description || "",
        status: editingProject.status,
        priority: editingProject.priority,
        startDate: editingProject.startDate || "",
        dueDate: editingProject.dueDate || "",
        progress: editingProject.progress || "",
        nextAction: editingProject.nextAction || "",
        risk: editingProject.risk || "",
        link: editingProject.link || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        status: "not_started",
        priority: "medium",
        startDate: "",
        dueDate: "",
        progress: "",
        nextAction: "",
        risk: "",
        link: "",
      });
    }
  }, [editingProject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProject ? "编辑项目" : "新建项目"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">项目名称 *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((d) => ({ ...d, name: e.target.value }))}
            placeholder="输入项目名称"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">项目简介</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="输入项目简介"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="status">状态 *</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData((d) => ({ ...d, status: e.target.value as ProjectStatus }))
              }
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">优先级 *</Label>
            <Select
              id="priority"
              value={formData.priority}
              onChange={(e) =>
                setFormData((d) => ({ ...d, priority: e.target.value as ProjectPriority }))
              }
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">开始时间</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((d) => ({ ...d, startDate: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">截止时间</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((d) => ({ ...d, dueDate: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="progress">当前进度</Label>
          <Input
            id="progress"
            value={formData.progress}
            onChange={(e) =>
              setFormData((d) => ({ ...d, progress: e.target.value }))
            }
            placeholder="描述当前进度"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextAction">下一步动作</Label>
          <Input
            id="nextAction"
            value={formData.nextAction}
            onChange={(e) =>
              setFormData((d) => ({ ...d, nextAction: e.target.value }))
            }
            placeholder="描述下一步动作"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="risk">风险/阻塞项</Label>
          <Input
            id="risk"
            value={formData.risk}
            onChange={(e) => setFormData((d) => ({ ...d, risk: e.target.value }))}
            placeholder="描述风险或阻塞项"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">相关链接</Label>
          <Input
            id="link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData((d) => ({ ...d, link: e.target.value }))}
            placeholder="https://"
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
