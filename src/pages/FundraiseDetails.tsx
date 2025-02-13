
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Users, Building2, Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const FundraiseDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: fundraise, isLoading, error: fundraiseError } = useQuery({
    queryKey: ["fundraise", slug],
    queryFn: async () => {
      console.log("Fetching fundraise with slug:", slug);
      try {
        const { data, error } = await supabase
          .from("processed_fundraises")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (error) {
          console.error("Error fetching fundraise:", error);
          throw error;
        }
        
        console.log("Fetched fundraise:", data);
        return data;
      } catch (error) {
        console.error("Failed to fetch fundraise:", error);
        throw error;
      }
    },
    retry: 3,
    retryDelay: 1000,
  });

  const { data: relatedFundraises } = useQuery({
    queryKey: ["related-fundraises", fundraise?.id],
    enabled: !!fundraise,
    queryFn: async () => {
      try {
        const query = supabase
          .from("processed_fundraises")
          .select("*")
          .neq("id", fundraise.id)
          .limit(5);

        if (fundraise.Project) {
          query.eq("Project", fundraise.Project);
        }

        if (fundraise.Amount === null) {
          query.is("Amount", null);
        } else if (typeof fundraise.Amount === "number") {
          query.eq("Amount", fundraise.Amount);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching related fundraises:", error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Failed to fetch related fundraises:", error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-accent/50 rounded w-1/3"></div>
          <div className="h-64 bg-accent/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (fundraiseError || !fundraise) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Fundraise not found</h2>
          <p className="text-muted-foreground">
            {fundraiseError ? "Error loading fundraise" : "The requested fundraise could not be found"}
          </p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/')} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Button>
        <h1 className="text-3xl font-bold">{fundraise.Project || 'Unknown Project'}</h1>
      </div>
      
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Amount Raised:</span>
                <span>{fundraise.Amount ? `$${fundraise.Amount.toLocaleString()}` : 'Undisclosed'}</span>
              </div>
              
              {fundraise.Round && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Round:</span>
                  <span>{fundraise.Round}</span>
                </div>
              )}

              {fundraise.Lead_Investors && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Lead Investor:</span>
                  <span>{fundraise.Lead_Investors}</span>
                </div>
              )}

              {fundraise.Category && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Category:</span>
                  <span>{fundraise.Category}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {fundraise.Other_Investors && fundraise.Other_Investors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Other Investors</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {fundraise.Other_Investors.map((investor, index) => (
                      <li key={index}>{investor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {fundraise.Tags && fundraise.Tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {fundraise.Tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-accent rounded-md text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {fundraise.Description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{fundraise.Description}</p>
            </div>
          )}

          {fundraise.Announcement_Link && (
            <div className="mt-6">
              <blockquote className="twitter-tweet" data-theme="light">
                <a href={fundraise.Announcement_Link}>Loading tweet...</a>
              </blockquote>
            </div>
          )}
        </Card>

        {relatedFundraises && relatedFundraises.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Related Fundraises</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedFundraises.map((related) => (
                <Card key={related.id} className="p-4">
                  <h3 className="font-semibold">{related.Project || related.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {related.Amount ? `$${related.Amount.toLocaleString()}` : 'Undisclosed'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(related.Date || related.created_at), { addSuffix: true })}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundraiseDetails;
