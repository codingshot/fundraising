
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const CsvDebug = () => {
  const { data: fundraises, isLoading, error } = useQuery({
    queryKey: ["raw-fundraises"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('processed_fundraises')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

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

  return (
    <div className="container p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CSV Debug View</h1>
        <div className="text-sm text-muted-foreground">
          Total entries: {fundraises?.length || 0}
        </div>
      </div>

      <ScrollArea className="h-[800px] rounded-md border">
        <div className="p-4">
          {fundraises?.map((fundraise) => (
            <Card key={fundraise.id} className="p-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold">Basic Info</h3>
                  <div className="space-y-2 mt-2">
                    <p><span className="font-semibold">Project:</span> {fundraise.Project}</p>
                    <p><span className="font-semibold">Name:</span> {fundraise.name}</p>
                    <p><span className="font-semibold">Round:</span> {fundraise.Round}</p>
                    <p><span className="font-semibold">Amount:</span> ${fundraise.Amount?.toLocaleString()}</p>
                    <p><span className="font-semibold">Date:</span> {new Date(fundraise.Date || fundraise.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold">Additional Details</h3>
                  <div className="space-y-2 mt-2">
                    <p><span className="font-semibold">Lead Investors:</span> {fundraise.Lead_Investors}</p>
                    <p><span className="font-semibold">Other Investors:</span> {fundraise.Other_Investors?.join(', ')}</p>
                    <p><span className="font-semibold">Category:</span> {fundraise.Category}</p>
                    <p><span className="font-semibold">Website:</span> {fundraise.Website}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-bold">Description</h3>
                <p className="mt-2 text-sm">{fundraise.description}</p>
              </div>

              <div className="mt-4">
                <h3 className="font-bold">Raw Data</h3>
                <pre className="mt-2 p-2 bg-accent/50 rounded-md text-xs overflow-auto">
                  {JSON.stringify(fundraise, null, 2)}
                </pre>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CsvDebug;
