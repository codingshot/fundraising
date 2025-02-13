
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { CuratedSubmission } from "@/types/project";

interface DownloadMenuProps {
  submissions: CuratedSubmission[];
}

export const DownloadMenu = ({ submissions }: DownloadMenuProps) => {
  const downloadAsJSON = () => {
    const jsonString = JSON.stringify(submissions, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crypto-fundraises.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsCSV = () => {
    const headers = [
      "name",
      "amount_raised",
      "round_type",
      "lead_investor",
      "investors",
      "token",
      "twitter_url",
      "announcement_username",
      "created_at",
    ];

    const csvRows = [
      headers.join(","),
      ...submissions.map((s) =>
        headers
          .map((header) => {
            const value = s[header as keyof CuratedSubmission];
            if (Array.isArray(value)) {
              return `"${value.join("; ")}"`;
            }
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`;
            }
            return value || "";
          })
          .join(",")
      ),
    ];

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crypto-fundraises.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsMarkdown = () => {
    const markdownContent = `# Crypto Fundraising Announcements\n\n` +
      submissions.map((s) => {
        const amount = s.amount_raised
          ? `$${s.amount_raised.toLocaleString()}`
          : "Undisclosed";
        const investors = s.investors?.length
          ? `\n\n**Investors**: ${s.investors.join(", ")}`
          : "";
        const leadInvestor = s.lead_investor
          ? `\n\n**Lead**: ${s.lead_investor}`
          : "";
        const roundType = s.round_type ? `\n\n**Round**: ${s.round_type}` : "";
        const token = s.token ? `\n\n**Token**: ${s.token}` : "";
        const twitterLink = s.twitter_url
          ? `\n\n🔗 [View Announcement](${s.twitter_url})`
          : "";

        return `## ${s.name}\n\n**Amount Raised**: ${amount}${roundType}${leadInvestor}${investors}${token}${twitterLink}\n\n---\n`;
      }).join("\n");

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "crypto-fundraises.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={downloadAsJSON}>
          Download as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadAsCSV}>
          Download as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadAsMarkdown}>
          Download as Markdown
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
