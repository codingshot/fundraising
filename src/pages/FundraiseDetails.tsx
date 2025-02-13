
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { DollarSign, Users, Building2, Briefcase } from "lucide-react";

const FundraiseDetails = () => {
  const { slug } = useParams();

  const { data: fundraise, isLoading } = useQuery({
    queryKey: ["fundraise", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processed_fundraises")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: relatedFundraises } = useQuery({
    queryKey: ["related-fundraises", fundraise?.id],
    enabled: !!fundraise,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processed_fundraises")
        .select("*")
        .neq("id", fundraise.id)
        .or(`name.eq.${fundraise.name},amount_raised.eq.${fundraise.amount_raised}`)
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!fundraise) {
    return <div className="p-8">Fundraise not found</div>;
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
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
