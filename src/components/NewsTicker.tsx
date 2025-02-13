
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

export const NewsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: recentFundraises, isLoading } = useQuery({
    queryKey: ["recent-fundraises"],
    queryFn: async () => {
      console.log("Fetching recent fundraises for ticker...");
      const { data, error } = await supabase
        .from('processed_fundraises')
        .select('*')
        .order('Date', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error("Error fetching recent fundraises:", error);
        throw error;
      }
      
      console.log("Received recent fundraises:", data);
      return data;
    },
  });

  useEffect(() => {
    if (recentFundraises?.length) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % recentFundraises.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [recentFundraises?.length]);

  if (isLoading || !recentFundraises?.length) {
    return null;
  }

  const currentFundraise = recentFundraises[currentIndex];

  return (
    <div className="bg-accent/50 py-2 px-4 overflow-hidden border-b animate-fade-in">
      <div className="container mx-auto flex items-center gap-2">
        <div className="flex-shrink-0 font-semibold text-sm text-primary">
          Recent Fundraise
        </div>
        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
        <div className="flex items-center gap-4 truncate">
          <span className="font-medium">
            {currentFundraise.name || currentFundraise.Project}
          </span>
          <span className="text-sm text-primary font-semibold">
            {currentFundraise.Round || 'Seed'}
          </span>
          <span className="text-emerald-500 font-semibold">
            ${currentFundraise.Amount?.toLocaleString() || 'Undisclosed'}
          </span>
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {new Date(currentFundraise.Date || currentFundraise.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
