
import { Project } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchProjects(): Promise<Project[]> {
  try {
    // Log the start of the fetch
    console.log("Starting to fetch projects from Supabase");
    
    const { data, error } = await supabase
      .from('crypto_fundraising')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Raw data from Supabase:", data);

    // Transform the data to match the Project interface
    const transformedData = (data || []).map(item => {
      const project = {
        id: item.id,
        name: item.name,
        token: item.token,
        logo: item.logo,
        description: item.description,
        categories: item.categories || [],
        website: item.website,
        twitter: item.twitter,
        funding: item.funding as { date: string; round_type: string; raised_amount: number } | null || undefined,
        tweet_url: item.tweet_url,
      };
      console.log("Transformed project:", project);
      return project;
    });

    console.log("Final transformed data:", transformedData);
    return transformedData;
  } catch (error) {
    console.error("Error in fetchProjects:", error);
    throw error;
  }
}
