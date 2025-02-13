
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";

export const NewsTicker = () => {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["telegram-feed"],
    queryFn: async () => {
      console.log("Fetching telegram feed data...");
      const { data, error } = await supabase.functions.invoke('fetch-telegram-feed');
      if (error) {
        console.error("Error fetching telegram feed:", error);
        throw error;
      }
      console.log("Received telegram feed data:", data);
      return data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  useEffect(() => {
    console.log("NewsTicker data changed:", data);
    if (data?.posts?.length) {
      console.log("Setting up interval with", data.posts.length, "posts");
      const interval = setInterval(() => {
        setCurrentPostIndex((prev) => {
          const next = prev === data.posts.length - 1 ? 0 : prev + 1;
          console.log("Updating post index from", prev, "to", next);
          return next;
        });
      }, 5000); // Change post every 5 seconds

      return () => clearInterval(interval);
    }
  }, [data?.posts?.length]);

  if (isLoading) {
    console.log("NewsTicker is loading...");
    return (
      <div className="bg-accent/50 py-2 px-4">
        <div className="container mx-auto">
          <p className="text-sm text-muted-foreground">Loading latest updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("NewsTicker error:", error);
    return null;
  }

  if (!data?.posts?.length) {
    console.log("No posts available in NewsTicker");
    return null;
  }

  const currentPost = data.posts[currentPostIndex];
  console.log("Rendering post:", currentPost);

  return (
    <div className="bg-accent/50 py-2 px-4 overflow-hidden border-b">
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
