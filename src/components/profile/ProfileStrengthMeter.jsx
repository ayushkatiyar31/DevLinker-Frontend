import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, AlertCircle, Sparkles, TrendingUp } from "lucide-react";

export function ProfileStrengthMeter({ profile }) {
  const checks = [
    { label: "Profile photo", completed: !!profile.avatar_url, icon: "📷" },
    { label: "Bio", completed: !!profile.bio && profile.bio.length > 20, icon: "📝" },
    { label: "Skills (3+)", completed: (profile.skills?.length || 0) >= 3, icon: "⚡" },
    { label: "Experience", completed: !!profile.experience, icon: "💼" },
    { label: "Location", completed: !!profile.location, icon: "📍" },
    { label: "Role", completed: !!profile.role, icon: "👤" },
    { label: "GitHub link", completed: !!profile.github, icon: "🔗" },
    { label: "LinkedIn link", completed: !!profile.linkedin, icon: "💼" },
  ];

  const completedCount = checks.filter(c => c.completed).length;
  const strength = Math.round((completedCount / checks.length) * 100);

  const getStrengthInfo = () => {
    if (strength >= 80) return { label: "Strong", color: "text-green-500", bgColor: "bg-green-500", glowColor: "shadow-green-500/20" };
    if (strength >= 50) return { label: "Good", color: "text-yellow-500", bgColor: "bg-yellow-500", glowColor: "shadow-yellow-500/20" };
    return { label: "Weak", color: "text-red-500", bgColor: "bg-red-500", glowColor: "shadow-red-500/20" };
  };

  const strengthInfo = getStrengthInfo();

  return (
    <div className="p-5 rounded-2xl glass border border-border/50 space-y-4 hover:border-primary/20 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-semibold">Profile Strength</h3>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5 transition-all duration-300",
          strengthInfo.color,
          `bg-current/10`
        )}>
          <Sparkles className="w-3.5 h-3.5" />
          {strength}% - {strengthInfo.label}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden",
              strength >= 80 && "bg-gradient-to-r from-green-500 to-emerald-400",
              strength >= 50 && strength < 80 && "bg-gradient-to-r from-yellow-500 to-amber-400",
              strength < 50 && "bg-gradient-to-r from-red-500 to-rose-400"
            )}
            style={{ width: `${strength}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>
      
      {/* Checklist */}
      <div className="grid grid-cols-2 gap-2">
        {checks.map((check, i) => (
          <div 
            key={i} 
            className={cn(
              "flex items-center gap-2 text-sm p-2 rounded-xl transition-all duration-300",
              check.completed 
                ? "bg-green-500/5 hover:bg-green-500/10" 
                : "bg-muted/30 hover:bg-muted/50"
            )}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {check.completed ? (
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                <Circle className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            )}
            <span className={cn(
              "transition-colors duration-200",
              check.completed ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
      
      {/* Suggestion */}
      {strength < 80 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Complete your profile</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Get more visibility and better matches by filling in missing details!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
