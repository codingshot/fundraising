
import { CuratedSubmission } from "../types/project";
import { supabase } from "@/integrations/supabase/client";

export async function fetchCuratedSubmissions(): Promise<CuratedSubmission[]> {
  try {
    console.log("Starting to fetch submissions from API");
    const { data, error } = await supabase.functions.invoke('fetch-submissions');
    
    if (error) {
      console.error("Function error:", error);
      throw error;
    }
    
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}
