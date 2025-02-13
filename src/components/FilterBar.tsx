import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface FilterBarProps {
  timeFilter: string;
  onTimeFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onAmountRangeChange: (range: [number, number]) => void;
  onRoundTypeChange: (value: string) => void;
  onCategoriesChange: (categories: string[]) => void;
  searchValue: string;
  amountRange: [number, number];
  roundType: string;
  selectedCategories: string[];
}

const ROUND_TYPES = [
  "All",
  "Pre-seed",
  "Seed",
  "Series A",
  "Series B",
  "Series C",
  "Series D",
  "Strategic",
  "Private",
  "Public",
];

const CATEGORIES = [
  "DeFi",
  "Infrastructure",
  "Gaming",
  "NFT",
  "DAO",
  "Web3",
  "Layer 1",
  "Layer 2",
  "Privacy",
  "DeSci",
  "AI",
  "Social",
  "Other"
];

export const FilterBar = ({
  timeFilter,
  onTimeFilterChange,
  onSearchChange,
  onAmountRangeChange,
  onRoundTypeChange,
  onCategoriesChange,
  searchValue,
  amountRange,
  roundType,
  selectedCategories,
}: FilterBarProps) => {
  const [localAmountRange, setLocalAmountRange] = useState(amountRange);

  const handleAmountRangeChange = (value: number[]) => {
    setLocalAmountRange([value[0], value[1]]);
    onAmountRangeChange([value[0], value[1]]);
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onCategoriesChange(newCategories);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by company name or investors..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="md:w-[300px]"
        />
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
        <Select value={roundType} onValueChange={onRoundTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Round Type" />
          </SelectTrigger>
          <SelectContent>
            {ROUND_TYPES.map((type) => (
              <SelectItem key={type} value={type.toLowerCase()}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="amount-range">
          <AccordionTrigger>Amount Range</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4">
              <Slider
                value={[localAmountRange[0], localAmountRange[1]]}
                onValueChange={handleAmountRangeChange}
                min={0}
                max={100000000}
                step={100000}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                <span>${(localAmountRange[0] / 1000000).toFixed(1)}M</span>
                <span>${(localAmountRange[1] / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="pt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedCategories.includes(category)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
