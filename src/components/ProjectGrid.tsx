
import { CuratedSubmission } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { ProjectSkeleton } from "./ProjectSkeleton";
import { LayoutGrid, List } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProjectGridProps {
  submissions: CuratedSubmission[];
  isLoading: boolean;
  timeFilter: string;
  viewMode: 'card' | 'row';
  onViewModeChange: (mode: 'card' | 'row') => void;
}

export const ProjectGrid = ({
  submissions,
  isLoading,
  timeFilter,
  viewMode,
  onViewModeChange,
}: ProjectGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    );
  }

  const filteredSubmissions = submissions.filter((submission) => {
    if (timeFilter === "all") return true;
    
    const date = new Date(submission.created_at);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    switch (timeFilter) {
      case "day":
        return diffDays <= 1;
      case "week":
        return diffDays <= 7;
      case "month":
        return diffDays <= 30;
      default:
        return true;
    }
  });

  if (filteredSubmissions.length === 0) {
    return (
      <Alert className="mt-6">
        <AlertDescription>
          No fundraising announcements found for the selected time period.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <button
          onClick={() => onViewModeChange('card')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
          title="Card view"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewModeChange('row')}
          className={`p-2 rounded-md transition-colors ${
            viewMode === 'row' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
          }`}
          title="Row view"
        >
          <List className="w-5 h-5" />
        </button>
      </div>
      <div className={
        viewMode === 'card' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }>
        {filteredSubmissions.map((submission) => (
          <ProjectCard 
            key={submission.id} 
            submission={submission}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
};
