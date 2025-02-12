
import { Project } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('crypto_fundraising')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Transform the data to match the Project interface
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      token: item.token,
      logo: item.logo,
      description: item.description,
      categories: item.categories,
      website: item.website,
      twitter: item.twitter,
      funding: item.funding ? {
        date: item.funding.date,
        round_type: item.funding.round_type,
        raised_amount: item.funding.raised_amount,
      } : undefined,
      tweet_url: item.tweet_url,
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}
