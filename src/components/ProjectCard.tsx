import { CuratedSubmission } from "@/types/project";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Twitter, DollarSign, Building2, Briefcase, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProjectCardProps {
  submission: CuratedSubmission;
  viewMode: 'card' | 'row';
}

export const ProjectCard = ({ submission, viewMode }: ProjectCardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if clicking on links inside the card
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation();
      return;
    }
    
    if (submission.id) {
      console.log("Navigating to:", `/fundraise/id/${submission.id}`);
      navigate(`/fundraise/id/${submission.id}`);
    } else {
      console.warn("No ID available for this fundraise");
    }
  };

  const renderCompactInfo = () => (
    <div className="grid grid-cols-5 gap-4 w-full text-sm">
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground">Amount</p>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span>{submission.amount_raised ? `$${submission.amount_raised.toLocaleString()}` : '-'}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground">Company</p>
        <div className="flex items-center gap-1">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <span>{submission.tweet_data?.author_name || '-'}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground">Round</p>
        <div className="flex items-center gap-1">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span>{submission.round_type || '-'}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground">Lead</p>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="truncate">{submission.lead_investor || '-'}</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-medium text-muted-foreground">Other Investors</p>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="truncate">
            {submission.investors && submission.investors.length > 0 
              ? submission.investors.filter(inv => inv !== submission.lead_investor).join(', ') 
              : '-'}
          </span>
        </div>
      </div>
    </div>
  );

  const renderDetailedInfo = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-muted-foreground" />
        <span className="font-semibold">Amount Raised:</span>
        <span>{submission.amount_raised ? `$${submission.amount_raised.toLocaleString()}` : 'Undisclosed'}</span>
      </div>
      {submission.round_type && (
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">Round:</span>
          <span>{submission.round_type}</span>
        </div>
      )}
      {submission.lead_investor && (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">Lead:</span>
          <span>{submission.lead_investor}</span>
        </div>
      )}
      {submission.investors && submission.investors.length > 0 && (
        <div className="flex items-start gap-2">
          <Users className="w-4 h-4 mt-1 text-muted-foreground" />
          <div>
            <span className="font-semibold">Other Investors:</span>
            <p className="mt-1">
              {submission.investors
                .filter(inv => inv !== submission.lead_investor)
                .join(', ')}
            </p>
          </div>
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
      <div 
        className="p-4 bg-card hover:bg-accent/50 transition-colors rounded-lg border cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-shrink-0">
            {submission.tweet_data?.author_profile_image_url && (
              <img
                src={submission.tweet_data.author_profile_image_url}
                alt={`${submission.tweet_data.author_name || 'Author'}'s profile`}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">
                {submission.tweet_data?.author_name || 'Unknown Author'}
              </h3>
              {submission.tweet_data?.author_username && (
                <a
                  href={`https://x.com/${submission.tweet_data.author_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                  onClick={(e) => e.stopPropagation()}
                >
                  @{submission.tweet_data.author_username}
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        {renderCompactInfo()}
      </div>
    );
  }

  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        {submission.tweet_data?.author_profile_image_url && (
          <img
            src={submission.tweet_data.author_profile_image_url}
            alt={`${submission.tweet_data.author_name || 'Author'}'s profile`}
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {submission.tweet_data?.author_name || 'Unknown Author'}
            </h3>
            {submission.tweet_data?.author_username && (
              <a
                href={`https://x.com/${submission.tweet_data.author_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                @{submission.tweet_data.author_username}
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {submission.curator_notes && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm font-medium">Curator Notes:</p>
            <p className="text-sm text-muted-foreground">{submission.curator_notes}</p>
          </div>
        )}
        <div className="mb-4">{renderDetailedInfo()}</div>
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
