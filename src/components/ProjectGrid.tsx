
import { Project } from "@/types/project";
import { ProjectCard } from "./ProjectCard";
import { ProjectSkeleton } from "./ProjectSkeleton";

interface ProjectGridProps {
  projects: Project[];
  isLoading: boolean;
  timeFilter: string;
}

export const ProjectGrid = ({
  projects,
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

  const filteredProjects = projects.filter((project) => {
    if (timeFilter === "all") return true;
    if (!project.funding?.date) return false;

    const date = new Date(project.funding.date);
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
      {filteredProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
