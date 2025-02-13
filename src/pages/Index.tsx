
import { useQuery } from "@tanstack/react-query";
import { fetchCuratedSubmissions } from "@/services/api";
import { ProjectGrid } from "@/components/ProjectGrid";
import { FilterBar } from "@/components/FilterBar";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { DownloadMenu } from "@/components/DownloadMenu";
import { NewsTicker } from "@/components/NewsTicker";

const Index = () => {
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'card' | 'row'>('card');
  const [isFetching, setIsFetching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100000000]);
  const [roundType, setRoundType] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const {
    data: submissions,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["curated-submissions"],
    queryFn: fetchCuratedSubmissions,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch submissions. Please try again later.",
        });
      },
    },
  });

  const getTopMonthlyRaises = () => {
    if (!submissions) return [];
    
    const now = new Date();
    const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
    
    return submissions
      .filter(submission => {
        const submissionDate = new Date(submission.created_at);
        return submissionDate >= oneMonthAgo && 
               submission.amount_raised && 
               submission.amount_raised > 0;
      })
      .sort((a, b) => (b.amount_raised || 0) - (a.amount_raised || 0))
      .slice(0, 3);
  };

  const handleFetchData = async () => {
    try {
      setIsFetching(true);
      const { data, error } = await supabase.functions.invoke('fetch-submissions');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      // Refetch the submissions to show new data
      refetch();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch new submissions",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleProcessExisting = async () => {
    try {
      setIsProcessing(true);
      const { data, error } = await supabase.functions.invoke('process-existing-fundraises');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      // Refetch to show updated data
      refetch();
    } catch (error) {
      console.error('Error processing existing data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process existing submissions",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const csvData = submissions?.map(submission => ({
    Project: submission.Project || '',
    Round: submission.Round || '',
    Website: submission.Website || '',
    Date: submission.Date || submission.created_at,
    Amount: submission.amount_raised ? `$${submission.amount_raised.toLocaleString()}` : '',
    Valuation: submission.Valuation ? `$${submission.Valuation.toLocaleString()}` : '',
    Category: submission.Category || '',
    Tags: Array.isArray(submission.Tags) ? submission.Tags.join(', ') : '',
    Lead_Investors: submission.lead_investor || submission.Lead_Investors || '',
    Other_Investors: Array.isArray(submission.Other_Investors) ? submission.Other_Investors.join(', ') : '',
    Description: submission.Description || '',
    Announcement_Link: submission.Announcement_Link || '',
    Social_Links: submission.Social_Links || ''
  }));

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load fundraising announcements. Please try again later.
            {error instanceof Error ? <p className="mt-2 text-sm">{error.message}</p> : null}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasUnprocessedEntries = submissions?.some(
    (submission) => !submission.amount_raised && !submission.round_type
  );

  const topRaises = getTopMonthlyRaises();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold">Crypto Fundraises</h1>
              <div className="mt-2 space-y-1">
                <p className="text-muted-foreground">
                  A feed of all the latest crypto fundraising announcements.{" "}
                  <a
                    href="https://t.me/cryptofundraises"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Telegram feed
                  </a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Fundraises: {submissions ? 
                    <span className="font-medium text-foreground">{submissions.length.toLocaleString()}</span> 
                    : 
                    <span className="animate-pulse">Loading...</span>
                  }
                </p>
              </div>
              
              {/* Top Monthly Raises Section */}
              {topRaises.length > 0 && (
                <div className="mt-4 p-4 bg-accent/50 rounded-lg">
                  <h2 className="text-lg font-semibold mb-3">
                    Top Raises This Month ({topRaises.length})
                  </h2>
                  <div className="grid gap-3">
                    {topRaises.map((raise, index) => (
                      <div key={raise.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-primary">{`#${index + 1}`}</span>
                          <span className="font-medium">{raise.tweet_data?.author_name || raise.Project}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium bg-primary/10 px-2 py-1 rounded">
                            {raise.round_type || raise.Round}
                          </span>
                          <span className="font-semibold text-primary">
                            ${(raise.amount_raised || raise.Amount)?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {submissions && submissions.length > 0 && csvData && (
              <DownloadMenu data={csvData} />
            )}
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleFetchData}
              disabled={isFetching}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isFetching ? 'Fetching...' : 'Fetch New Submissions'}
            </button>
            {hasUnprocessedEntries && (
              <button
                onClick={handleProcessExisting}
                disabled={isProcessing}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Process Existing Entries'}
              </button>
            )}
          </div>
        </div>
      </header>

      <NewsTicker />

      <main className="container py-6">
        <div className="mt-6">
          <FilterBar 
            timeFilter={timeFilter} 
            onTimeFilterChange={setTimeFilter}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            amountRange={amountRange}
            onAmountRangeChange={setAmountRange}
            roundType={roundType}
            onRoundTypeChange={setRoundType}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />
        </div>
        <ProjectGrid
          submissions={submissions || []}
          isLoading={isLoading}
          timeFilter={timeFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchValue={searchValue}
          amountRange={amountRange}
          roundType={roundType}
        />
      </main>
    </div>
  );
};

export default Index;

