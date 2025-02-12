
import { Project } from "@/types/project";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExternalLink, Twitter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        {project.logo ? (
          <img
            src={project.logo}
            alt={`${project.name} logo`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xl font-bold">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          {project.token && (
            <span className="text-sm text-muted-foreground">{project.token}</span>
          )}
        </div>
        <div className="flex gap-2">
          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
          {project.twitter && (
            <a
              href={`https://twitter.com/${project.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.categories.map((category) => (
            <span
              key={category}
              className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
            >
              {category}
            </span>
          ))}
        </div>
        {project.funding && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {project.funding.round_type}
              </span>
              <span className="text-sm text-success font-semibold">
                ${(project.funding.raised_amount / 1_000_000).toFixed(1)}M
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(project.funding.date), {
                addSuffix: true,
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
