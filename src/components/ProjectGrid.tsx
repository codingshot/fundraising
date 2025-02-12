
import { CuratedSubmission } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { ProjectSkeleton } from "./ProjectSkeleton";

interface ProjectGridProps {
  submissions: CuratedSubmission[];
  isLoading: boolean;
  timeFilter: string;
}

export const ProjectGrid = ({
  submissions,
  isLoading,
  timeFilter,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {filteredSubmissions.map((submission) => (
        <ProjectCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
};
