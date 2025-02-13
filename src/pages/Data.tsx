
import { FilterBar } from "@/components/FilterBar";
import { ProjectGrid } from "@/components/ProjectGrid";
import { useQuery } from "@tanstack/react-query";
import { fetchCuratedSubmissions } from "@/services/api";
import { useState } from "react";

const DataPage = () => {
  const [timeFilter, setTimeFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [amountRange, setAmountRange] = useState<[number, number]>([0, 100000000]);
  const [roundType, setRoundType] = useState("all");
  const [viewMode, setViewMode] = useState<'card' | 'row'>('row');

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["curatedSubmissions"],
    queryFn: fetchCuratedSubmissions,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Crypto Fundraising Data</h1>
      
      <FilterBar
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        amountRange={amountRange}
        onAmountRangeChange={setAmountRange}
        roundType={roundType}
        onRoundTypeChange={setRoundType}
      />

      <ProjectGrid
        submissions={submissions}
        isLoading={isLoading}
        timeFilter={timeFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchValue={searchValue}
        amountRange={amountRange}
        roundType={roundType}
      />
    </div>
  );
};

export default DataPage;
