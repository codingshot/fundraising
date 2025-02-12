
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
}

export const FilterBar = ({ timeFilter, onTimeFilterChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-4">
      <Select value={timeFilter} onValueChange={onTimeFilterChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Time period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All time</SelectItem>
          <SelectItem value="day">Last 24 hours</SelectItem>
          <SelectItem value="week">Last week</SelectItem>
          <SelectItem value="month">Last month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
