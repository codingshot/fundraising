
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/services/api";
import { ProjectGrid } from "@/components/ProjectGrid";
import { FilterBar } from "@/components/FilterBar";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [timeFilter, setTimeFilter] = useState("all");

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    meta: {
      onError: () => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch projects. Please try again later.",
        });
      },
    },
  });

  // Add debug logging
  console.log("Projects from query:", projects);
  console.log("Loading state:", isLoading);
  console.log("Error state:", error);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container py-6">
          <h1 className="text-3xl font-semibold">Crypto Fundraising Insights</h1>
          <p className="mt-2 text-muted-foreground">
            Track and analyze the latest cryptocurrency fundraising rounds
          </p>
        </div>
      </header>

      <main className="container py-6">
        <FilterBar timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} />
        <ProjectGrid
          projects={projects || []}
          isLoading={isLoading}
          timeFilter={timeFilter}
        />
      </main>
    </div>
  );
};

export default Index;
