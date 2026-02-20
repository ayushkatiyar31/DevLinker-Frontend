import { Badge } from "@/components/ui/badge";
import { CheckCircle, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const skillColors = {
  "React": "bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30",
  "TypeScript": "bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30",
  "Node.js": "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
  "Python": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30",
  "AWS": "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30",
  "Docker": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30",
  "Kubernetes": "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
  "GraphQL": "bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30",
  "MongoDB": "bg-green-600/20 text-green-300 border-green-600/30 hover:bg-green-600/30",
  "PostgreSQL": "bg-blue-700/20 text-blue-300 border-blue-700/30 hover:bg-blue-700/30",
  "Flutter": "bg-sky-500/20 text-sky-400 border-sky-500/30 hover:bg-sky-500/30",
  "React Native": "bg-cyan-600/20 text-cyan-300 border-cyan-600/30 hover:bg-cyan-600/30",
  "Vue.js": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30",
  "Solidity": "bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30",
  "Go": "bg-teal-500/20 text-teal-400 border-teal-500/30 hover:bg-teal-500/30",
  "Rust": "bg-orange-600/20 text-orange-300 border-orange-600/30 hover:bg-orange-600/30",
  "TensorFlow": "bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30",
  "PyTorch": "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function SkillBadge({ 
  skill, 
  isVerified = false, 
  size = "md", 
  showVerifiedIcon = true,
  className 
}) {
  const colorClass = skillColors[skill] || "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30";
  
  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        "border transition-colors duration-200 font-medium",
        colorClass,
        sizeClasses[size],
        isVerified && "ring-1 ring-green-500/50",
        className
      )}
    >
      {skill}
      {isVerified && showVerifiedIcon && (
        <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
      )}
    </Badge>
  );

  if (isVerified) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Verified skill</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}

export function AchievementBadge({ 
  name, 
  icon, 
  description,
  size = "md",
  className 
}) {
  const badge = (
    <Badge 
      variant="outline" 
      className={cn(
        "border bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 hover:from-amber-500/30 hover:to-orange-500/30 transition-all duration-200",
        sizeClasses[size],
        className
      )}
    >
      <span className="mr-1">{icon}</span>
      {name}
    </Badge>
  );

  if (description) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return badge;
}

export function SkillBadgeGroup({ 
  skills, 
  verifiedSkills = [], 
  maxVisible = 5,
  size = "sm",
  className 
}) {
  const visibleSkills = skills.slice(0, maxVisible);
  const remainingCount = skills.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visibleSkills.map((skill) => (
        <SkillBadge 
          key={skill} 
          skill={skill} 
          isVerified={verifiedSkills.includes(skill)}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <Badge variant="secondary" className={cn("text-muted-foreground", sizeClasses[size])}>
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
