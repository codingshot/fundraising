
import { useQuery } from "@tanstack/react-query";
import { fetchCuratedSubmissions } from "@/services/api";
import { ProjectGrid } from "@/components/ProjectGrid";
import { FilterBar } from "@/components/FilterBar";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState("all");
  const [isFetching, setIsFetching] = useState(false);

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

  // Add debug logging
  console.log("Submissions from query:", submissions);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <h1 className="text-3xl font-semibold">Crypto Fundraises</h1>
          <p className="mt-2 text-muted-foreground">
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
          <button
            onClick={handleFetchData}
            disabled={isFetching}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isFetching ? 'Fetching...' : 'Fetch New Submissions'}
          </button>
        </div>
      </header>

      <main className="container py-6">
        <FilterBar timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} />
        <ProjectGrid
          submissions={submissions || []}
          isLoading={isLoading}
          timeFilter={timeFilter}
        />
      </main>
    </div>
  );
};

export default Index;
