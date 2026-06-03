import { Card, CardContent } from "./Card";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "加载中..." }: LoadingStateProps) {
  return (
    <Card className="text-center py-8">
      <CardContent>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">{message}</p>
      </CardContent>
    </Card>
  );
}
