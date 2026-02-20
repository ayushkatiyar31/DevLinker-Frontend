import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Eye, Users, ThumbsUp, ThumbsDown, Clock, DollarSign, 
  MapPin, Bookmark, ArrowUpRight, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";

export function GigCard({ gig, onClick, onSave, isSaved = false }) {
  const netVotes = gig.upvotes.length - gig.downvotes.length;
  const daysAgo = Math.floor((Date.now() - new Date(gig.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  const formatBudget = () => {
    if (gig.budgetType === "hourly") {
      return `$${gig.budgetMin}-$${gig.budgetMax}/hr`;
    }
    return `$${gig.budgetMin.toLocaleString()}-$${gig.budgetMax.toLocaleString()}`;
  };

  return (
    <Card 
      className="glass border-border/50 hover-lift transition-all cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs font-medium">
                {gig.category}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  gig.status === "open" && "border-green-500/50 text-green-500",
                  gig.status === "in_progress" && "border-blue-500/50 text-blue-500",
                  gig.status === "completed" && "border-muted-foreground/50 text-muted-foreground"
                )}
              >
                {gig.status === "open" ? "Open" : gig.status === "in_progress" ? "In Progress" : "Completed"}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {gig.title}
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 transition-colors",
              isSaved && "text-primary"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onSave?.();
            }}
          >
            <Bookmark className={cn("w-5 h-5", isSaved && "fill-current")} />
          </Button>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {gig.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {gig.skills.slice(0, 4).map((skill) => (
            <Badge 
              key={skill} 
              variant="outline" 
              className="text-xs bg-accent/50 border-accent-foreground/20"
            >
              {skill}
            </Badge>
          ))}
          {gig.skills.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{gig.skills.length - 4}
            </Badge>
          )}
        </div>

        {/* Budget & Duration */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <DollarSign className="w-4 h-4" />
            <span>{formatBudget()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{gig.duration}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/50 mb-4" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Owner */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <img 
                src={gig.owner.avatar_url} 
                alt={gig.owner.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-border"
              />
              {gig.owner.is_premium && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-primary flex items-center justify-center">
                  <Crown className="w-2.5 h-2.5 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="text-sm">
              <p className="font-medium line-clamp-1">{gig.owner.name}</p>
              <p className="text-xs text-muted-foreground">
                {daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{gig.views}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{gig.applicationsCount}</span>
            </div>
            <div className={cn(
              "flex items-center gap-1",
              netVotes > 0 && "text-green-500",
              netVotes < 0 && "text-red-500"
            )}>
              {netVotes >= 0 ? (
                <ThumbsUp className="w-4 h-4" />
              ) : (
                <ThumbsDown className="w-4 h-4" />
              )}
              <span>{Math.abs(netVotes)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
