
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const NewsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    <>
      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .ticker-scroll {
            animation: scroll 30s linear infinite;
          }
        `}
      </style>
      <div className="bg-accent/50 py-2 overflow-hidden border-b">
        <div className="relative flex whitespace-nowrap">
          <div 
            ref={scrollRef}
            className="ticker-scroll inline-flex items-center gap-8 px-4"
            style={{
              willChange: 'transform'
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...Array(2)].map((_, arrayIndex) => (
              <div key={arrayIndex} className="inline-flex items-center gap-8">
                {recentFundraises.map((fundraise, index) => (
                  <div 
                    key={`${arrayIndex}-${index}`} 
                    className="inline-flex items-center gap-4 shrink-0"
                  >
                    {/* Project Image/Icon */}
                    {fundraise.Website && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${fundraise.Website}&sz=32`}
                        alt=""
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <span className="font-medium whitespace-nowrap">
                      {fundraise.name || fundraise.Project}
                    </span>
                    
                    {/* Round Type in Pill Format */}
                    <Badge 
                      variant="secondary"
                      className="h-5 px-2 text-xs font-medium"
                    >
                      {fundraise.Round || fundraise.round_type || 'Seed'}
                    </Badge>
                    
                    <span className="text-emerald-500 font-semibold whitespace-nowrap">
                      ${(fundraise.amount_raised || fundraise.Amount)?.toLocaleString() || 'Undisclosed'}
                    </span>
                    
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(fundraise.Date || fundraise.created_at).toLocaleDateString()}
                    </span>
                    
                    <ArrowRight className="h-4 w-4 text-primary shrink-0" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
