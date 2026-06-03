"use client";

import Link from "next/link";
import { RefreshCw, FolderCheck, ListTodo, Plus } from "lucide-react";
import { useState } from "react";
import { StatCard, Card, CardContent, CardHeader, CardTitle, EmptyState, LoadingState, Button } from "@/components";
import { useProjects } from "@/hooks/useProjects";
import { useTodos } from "@/hooks/useTodos";
import { formatDate, getStatusText, getPriorityText, getPriorityColor, getStatusColor } from "@/lib/utils";
import type { Project, Todo } from "@/types";

const mockDashboardMetrics = [
  { id: "1", name: "本周需求数", value: 25, delta: "+12%", updatedAt: "2026-06-03 10:00", detailUrl: "#" },
  { id: "2", name: "完成任务数", value: 18, delta: "+8%", updatedAt: "2026-06-03 10:00", detailUrl: "#" },
  { id: "3", name: "进行中项目", value: 5, delta: "0", updatedAt: "2026-06-03 10:00", detailUrl: "#" },
  { id: "4", name: "待处理风险", value: 2, delta: "-1", updatedAt: "2026-06-03 10:00", detailUrl: "#" },
];

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);
  const { projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { todos, loading: todosLoading, error: todosError } = useTodos();

  const handleRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const recentProjects = projects.slice(0, 5);
  const pendingTodos = todos.filter((t) => t.status !== "done").slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">个人工作助手</h1>
          <p className="text-gray-500 mt-1">
            {formatDate(new Date().toISOString())} · 简单高效
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          刷新
        </Button>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">数据看板</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockDashboardMetrics.map((metric) => (
            <StatCard
              key={metric.id}
              title={metric.name}
              value={metric.value}
              delta={metric.delta}
              updatedAt={metric.updatedAt}
              detailUrl={metric.detailUrl}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">最近项目</h2>
          <Link href="/projects">
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </Link>
        </div>
        {projectsLoading ? (
          <LoadingState message="加载项目中..." />
        ) : projectsError ? (
          <EmptyState
            title="加载失败"
            description={projectsError}
            action={<Button onClick={handleRefresh}>重试</Button>}
          />
        ) : recentProjects.length === 0 ? (
          <EmptyState
            icon={<FolderCheck className="w-12 h-12" />}
            title="暂无项目"
            description="创建你的第一个项目，开始追踪进度"
            action={
              <Link href="/projects">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  创建项目
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {recentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">今日任务</h2>
          <Link href="/todos">
            <Button variant="outline" size="sm">
              查看全部
            </Button>
          </Link>
        </div>
        {todosLoading ? (
          <LoadingState message="加载任务中..." />
        ) : todosError ? (
          <EmptyState
            title="加载失败"
            description={todosError}
            action={<Button onClick={handleRefresh}>重试</Button>}
          />
        ) : pendingTodos.length === 0 ? (
          <EmptyState
            icon={<ListTodo className="w-12 h-12" />}
            title="今天很轻松！"
            description="没有待处理的任务，享受你的一天"
            action={
              <Link href="/todos">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  添加任务
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4">
            {pendingTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{project.name}</CardTitle>
            {project.description && (
              <p className="text-sm text-gray-500 mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
              {getPriorityText(project.priority)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex gap-4">
            {project.progress && (
              <span>进度: {project.progress}</span>
            )}
            {project.nextAction && (
              <span>下一步: {project.nextAction}</span>
            )}
          </div>
          <span>
            更新于 {formatDate(project.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function TodoCard({ todo }: { todo: Todo }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            <div>
              <p className="font-medium text-gray-900">{todo.title}</p>
              {todo.description && (
                <p className="text-sm text-gray-500">{todo.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
              {getPriorityText(todo.priority)}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
              {getStatusText(todo.status)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
