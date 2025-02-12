
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ProjectSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
};
