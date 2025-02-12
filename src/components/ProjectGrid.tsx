
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
  searchValue: string;
  amountRange: [number, number];
  roundType: string;
}

export const ProjectGrid = ({
  submissions,
  isLoading,
  timeFilter,
  viewMode,
  onViewModeChange,
  searchValue,
  amountRange,
  roundType,
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
    // Time filter
    if (timeFilter !== "all") {
      const date = new Date(submission.created_at);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (timeFilter) {
        case "day":
          if (diffDays > 1) return false;
          break;
        case "week":
          if (diffDays > 7) return false;
          break;
        case "month":
          if (diffDays > 30) return false;
          break;
      }
    }

    // Search filter
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      const companyName = submission.tweet_data?.author_name?.toLowerCase() || '';
      const investors = submission.investors?.join(' ').toLowerCase() || '';
      const leadInvestor = submission.lead_investor?.toLowerCase() || '';
      
      if (!companyName.includes(searchLower) && 
          !investors.includes(searchLower) && 
          !leadInvestor.includes(searchLower)) {
        return false;
      }
    }

    // Amount range filter
    if (submission.amount_raised) {
      if (submission.amount_raised < amountRange[0] || 
          submission.amount_raised > amountRange[1]) {
        return false;
      }
    }

    // Round type filter
    if (roundType && roundType !== 'all') {
      if (!submission.round_type || 
          submission.round_type.toLowerCase() !== roundType.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  if (filteredSubmissions.length === 0) {
    return (
      <Alert className="mt-6">
        <AlertDescription>
          No fundraising announcements found matching your criteria.
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
