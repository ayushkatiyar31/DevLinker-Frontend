import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GigCard } from "./GigCard";
import { GigFilters } from "./GigFilters";
import { CreateGigDialog } from "./CreateGigDialog";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { listGigs, listSavedGigs, toggleSaveGig } from "@/services/freelanceService";

export function GigListing() {
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [savedGigs, setSavedGigs] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    budgetMin: 0,
    budgetMax: 50000,
    sortBy: "latest",
    skills: [],
  });

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gigsData, savedData] = await Promise.all([listGigs(), listSavedGigs()]);
      setGigs(gigsData);
      setSavedGigs(savedData.map((g) => g.id));
    } catch (e) {
      setError(e?.message || "Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGigs = useMemo(() => {
    let result = [...gigs];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (gig) =>
          gig.title.toLowerCase().includes(searchLower) ||
          gig.description.toLowerCase().includes(searchLower) ||
          gig.skills.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category !== "All") {
      result = result.filter((gig) => gig.category === filters.category);
    }

    // Budget filter
    result = result.filter(
      (gig) => gig.budgetMin >= filters.budgetMin && gig.budgetMax <= filters.budgetMax
    );

    // Skills filter
    if (filters.skills.length > 0) {
      result = result.filter((gig) =>
        filters.skills.some((skill) => gig.skills.includes(skill))
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case "latest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "budget_high":
        result.sort((a, b) => b.budgetMax - a.budgetMax);
        break;
      case "budget_low":
        result.sort((a, b) => a.budgetMin - b.budgetMin);
        break;
      case "views":
        result.sort((a, b) => b.views - a.views);
        break;
    }

    return result;
  }, [filters, gigs]);

  const handleToggleSaveGig = async (gigId) => {
    try {
      const res = await toggleSaveGig(gigId);
      setSavedGigs(res.savedGigs || []);
    } catch {
      // ignore; card click still works
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Browse Gigs</h2>
          <p className="text-muted-foreground text-sm">
            {filteredGigs.length} gigs available
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex border border-border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2",
                viewMode === "grid" && "bg-muted"
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2",
                viewMode === "list" && "bg-muted"
              )}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
          <CreateGigDialog onCreated={refresh} />
        </div>
      </div>

      {/* Filters */}
      <GigFilters filters={filters} onFilterChange={setFilters} />

      {/* Gig Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading gigs...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : filteredGigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No gigs match your filters</p>
          <Button variant="outline" onClick={() => setFilters({
            search: "",
            category: "All",
            budgetMin: 0,
            budgetMax: 50000,
            sortBy: "latest",
            skills: [],
          })}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={cn(
          "gap-4",
          viewMode === "grid" 
            ? "grid md:grid-cols-2 lg:grid-cols-3" 
            : "flex flex-col"
        )}>
          {filteredGigs.map((gig, index) => (
            <div 
              key={gig.id} 
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <GigCard
                gig={gig}
                onClick={() => navigate(`/freelance/${gig.id}`)}
                onSave={() => handleToggleSaveGig(gig.id)}
                isSaved={savedGigs.includes(gig.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
