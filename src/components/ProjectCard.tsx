
import { CuratedSubmission } from "@/types/project";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Twitter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

interface ProjectCardProps {
  submission: CuratedSubmission;
}

export const ProjectCard = ({ submission }: ProjectCardProps) => {
  useEffect(() => {
    // Load Twitter widget script
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        {submission.tweet_data?.author_profile_image_url ? (
          <img
            src={submission.tweet_data.author_profile_image_url}
            alt={`${submission.tweet_data.author_name || 'Author'}'s profile`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Twitter className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">
            {submission.tweet_data?.author_name || 'Unknown Author'}
          </h3>
          {submission.tweet_data?.author_username && (
            <span className="text-sm text-muted-foreground">
              @{submission.tweet_data.author_username}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {submission.curator_notes && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Curator Notes:</p>
            <p className="text-sm text-muted-foreground">{submission.curator_notes}</p>
          </div>
        )}
        <div className="mt-4">
          <blockquote className="twitter-tweet" data-theme="light">
            <a href={submission.tweet_url}>Loading tweet...</a>
          </blockquote>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Added {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};
