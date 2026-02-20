import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Briefcase, 
  Github, 
  Linkedin, 
  Globe,
  Crown,
  X,
  Heart,
  Star,
  Code2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function DeveloperCard({ developer, onSwipeLeft, onSwipeRight, isActionLoading = false, className = "" }) {
  const navigate = useNavigate();
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleOpenProfile = (e) => {
    e?.stopPropagation?.();
    if (developer?.id) {
      navigate(`/profile/${developer.id}`);
    }
  };

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setOffsetX(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (offsetX > 100) handleSwipeRight();
    else if (offsetX < -100) handleSwipeLeft();
    else setOffsetX(0);
  };

  const handleSwipeLeft = () => {
    if (isActionLoading) return;
    setSwipeDirection("left");
    setTimeout(() => { onSwipeLeft?.(); setSwipeDirection(null); setOffsetX(0); }, 300);
  };

  const handleSwipeRight = () => {
    if (isActionLoading) return;
    setSwipeDirection("right");
    setTimeout(() => { onSwipeRight?.(); setSwipeDirection(null); setOffsetX(0); }, 300);
  };

  const getCardStyle = () => {
    if (swipeDirection === "left") return "swipe-left";
    if (swipeDirection === "right") return "swipe-right";
    return "";
  };

  return (
    <div
      className={cn("relative w-full max-w-md mx-auto swipe-card", getCardStyle(), className)}
      style={{ transform: isDragging ? `translateX(${offsetX}px) rotate(${offsetX * 0.03}deg)` : undefined }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe indicators */}
      {offsetX > 50 && (
        <div className="absolute top-10 left-6 z-20 animate-pulse">
          <div className="px-8 py-3 rounded-2xl border-4 border-green-500 bg-green-500/20 rotate-[-15deg] backdrop-blur-sm">
            <span className="text-green-400 text-3xl font-black tracking-wider">CONNECT</span>
          </div>
        </div>
      )}
      {offsetX < -50 && (
        <div className="absolute top-10 right-6 z-20 animate-pulse">
          <div className="px-8 py-3 rounded-2xl border-4 border-red-500 bg-red-500/20 rotate-[15deg] backdrop-blur-sm">
            <span className="text-red-400 text-3xl font-black tracking-wider">SKIP</span>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 shadow-2xl">
        {/* Header Image */}
        <div className="relative h-72 overflow-hidden">
          <button type="button" className="block w-full h-full" onClick={handleOpenProfile}>
            <img 
              src={developer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${developer.id}`} 
              alt={developer.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
            />
          </button>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          
          {/* Premium Badge */}
          {developer.is_premium && (
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg gap-1.5 px-3 py-1">
                <Crown className="w-3.5 h-3.5" />
                Premium
              </Badge>
            </div>
          )}
          
          {/* Availability Badge */}
          <div className="absolute top-4 left-4">
            <Badge 
              variant="secondary" 
              className="bg-background/80 backdrop-blur-md border-border/50 shadow-md px-3 py-1"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
              {developer.availability || "Available"}
            </Badge>
          </div>
          
          {/* Match Score */}
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-md rounded-full px-3 py-1.5 shadow-md">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-sm font-semibold">{Math.floor(Math.random() * 30) + 70}% Match</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Name & Role */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-foreground">{developer.name}</h2>
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <p className="text-lg font-medium text-primary">{developer.role}</p>
          </div>
          
          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {developer.experience && (
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                <Briefcase className="w-4 h-4 text-primary" />
                {developer.experience}
              </span>
            )}
            {developer.location && (
              <span className="flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-primary" />
                {developer.location}
              </span>
            )}
          </div>
          
          {/* Bio */}
          {developer.bio && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {developer.bio}
            </p>
          )}
          
          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {(developer.skills || []).slice(0, 5).map((skill, index) => (
              <Badge 
                key={skill} 
                variant="outline" 
                className={cn(
                  "text-xs font-medium transition-colors",
                  index === 0 && "border-primary/50 bg-primary/10 text-primary",
                  index > 0 && "hover:border-primary/30 hover:bg-primary/5"
                )}
              >
                {skill}
              </Badge>
            ))}
            {(developer.skills?.length || 0) > 5 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{developer.skills.length - 5} more
              </Badge>
            )}
          </div>
          
          {/* Social Links */}
          {(developer.github || developer.linkedin || developer.portfolio) && (
            <div className="flex items-center gap-2 pt-2">
              {developer.github && (
                <a href={developer.github} target="_blank" rel="noopener noreferrer" 
                   className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                  <Github className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {developer.linkedin && (
                <a href={developer.linkedin} target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                  <Linkedin className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              )}
              {developer.portfolio && (
                <a href={developer.portfolio} target="_blank" rel="noopener noreferrer"
                   className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                  <Globe className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 p-6 pt-2 pb-8">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full w-16 h-16 border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive hover:scale-110 transition-all duration-200 shadow-lg" 
            onClick={handleSwipeLeft}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <X className="w-7 h-7" />
            )}
          </Button>
          <Button 
            size="lg" 
            className="rounded-full w-16 h-16 bg-gradient-to-br from-primary via-primary to-accent hover:opacity-90 hover:scale-110 transition-all duration-200 shadow-xl shadow-primary/25" 
            onClick={handleSwipeRight}
            disabled={isActionLoading}
          >
            {isActionLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <Heart className="w-8 h-8" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
