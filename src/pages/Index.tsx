
import { useQuery } from "@tanstack/react-query";
import { fetchCuratedSubmissions } from "@/services/api";
import { ProjectGrid } from "@/components/ProjectGrid";
import { FilterBar } from "@/components/FilterBar";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState("all");

  const {
    data: submissions,
    isLoading,
    error,
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

  // Add debug logging
  console.log("Submissions from query:", submissions);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <h1 className="text-3xl font-semibold">Curated Crypto Tweets</h1>
          <p className="mt-2 text-muted-foreground">
            A curated collection of the most interesting cryptocurrency tweets
          </p>
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
