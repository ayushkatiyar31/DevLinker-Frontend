import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DeveloperCard } from "@/components/developer/DeveloperCard";
import { MatchAnimation } from "@/components/developer/MatchAnimation";
import { FeedFilters } from "@/components/feed/FeedFilters";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { fetchFeed } from "@/services/feedService";
import { sendConnectionRequest } from "@/services/connectionService";

export default function Feed() {
  const navigate = useNavigate();
  const [developers, setDevelopers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedDeveloper, setMatchedDeveloper] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    techStack: [],
    experience: "",
    role: "",
    availability: "",
    location: "",
  });

  const currentDeveloper = developers[currentIndex];

  const apiFilters = useMemo(() => {
    return {
      skills: filters.techStack,
      experience: filters.experience && filters.experience !== "any" ? filters.experience : "",
      role: filters.role && filters.role !== "any" ? filters.role : "",
      availability: filters.availability && filters.availability !== "any" ? filters.availability : "",
      location: filters.location || "",
    };
  }, [filters]);

  const mapBackendUserToDeveloper = (u) => {
    if (!u) return null;
    return {
      id: u._id,
      name: u.fullName,
      role: u.role,
      bio: u.bio ?? u.about,
      avatar_url: u.photoUrl,
      experience: u.experience,
      location: u.location,
      skills: u.skills,
      availability: u.availability,
      github: u.github,
      linkedin: u.linkedin,
      portfolio: u.portfolio,
      is_premium: u.isPremium,
      is_profile_complete: u.isProfileComplete,
    };
  };

  const fetchDevelopers = async ({ reset = false } = {}) => {
    if (isLoading) return;

    const nextPage = reset ? 1 : page;

    setIsLoading(true);
    try {
      const res = await fetchFeed({
        page: nextPage,
        limit: 10,
        ...apiFilters,
      });

      const incoming = Array.isArray(res?.data) ? res.data : [];
      const mapped = incoming.map(mapBackendUserToDeveloper).filter(Boolean);

      setDevelopers((prev) => (reset ? mapped : [...prev, ...mapped]));
      setCurrentIndex((prev) => (reset ? 0 : prev));
      setHasMore(Boolean(res?.hasMore));
      setPage(nextPage + 1);

      if (reset) {
        toast({
          title: "Filters applied",
          description: `Found ${mapped.length} developers`,
        });
      }
    } catch (err) {
      toast({
        title: "Failed to load feed",
        description: err?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers({ reset: true });
   
  }, []);

  useEffect(() => {
    // When close to the end, fetch next page.
    if (!hasMore || isLoading) return;
    if (developers.length === 0) return;
    if (developers.length - currentIndex <= 3) {
      fetchDevelopers({ reset: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, developers.length, hasMore, isLoading]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);

    setDevelopers([]);
    setCurrentIndex(0);
    setHasMore(true);
    setPage(1);
    // fetch with new filters
    setTimeout(() => fetchDevelopers({ reset: true }), 0);
  };

  const removeCurrentDeveloper = () => {
    setDevelopers((prev) => prev.filter((_, idx) => idx !== currentIndex));
    setCurrentIndex((prev) => (prev >= developers.length - 1 ? prev : prev));
  };

  const handleSwipeLeft = async () => {
    if (!currentDeveloper?.id) return;
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await sendConnectionRequest("ignored", currentDeveloper.id);
      toast({
        title: "Skipped",
        description: `You passed on ${currentDeveloper?.name}`,
      });
    } catch (err) {
      toast({
        title: "Failed to skip",
        description: err?.message || err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
      removeCurrentDeveloper();
    }
  };

  const handleSwipeRight = async () => {
    if (!currentDeveloper?.id) return;
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await sendConnectionRequest("interested", currentDeveloper.id);
      toast({
        title: "Connection request sent!",
        description: `Waiting for ${currentDeveloper?.name} to accept`,
      });
    } catch (err) {
      toast({
        title: "Failed to connect",
        description: err?.message || err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
      removeCurrentDeveloper();
    }
  };

  const resetFeed = () => {
    setFilters({ techStack: [], experience: "", role: "", availability: "", location: "" });
    setDevelopers([]);
    setCurrentIndex(0);
    setHasMore(true);
    setPage(1);
    fetchDevelopers({ reset: true });
    toast({
      title: "Feed refreshed",
      description: "Showing latest developers",
    });
  };

  if (!currentDeveloper) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="py-16 space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold">No more developers!</h2>
            <p className="text-muted-foreground">
              {filters.techStack.length > 0 || filters.role || filters.experience
                ? "Try adjusting your filters to see more developers."
                : "Check back later for new developers."}
            </p>
            <Button onClick={resetFeed} className="gradient-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Feed
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Discover
            </h1>
            <p className="text-muted-foreground text-sm">
              {developers.length - currentIndex} developers left
            </p>
          </div>
          <div className="flex gap-2">
            <FeedFilters 
              filters={filters} 
              onFiltersChange={handleFiltersChange}
              isPremium={false}
            />
            <Button variant="outline" size="icon" onClick={resetFeed} className="rounded-full">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <DeveloperCard 
          key={currentDeveloper.id} 
          developer={currentDeveloper} 
          onSwipeLeft={handleSwipeLeft} 
          onSwipeRight={handleSwipeRight} 
          isActionLoading={isActionLoading}
        />
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          {currentIndex + 1} of {developers.length} • Swipe right to connect
        </p>
      </div>
      
      {showMatch && matchedDeveloper && (
        <MatchAnimation 
          developer={matchedDeveloper} 
          onClose={() => setShowMatch(false)} 
          onMessage={() => { setShowMatch(false); navigate("/messages"); }} 
        />
      )}
    </MainLayout>
  );
}
