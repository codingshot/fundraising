
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
          .eq("id", slug)
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
        // Create a filter for similar fundraises
        const query = supabase
          .from("processed_fundraises")
          .select("*")
          .neq("id", fundraise.id)
          .limit(5);

        // Add name filter if available
        if (fundraise.name) {
          query.eq("name", fundraise.name);
        }

        // Add amount filter if available
        if (fundraise.amount_raised === null) {
          query.is("amount_raised", null);
        } else if (typeof fundraise.amount_raised === "number") {
          query.eq("amount_raised", fundraise.amount_raised);
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
        <h1 className="text-3xl font-bold">{fundraise.announcement_username || 'Unknown Project'}</h1>
      </div>
      
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{fundraise.name}</h1>
        
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <span className="font-semibold">Amount Raised:</span>
                <span>{fundraise.amount_raised ? `$${fundraise.amount_raised.toLocaleString()}` : 'Undisclosed'}</span>
              </div>
              
              {fundraise.round_type && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Round:</span>
                  <span>{fundraise.round_type}</span>
                </div>
              )}

              {fundraise.lead_investor && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Lead Investor:</span>
                  <span>{fundraise.lead_investor}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {fundraise.investors && fundraise.investors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Investors</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {fundraise.investors.map((investor, index) => (
                      <li key={index}>{investor}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {fundraise.description && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">{fundraise.description}</p>
            </div>
          )}

          {fundraise.twitter_url && (
            <div className="mt-6">
              <blockquote className="twitter-tweet" data-theme="light">
                <a href={fundraise.twitter_url}>Loading tweet...</a>
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
                  <h3 className="font-semibold">{related.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {related.amount_raised ? `$${related.amount_raised.toLocaleString()}` : 'Undisclosed'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(related.created_at), { addSuffix: true })}
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
