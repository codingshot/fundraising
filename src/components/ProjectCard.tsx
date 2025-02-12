
import { CuratedSubmission } from "@/types/project";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Twitter, InfoIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";

interface ProjectCardProps {
  submission: CuratedSubmission;
  viewMode: 'card' | 'row';
}

export const ProjectCard = ({ submission, viewMode }: ProjectCardProps) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const renderFundraiseInfo = () => (
    <div className="space-y-2 text-sm">
      {submission.amount_raised && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">Amount Raised:</span>
          <span>${submission.amount_raised.toLocaleString()}</span>
        </div>
      )}
      {submission.round_type && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">Round:</span>
          <span>{submission.round_type}</span>
        </div>
      )}
      {submission.lead_investor && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">Lead:</span>
          <span>{submission.lead_investor}</span>
        </div>
      )}
      {submission.investors && submission.investors.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">Investors:</span>
          <span>{submission.investors.join(", ")}</span>
        </div>
      )}
      {submission.token && (
        <div className="flex items-center gap-2">
          <span className="font-semibold">Token:</span>
          <span>{submission.token}</span>
        </div>
      )}
    </div>
  );

  if (viewMode === 'row') {
    return (
      <div className="flex items-center gap-4 p-4 bg-card hover:bg-accent/50 transition-colors rounded-lg border">
        <div className="flex-shrink-0">
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
        </div>
        <div className="flex-grow space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {submission.tweet_data?.author_name || 'Unknown Author'}
            </h3>
            {submission.tweet_data?.author_username && (
              <span className="text-sm text-muted-foreground">
                @{submission.tweet_data.author_username}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {submission.tweet_data?.text}
          </p>
          {renderFundraiseInfo()}
        </div>
        <div className="flex-shrink-0 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
        </div>
      </div>
    );
  }

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
        <div className="mb-4">{renderFundraiseInfo()}</div>
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
