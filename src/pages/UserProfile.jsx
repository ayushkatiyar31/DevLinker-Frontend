import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, ExternalLink, Github, Globe, Linkedin, MapPin, Briefcase, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile } from "@/services/userService";
import { resolveBackendAssetUrl } from "@/lib/apiClient";

function mapBackendUserToProfile(backendUser) {
  if (!backendUser) return null;
  return {
    id: backendUser._id,
    name: backendUser.fullName,
    avatar_url: backendUser.photoUrl,
    bio: backendUser.bio ?? backendUser.about,
    skills: backendUser.skills,
    role: backendUser.role,
    availability: backendUser.availability,
    experience: backendUser.experience,
    location: backendUser.location,
    github: backendUser.github,
    linkedin: backendUser.linkedin,
    portfolio: backendUser.portfolio,
    is_premium: backendUser.isPremium,
  };
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { profile: currentProfile, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [backendUser, setBackendUser] = useState(null);

  const displayProfile = useMemo(() => mapBackendUserToProfile(backendUser), [backendUser]);

  useEffect(() => {
    if (!userId) return;

    // If user opens their own profile link, send to /profile
    if (currentProfile?.id && userId === currentProfile.id) {
      navigate("/profile", { replace: true });
      return;
    }

    setLoading(true);
    getUserProfile(userId)
      .then((u) => setBackendUser(u))
      .catch((err) => {
        toast.error(err?.message || "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [userId, currentProfile?.id, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  const showLoading = authLoading || loading || !displayProfile;

  if (showLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto pb-8">
        <div className="glass rounded-3xl overflow-hidden animate-scale-in">
          <div className="relative">
            <div className="h-32 rounded-t-2xl gradient-primary relative overflow-hidden">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/10 blur-2xl animate-pulse" />
            </div>
            <div className="flex justify-center -mt-16 relative z-10">
              <div className="relative group">
                <img
                  src={resolveBackendAssetUrl(displayProfile.avatar_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayProfile.id}`}
                  alt={displayProfile.name}
                  className="relative w-32 h-32 rounded-2xl border-4 border-background object-cover shadow-2xl bg-muted"
                />
                {displayProfile.is_premium && (
                  <div className="absolute -top-3 -right-3 animate-bounce" style={{ animationDuration: "2s" }}>
                    <Badge className="gradient-primary gap-1 shadow-lg">
                      <Crown className="w-3 h-3" />Premium
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 px-6 pb-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{displayProfile.name}</h1>
              <p className="text-primary font-medium mt-1">{displayProfile.role}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
                {displayProfile.experience && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                    <Briefcase className="w-3.5 h-3.5" />{displayProfile.experience}
                  </span>
                )}
                {displayProfile.location && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50">
                    <MapPin className="w-3.5 h-3.5" />{displayProfile.location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-center mb-6">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />Share
              </Button>
            </div>

            <Tabs defaultValue="about" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="links">Links</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <div className="p-5 rounded-2xl glass border border-border/50">
                  <div className="text-muted-foreground text-sm">Bio</div>
                  <p className="mt-3">{displayProfile.bio || "No bio yet"}</p>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="space-y-4">
                <div className="p-5 rounded-2xl glass border border-border/50">
                  <div className="text-muted-foreground text-sm mb-4">Skills</div>
                  <div className="flex flex-wrap gap-2">
                    {(displayProfile.skills || []).length > 0 ? (
                      (displayProfile.skills || []).map((skill) => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills added</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="links" className="space-y-4">
                <div className="p-4 rounded-2xl glass border border-border/50">
                  <div className="flex items-center gap-3">
                    <Github className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-sm">GitHub</div>
                      {displayProfile.github ? (
                        <a href={displayProfile.github} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 mt-1">
                          {displayProfile.github.replace("https://github.com/", "@")}<ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm mt-1">Not added</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass border border-border/50">
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-sm">LinkedIn</div>
                      {displayProfile.linkedin ? (
                        <a href={displayProfile.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 mt-1">
                          LinkedIn Profile<ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm mt-1">Not added</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl glass border border-border/50">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="text-muted-foreground text-sm">Portfolio</div>
                      {displayProfile.portfolio ? (
                        <a href={displayProfile.portfolio} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 mt-1">
                          {displayProfile.portfolio.replace(/^https?:\/\//, "")}<ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm mt-1">Not added</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
