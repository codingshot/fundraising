
import { CuratedSubmission } from "../types/project";

export async function fetchCuratedSubmissions(): Promise<CuratedSubmission[]> {
  try {
    console.log("Starting to fetch submissions from API");
    const response = await fetch('https://curatedotfun-floral-sun-1539.fly.dev/api/submissions/cryptofundraise?status=approve');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("API Response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
}
