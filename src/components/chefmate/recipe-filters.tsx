
'use client';

import { useContext } from "react";
import { LanguageContext, content } from "@/context/language-context";
import { type FilterType, type FilterValues } from "@/app/page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RecipeFiltersProps {
    onFilterChange: (filterType: FilterType, value: string) => void;
    filters: FilterValues;
}

const filterOptions = {
    cuisine: [
        { value: "Italian", label: "Italian" },
        { value: "Mexican", label: "Mexican" },
        { value: "Indian", label: "Indian" },
        { value: "Chinese", label: "Chinese" },
        { value: "Japanese", label: "Japanese" },
    ],
    diet: [
        { value: "Vegetarian", label: "Vegetarian" },
        { value: "Vegan", label: "Vegan" },
        { value: "Gluten-Free", label: "Gluten-Free" },
        { value: "Keto", label: "Keto" },
    ],
    time: [
        { value: "Under 15 minutes", label: "Under 15 min" },
        { value: "Under 30 minutes", label: "Under 30 min" },
        { value: "Under 1 hour", label: "Under 1 hour" },
    ],
}

export default function RecipeFilters({ onFilterChange, filters }: RecipeFiltersProps) {
  const { language } = useContext(LanguageContext);
  const t = content[language];

  return (
    <div className="flex items-center gap-2">
      <Select value={filters.cuisine} onValueChange={(value) => onFilterChange('cuisine', value)}>
        <SelectTrigger className="w-[110px] h-9">
          <SelectValue placeholder={t.recipes.filters.cuisine} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t.recipes.filters.any}</SelectItem>
          {filterOptions.cuisine.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.diet} onValueChange={(value) => onFilterChange('diet', value)}>
        <SelectTrigger className="w-[110px] h-9">
          <SelectValue placeholder={t.recipes.filters.diet} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t.recipes.filters.any}</SelectItem>
          {filterOptions.diet.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.time} onValueChange={(value) => onFilterChange('time', value)}>
        <SelectTrigger className="w-[110px] h-9">
          <SelectValue placeholder={t.recipes.filters.time} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">{t.recipes.filters.any}</SelectItem>
          {filterOptions.time.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
