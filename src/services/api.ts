
import { Project } from "../types/project";

const API_BASE_URL = "https://curatedotfun-floral-sun-1539.fly.dev/api";

export async function fetchProjects(): Promise<Project[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/submissions/cryptofundraise?status=approved`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch projects");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}
