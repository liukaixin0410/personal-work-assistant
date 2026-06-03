import { Card, CardContent, CardHeader, CardTitle } from "./Card";

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string | number;
  updatedAt?: string;
  detailUrl?: string;
}

export function StatCard({ title, value, delta, updatedAt, detailUrl }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {delta !== undefined && (
          <div className={`text-sm mt-1 ${String(delta).startsWith("+") ? "text-green-600" : "text-red-600"}`}>
            {delta}
          </div>
        )}
        {updatedAt && (
          <div className="text-xs text-gray-400 mt-2">更新于 {updatedAt}</div>
        )}
        {detailUrl && (
          <div className="mt-3">
            <a
              href={detailUrl}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              查看详情 →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
