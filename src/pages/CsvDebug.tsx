
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

interface CsvRow {
  Project: string;
  Round: string;
  Website: string;
  Date: string;
  Amount: string;
  Valuation: string;
  Category: string;
  Tags: string;
  Lead_Investors: string;
  Other_Investors: string;
  Description: string;
  Announcement_Link: string;
  Social_Links: string;
}

const CsvDebug = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof CsvRow>("Date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: csvData, isLoading, error } = useQuery({
    queryKey: ["csv-data"],
    queryFn: async () => {
      const response = await fetch('/cryptofundraises_cleaned.csv');
      const text = await response.text();
      
      // Parse CSV
      const rows = text.split('\n').slice(1); // Skip header row
      const parsedData: CsvRow[] = rows
        .filter(row => row.trim()) // Skip empty rows
        .map(row => {
          const columns = row.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
          return {
            Project: columns[0] || '',
            Round: columns[1] || '',
            Website: columns[2] || '',
            Date: columns[3] || '',
            Amount: columns[4] || '',
            Valuation: columns[5] || '',
            Category: columns[6] || '',
            Tags: columns[7] || '',
            Lead_Investors: columns[8] || '',
            Other_Investors: columns[9] || '',
            Description: columns[10] || '',
            Announcement_Link: columns[11] || '',
            Social_Links: columns[12] || ''
          };
        });

      return parsedData;
    }
  });

  const handleSort = (field: keyof CsvRow) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  if (isLoading) {
    return <div className="container p-8">Loading CSV data...</div>;
  }

  if (error) {
    return (
      <div className="container p-8">
        <h1 className="text-2xl font-bold text-red-500">Error loading CSV data</h1>
        <pre className="mt-4 p-4 bg-red-50 rounded-lg overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  const filteredData = csvData?.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.Project.toLowerCase().includes(searchLower) ||
      item.Lead_Investors.toLowerCase().includes(searchLower) ||
      item.Description.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    
    if (sortField === 'Amount' || sortField === 'Valuation') {
      const aNum = parseFloat(aValue.replace(/[^0-9.-]+/g, "")) || 0;
      const bNum = parseFloat(bValue.replace(/[^0-9.-]+/g, "")) || 0;
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }
    
    if (sortField === 'Date') {
      const aDate = new Date(aValue || '').getTime() || 0;
      const bDate = new Date(bValue || '').getTime() || 0;
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    return sortDirection === 'asc' 
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  });

  const paginatedData = sortedData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  return (
    <div className="container p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">CSV Data View</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total entries: {sortedData.length}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search projects, investors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("Project")} className="cursor-pointer">
                Project <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("Round")} className="cursor-pointer">
                Round <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("Amount")} className="cursor-pointer">
                Amount <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead onClick={() => handleSort("Date")} className="cursor-pointer">
                Date <ArrowUpDown className="inline h-4 w-4" />
              </TableHead>
              <TableHead>Lead Investors</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.Project}</TableCell>
                <TableCell>{item.Round}</TableCell>
                <TableCell>{item.Amount}</TableCell>
                <TableCell>{item.Date}</TableCell>
                <TableCell>{item.Lead_Investors}</TableCell>
                <TableCell>{item.Category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Raw CSV Data Preview</h2>
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4">
            {paginatedData.map((row, index) => (
              <Card key={index} className="p-4 mb-4">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(row, null, 2)}
                </pre>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CsvDebug;
