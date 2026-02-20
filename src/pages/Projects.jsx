import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SkillBadgeGroup } from "@/components/badges/SkillBadge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  Users, 
  Heart, 
  Crown, 
  Clock, 
  Filter,
  Sparkles,
  Code,
  Rocket,
  TrendingUp,
  ChevronRight,
  ThumbsUp,
  Eye,
  MessageCircle,
  Image,
  Video,
  Link2,
  Trash2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { projectCategories, allTechStacks } from "@/data/options";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { createProject, listProjects, toggleProjectInterest } from "@/services/projectService";

export default function Projects() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [interestedProjects, setInterestedProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    techStack: [],
    lookingFor: "",
    teamSize: "",
    category: "AI/ML",
  });

  // Media state for project creation
  const [newImages, setNewImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideos, setNewVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newLinks, setNewLinks] = useState([]);
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkType, setNewLinkType] = useState("demo");

  const filteredProjects = projects.filter(project => {
    const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.techStack.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleInterest = (projectId) => {
    toggleProjectInterest(projectId)
      .then((result) => {
        const interested = Boolean(result?.interested);
        setInterestedProjects((prev) => {
          if (interested) return Array.from(new Set([...prev, projectId]));
          return prev.filter((id) => id !== projectId);
        });

        const updated = result?.project;
        if (updated?.id) {
          setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        }

        toast.success(interested ? "Interest sent!" : "Removed interest");
      })
      .catch((err) => toast.error(err?.message || "Failed to update interest"));
  };

  const handleCreateProject = () => {
    if (!newProject.title || !newProject.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Convert YouTube URLs to embed format for videos
    const formattedVideos = newVideos.map(video => {
      let embedUrl = video.url;
      if (video.url.includes("youtube.com/watch")) {
        const videoId = video.url.split("v=")[1]?.split("&")[0];
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (video.url.includes("youtu.be/")) {
        const videoId = video.url.split("youtu.be/")[1]?.split("?")[0];
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      return { ...video, url: embedUrl };
    });

    const payload = {
      title: newProject.title,
      description: newProject.description,
      fullDescription: newProject.description,
      techStack: newProject.techStack,
      lookingFor: newProject.lookingFor
        ? newProject.lookingFor.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      teamSize: newProject.teamSize,
      category: newProject.category,
      media: {
        images: newImages,
        videos: formattedVideos,
        links: newLinks,
      },
    };

    createProject(payload)
      .then((created) => {
        setProjects((prev) => [created, ...prev]);
        setIsCreateOpen(false);
        resetForm();
        toast.success("Project posted successfully!");
      })
      .catch((err) => toast.error(err?.message || "Failed to post project"));
  };

  useEffect(() => {
    setIsLoading(true);
    listProjects({ page: 1, limit: 50 })
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch((err) => toast.error(err?.message || "Failed to load projects"))
      .finally(() => setIsLoading(false));
  }, []);

  const resetForm = () => {
    setNewProject({
      title: "",
      description: "",
      techStack: [],
      lookingFor: "",
      teamSize: "",
      category: "AI/ML",
    });
    setNewImages([]);
    setNewImageUrl("");
    setNewVideos([]);
    setNewVideoUrl("");
    setNewVideoTitle("");
    setNewLinks([]);
    setNewLinkTitle("");
    setNewLinkUrl("");
    setNewLinkType("demo");
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setNewImages([...newImages, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const removeImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const addVideo = () => {
    if (newVideoUrl.trim() && newVideoTitle.trim()) {
      setNewVideos([...newVideos, { url: newVideoUrl.trim(), title: newVideoTitle.trim() }]);
      setNewVideoUrl("");
      setNewVideoTitle("");
    }
  };

  const removeVideo = (index) => {
    setNewVideos(newVideos.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (newLinkUrl.trim() && newLinkTitle.trim()) {
      setNewLinks([...newLinks, { url: newLinkUrl.trim(), title: newLinkTitle.trim(), type: newLinkType }]);
      setNewLinkUrl("");
      setNewLinkTitle("");
      setNewLinkType("demo");
    }
  };

  const removeLink = (index) => {
    setNewLinks(newLinks.filter((_, i) => i !== index));
  };

  const toggleTech = (tech) => {
    setNewProject(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Rocket className="w-6 h-6 text-primary" />
              Project Boards
            </h1>
            <p className="text-muted-foreground">Find collaborators or post your project idea</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/projects/dashboard")}
              className="hidden sm:flex"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Project
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post a New Project</DialogTitle>
                <DialogDescription>
                  Share your project idea and find collaborators
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Project Title *</Label>
                  <Input 
                    placeholder="e.g., AI-Powered Code Review Tool"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Describe your project, goals, and what you're looking for..."
                    rows={4}
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Tech Stack</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allTechStacks.slice(0, 12).map(tech => (
                      <Badge
                        key={tech}
                        variant={newProject.techStack.includes(tech) ? "default" : "outline"}
                        className={cn(
                          "cursor-pointer transition-all",
                          newProject.techStack.includes(tech) && "gradient-primary"
                        )}
                        onClick={() => toggleTech(tech)}
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Looking For (comma separated)</Label>
                  <Input 
                    placeholder="e.g., Frontend Developer, UI/UX Designer"
                    value={newProject.lookingFor}
                    onChange={(e) => setNewProject(prev => ({ ...prev, lookingFor: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Team Size</Label>
                    <Input 
                      placeholder="e.g., 2-3 developers"
                      value={newProject.teamSize}
                      onChange={(e) => setNewProject(prev => ({ ...prev, teamSize: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                    >
                      {projectCategories.filter(c => c !== "All").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Images Section */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Image className="w-4 h-4" /> Images (optional)
                  </Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Paste image URL..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={addImage} disabled={!newImageUrl.trim()}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {newImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={img} 
                            alt={`Preview ${index + 1}`} 
                            className="w-16 h-16 object-cover rounded-md border"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/64?text=Error";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Videos Section */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Video className="w-4 h-4" /> Videos (optional)
                  </Label>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Video title"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Input 
                        placeholder="YouTube URL or embed link"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addVideo} 
                        disabled={!newVideoUrl.trim() || !newVideoTitle.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {newVideos.length > 0 && (
                    <div className="space-y-2">
                      {newVideos.map((video, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <Video className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm flex-1 truncate">{video.title}</span>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links Section */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Link2 className="w-4 h-4" /> Links (optional)
                  </Label>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        placeholder="Link title"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                      />
                      <Select value={newLinkType} onValueChange={setNewLinkType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="demo">Live Demo</SelectItem>
                          <SelectItem value="docs">Documentation</SelectItem>
                          <SelectItem value="figma">Figma</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="URL"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addLink} 
                        disabled={!newLinkUrl.trim() || !newLinkTitle.trim()}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {newLinks.length > 0 && (
                    <div className="space-y-2">
                      {newLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <Link2 className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{link.type}</Badge>
                          <span className="text-sm flex-1 truncate">{link.title}</span>
                          <button
                            type="button"
                            onClick={() => removeLink(index)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button className="w-full gradient-primary" onClick={handleCreateProject}>
                  Post Project
                </Button>
              </div>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects, tech stack..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {projectCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "whitespace-nowrap",
                  selectedCategory === category && "gradient-primary"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="p-6 rounded-2xl glass hover-lift transition-all border border-border/50 hover:border-primary/30 cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {project.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(project.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <img 
                      src={project.owner.avatar_url} 
                      alt={project.owner.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-border"
                    />
                    {project.owner.is_premium && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{project.owner.name}</span>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mb-4">
                <SkillBadgeGroup skills={project.techStack} maxVisible={6} size="sm" />
              </div>

              {/* Looking For */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Looking for:</span>
                {project.lookingFor.map(role => (
                  <Badge key={role} variant="outline" className="text-xs bg-primary/5">
                    {role}
                  </Badge>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    {project.upvotesCount ?? project.upvotes?.length ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {project.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {project.teamSize}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={interestedProjects.includes(project.id) ? "default" : "outline"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInterest(project.id);
                    }}
                    className={cn(
                      interestedProjects.includes(project.id) && "gradient-primary"
                    )}
                  >
                    {interestedProjects.includes(project.id) ? (
                      <>
                        <Heart className="w-4 h-4 mr-1 fill-current" />
                        Interested
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-1" />
                        Show Interest
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/projects/${project.id}`);
                    }}
                  >
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 glass rounded-2xl">
              <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No projects found</h3>
              <p className="text-muted-foreground text-sm">
                Try adjusting your filters or post your own project!
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
