
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

export const NewsTicker = () => {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["telegram-feed"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-telegram-feed');
      if (error) throw error;
      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  useEffect(() => {
    if (data?.posts?.length) {
      const interval = setInterval(() => {
        setCurrentPostIndex((prev) => 
          prev === data.posts.length - 1 ? 0 : prev + 1
        );
      }, 5000); // Change post every 5 seconds

      return () => clearInterval(interval);
    }
  }, [data?.posts?.length]);

  if (isLoading || error || !data?.posts?.length) return null;

  const currentPost = data.posts[currentPostIndex];

  return (
    <div className="bg-accent/50 py-2 px-4 overflow-hidden">
      <div className="container mx-auto flex items-center gap-2">
        <div className="flex-shrink-0 font-semibold text-sm text-primary">
          Latest Update
        </div>
        <ArrowRight className="h-4 w-4 text-primary flex-shrink-0" />
        <p className="text-sm truncate">
          {currentPost.text}
        </p>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {new Date(currentPost.timestamp).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
