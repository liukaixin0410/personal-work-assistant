import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./Card";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="text-center py-8">
      <CardHeader>
        {icon && <div className="mx-auto w-12 h-12 text-gray-400 mb-4">{icon}</div>}
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </CardHeader>
      {action && <CardContent>{action}</CardContent>}
    </Card>
  );
}
