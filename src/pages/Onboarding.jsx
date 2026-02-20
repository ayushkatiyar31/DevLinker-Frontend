import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Camera,
  Check,
  Briefcase,
  Code,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { resolveBackendAssetUrl } from "@/lib/apiClient";

const skills = [
  "React", "Vue.js", "Angular", "Node.js", "Python", "Go", "Rust",
  "TypeScript", "JavaScript", "PostgreSQL", "MongoDB", "AWS", "Docker",
  "Kubernetes", "GraphQL", "REST API", "Machine Learning", "DevOps",
  "React Native", "Flutter", "Swift", "Kotlin", "Solidity", "Web3"
];

const availabilityOptions = [
  { id: "Open to work", label: "Open to Work", icon: Briefcase, description: "Looking for a new job" },
  { id: "Open to projects", label: "Open to Projects", icon: Code, description: "Available for freelance" },
  { id: "Open to startups", label: "Open to Startups", icon: Rocket, description: "Looking to join or start" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { createProfile, signOut, user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    avatar_url: "",
    role: "",
    bio: "",
    experience: "",
    location: "",
    skills: [],
    availability: "",
    github: "",
    linkedin: "",
    portfolio: ""
  });

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    const profileData = {
      name: user?.fullName || "Developer",
      role: formData.role,
      bio: formData.bio,
      avatar_url: formData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?._id || "dev"}`,
      experience: formData.experience,
      location: formData.location,
      skills: formData.skills,
      availability: formData.availability,
      github: formData.github,
      linkedin: formData.linkedin,
      portfolio: formData.portfolio,
    };

    const { error } = await createProfile(profileData);
    
    if (error) {
      toast.error(error.message || "Failed to create profile");
      setIsLoading(false);
      return;
    }

    // Per desired flow: finish onboarding, then return to login.
    // Logging out forces a fresh login and keeps route guards consistent.
    await signOut();

    toast.success("Profile saved! Please sign in to continue.");
    navigate("/login", { replace: true });
    setIsLoading(false);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.role && formData.bio;
      case 2: return formData.skills.length >= 3;
      case 3: return formData.availability;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
 {/* Header */}
<div className="p-4 border-b border-border">
  <div className="max-w-2xl mx-auto flex items-center justify-between">
    
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </div>
      <span className="font-bold gradient-text">Devlinker</span>
    </div>

    <div className="text-sm text-muted-foreground">
      Step {step} of 4
    </div>

  </div>
</div>

      {/* Progress Bar */}
      <div className="w-full bg-muted h-1">
        <div 
          className="h-full gradient-primary transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-xl w-full animate-fade-in">
          {step === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Tell us about yourself</h1>
                <p className="text-muted-foreground">Help others understand who you are</p>
              </div>

              {/* Avatar Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {formData.avatar_url ? (
                      <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <Button 
                    size="icon" 
                    className="absolute -bottom-2 -right-2 rounded-full gradient-primary"
                    onClick={() => setFormData({ ...formData, avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}` })}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Your Role *</Label>
                  <Input
                    id="role"
                    placeholder="e.g. Full Stack Developer"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself, your interests, and what you're looking for..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience</Label>
                    <Input
                      id="experience"
                      placeholder="e.g. 5 years"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What's your stack?</h1>
                <p className="text-muted-foreground">Select at least 3 skills (selected: {formData.skills.length})</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant={formData.skills.includes(skill) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer text-sm py-2 px-4 transition-all",
                      formData.skills.includes(skill) && "gradient-primary border-0"
                    )}
                    onClick={() => handleSkillToggle(skill)}
                  >
                    {formData.skills.includes(skill) && <Check className="w-3 h-3 mr-1" />}
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">What are you looking for?</h1>
                <p className="text-muted-foreground">Select your availability status</p>
              </div>

              <div className="grid gap-4">
                {availabilityOptions.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "p-6 rounded-2xl border-2 cursor-pointer transition-all hover-lift",
                      formData.availability === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setFormData({ ...formData, availability: option.id })}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        formData.availability === option.id
                          ? "gradient-primary"
                          : "bg-muted"
                      )}>
                        <option.icon className={cn(
                          "w-6 h-6",
                          formData.availability === option.id
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{option.label}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      {formData.availability === option.id && (
                        <Check className="w-6 h-6 text-primary ml-auto" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Add your links</h1>
                <p className="text-muted-foreground">Optional but helps others find your work</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="github">GitHub Username</Label>
                  <Input
                    id="github"
                    placeholder="username"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio">Portfolio URL</Label>
                  <Input
                    id="portfolio"
                    placeholder="yoursite.com"
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep(prev => prev - 1)}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              className="gradient-primary"
              onClick={() => setStep(prev => prev + 1)}
              disabled={!canProceed()}
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="gradient-primary"
              onClick={handleComplete}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Complete Profile"}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
