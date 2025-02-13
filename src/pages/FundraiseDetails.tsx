import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { 
  DollarSign, 
  Users, 
  Building2, 
  Briefcase, 
  ArrowLeft, 
  Globe, 
  Calendar,
  Link2,
  Twitter,
  Hash,
  ChevronRight,
  Gem,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

        if (fundraise.name) {
          query.eq("name", fundraise.name);
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

  const projectName = fundraise.name || fundraise.Project || 'Unknown Project';
  const amount = fundraise.Amount || fundraise.amount_raised;
  const leadInvestor = fundraise.Lead_Investors || fundraise.lead_investor;
  const otherInvestors = fundraise.Other_Investors || fundraise.investors || [];
  const tags = fundraise.Tags || [];
  const round = fundraise.Round || fundraise.round_type;
  const description = fundraise.Description || fundraise.description;

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-4">
              <h1 className="text-3xl font-bold">{projectName}</h1>
              {fundraise.Website && (
                <Avatar className="h-10 w-10">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${fundraise.Website}&sz=64`}
                    alt={projectName}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </Avatar>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {round && (
              <Badge variant="secondary" className="text-sm">
                {round}
              </Badge>
            )}
            {amount && (
              <Badge variant="secondary" className="text-sm">
                ${amount.toLocaleString()}
              </Badge>
            )}
            {fundraise.Category && (
              <Badge variant="outline" className="text-sm">
                {fundraise.Category}
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {new Date(fundraise.Date || fundraise.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {fundraise.Website && (
              <Button variant="outline" size="sm" asChild>
                <a href={fundraise.Website} target="_blank" rel="noopener noreferrer">
                  <Globe className="mr-2 h-4 w-4" />
                  Website
                </a>
              </Button>
            )}
            {fundraise.Social_Links && (
              <Button variant="outline" size="sm" asChild>
                <a href={fundraise.Social_Links} target="_blank" rel="noopener noreferrer">
                  <Link2 className="mr-2 h-4 w-4" />
                  Social
                </a>
              </Button>
            )}
            {fundraise.Announcement_Link && (
              <Button variant="outline" size="sm" asChild>
                <a href={fundraise.Announcement_Link} target="_blank" rel="noopener noreferrer">
                  <Twitter className="mr-2 h-4 w-4" />
                  Announcement
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Fundraising Details</h2>
            
            <div className="grid gap-4">
              {amount && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Amount Raised:</span>
                  <span>${amount.toLocaleString()}</span>
                </div>
              )}
              
              {fundraise.Valuation && (
                <div className="flex items-center gap-2">
                  <Gem className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Valuation:</span>
                  <span>${fundraise.Valuation.toLocaleString()}</span>
                </div>
              )}
              
              {round && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Round:</span>
                  <span>{round}</span>
                </div>
              )}

              {leadInvestor && (
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Lead Investor:</span>
                  <span>{leadInvestor}</span>
                </div>
              )}

              {fundraise.Category && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Category:</span>
                  <span>{fundraise.Category}</span>
                </div>
              )}

              {fundraise.token && (
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-muted-foreground" />
                  <span className="font-semibold">Token:</span>
                  <span>{fundraise.token}</span>
                </div>
              )}
            </div>
          </div>

          {otherInvestors.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Other Investors</h3>
              <div className="flex flex-wrap gap-2">
                {otherInvestors.map((investor, index) => (
                  <Badge key={index} variant="outline">
                    {investor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-6">
          {description && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Description</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{description}</p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {relatedFundraises && relatedFundraises.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Related Fundraises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedFundraises.map((related) => (
              <Card key={related.id} className="p-4">
                <h3 className="font-semibold">{related.name || related.Project}</h3>
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
  );
};

export default FundraiseDetails;
