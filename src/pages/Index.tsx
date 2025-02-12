
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
  const [isProcessing, setIsProcessing] = useState(false);

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
          <div className="flex gap-4 mt-4">
            <button
              onClick={handleFetchData}
              disabled={isFetching}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isFetching ? 'Fetching...' : 'Fetch New Submissions'}
            </button>
            <button
              onClick={handleProcessExisting}
              disabled={isProcessing}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Process Existing Entries'}
            </button>
          </div>
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
