import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { gigCategories } from "@/data/options";

const availableSkills = [
  "React", "TypeScript", "Node.js", "Python", "Figma", "AWS", 
  "Docker", "Kubernetes", "Solidity", "Flutter", "React Native"
];

export function GigFilters({ onFilterChange, filters }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (value) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleCategoryChange = (value) => {
    onFilterChange({ ...filters, category: value });
  };

  const handleSortChange = (value) => {
    onFilterChange({ ...filters, sortBy: value });
  };

  const handleBudgetChange = (value) => {
    onFilterChange({ ...filters, budgetMin: value[0], budgetMax: value[1] });
  };

  const toggleSkill = (skill) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill];
    onFilterChange({ ...filters, skills: newSkills });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "All",
      budgetMin: 0,
      budgetMax: 50000,
      sortBy: "latest",
      skills: [],
    });
  };

  const activeFiltersCount = 
    (filters.category !== "All" ? 1 : 0) +
    (filters.budgetMin > 0 || filters.budgetMax < 50000 ? 1 : 0) +
    filters.skills.length;

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search gigs..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {gigCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="budget_high">Highest Budget</SelectItem>
            <SelectItem value="budget_low">Lowest Budget</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
          </SelectContent>
        </Select>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Gigs</SheetTitle>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              {/* Budget Range */}
              <div className="space-y-4">
                <Label>Budget Range</Label>
                <Slider
                  value={[filters.budgetMin, filters.budgetMax]}
                  onValueChange={handleBudgetChange}
                  max={50000}
                  step={500}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>${filters.budgetMin.toLocaleString()}</span>
                  <span>${filters.budgetMax.toLocaleString()}</span>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3">
                <Label>Skills</Label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={filters.skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  Clear All
                </Button>
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  Apply Filters
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {(filters.skills.length > 0 || filters.category !== "All") && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.category !== "All" && (
            <Badge variant="secondary" className="gap-1">
              {filters.category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, category: "All" })}
              />
            </Badge>
          )}
          {filters.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1">
              {skill}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => toggleSkill(skill)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
