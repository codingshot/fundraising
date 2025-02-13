
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

const CsvDebug = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("Date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: fundraises, isLoading, error, refetch } = useQuery({
    queryKey: ["raw-fundraises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processed_fundraises')
        .select('*')
        .order(sortField, { ascending: sortDirection === "asc" });
      
      if (error) throw error;
      return data;
    }
  });

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleImportCsv = async () => {
    try {
      const response = await fetch(
        'https://zryhlwfkovkxtqiwzhai.supabase.co/functions/v1/import-csv',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Import result:', result);
      refetch();
    } catch (error) {
      console.error('Error importing CSV:', error);
    }
  };

  if (isLoading) {
    return <div className="container p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="container p-8">
        <h1 className="text-2xl font-bold text-red-500">Error loading data</h1>
        <pre className="mt-4 p-4 bg-red-50 rounded-lg overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  const filteredData = fundraises?.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.Project?.toLowerCase().includes(searchLower) ||
      item.name?.toLowerCase().includes(searchLower) ||
      item.Lead_Investors?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const paginatedData = filteredData.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="container p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">CSV Debug View</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Total entries: {filteredData.length}
          </p>
        </div>
        <Button onClick={handleImportCsv}>
          Import CSV Data
        </Button>
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
            {paginatedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.Project || item.name}</TableCell>
                <TableCell>{item.Round}</TableCell>
                <TableCell>${item.Amount?.toLocaleString()}</TableCell>
                <TableCell>{new Date(item.Date || item.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{item.Lead_Investors}</TableCell>
                <TableCell>{item.Category}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Raw Data Preview</h2>
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4">
            {paginatedData.map((fundraise) => (
              <Card key={fundraise.id} className="p-4 mb-4">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(fundraise, null, 2)}
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
