import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, X, Save, Crown } from "lucide-react";
import { allTechStacks, experienceLevels, roles, availabilityOptions } from "@/data/options";
import { cn } from "@/lib/utils";

export function FeedFilters({ filters, onFiltersChange, isPremium = false }) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const toggleTech = (tech) => {
    setLocalFilters(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech) 
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const clearFilters = () => {
    const empty = { techStack: [], experience: "", role: "", availability: "", location: "" };
    setLocalFilters(empty);
    onFiltersChange(empty);
  };

  const hasActiveFilters = filters.techStack.length > 0 || filters.experience || filters.role || filters.availability || filters.location;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={cn("rounded-full relative", hasActiveFilters && "border-primary")}>
          <Filter className="w-4 h-4" />
          {hasActiveFilters && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Filters
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />Clear all
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Tech Stack</Label>
            <div className="flex flex-wrap gap-2">
              {allTechStacks.map(tech => (
                <Badge 
                  key={tech} 
                  variant={localFilters.techStack.includes(tech) ? "default" : "outline"}
                  className={cn("cursor-pointer", localFilters.techStack.includes(tech) && "gradient-primary border-0")}
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Experience</Label>
            <Select value={localFilters.experience} onValueChange={(v) => setLocalFilters(prev => ({ ...prev, experience: v }))}>
              <SelectTrigger><SelectValue placeholder="Any experience" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any experience</SelectItem>
                {experienceLevels.map(exp => <SelectItem key={exp} value={exp}>{exp}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Role</Label>
            <Select value={localFilters.role} onValueChange={(v) => setLocalFilters(prev => ({ ...prev, role: v }))}>
              <SelectTrigger><SelectValue placeholder="Any role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any role</SelectItem>
                {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Availability</Label>
            <Select value={localFilters.availability} onValueChange={(v) => setLocalFilters(prev => ({ ...prev, availability: v }))}>
              <SelectTrigger><SelectValue placeholder="Any availability" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any availability</SelectItem>
                {availabilityOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Location</Label>
            <Input 
              placeholder="e.g., San Francisco, Remote" 
              value={localFilters.location} 
              onChange={(e) => setLocalFilters(prev => ({ ...prev, location: e.target.value }))}
            />
          </div>

          {isPremium && (
            <div className="p-4 rounded-xl glass border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Saved Filters</span>
                <Badge variant="secondary" className="text-xs">Premium</Badge>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Save className="w-4 h-4 mr-2" />Save current filters
              </Button>
            </div>
          )}

          <Button className="w-full gradient-primary" onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
