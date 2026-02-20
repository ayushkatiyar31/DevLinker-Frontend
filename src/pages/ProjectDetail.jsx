import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowLeft, ThumbsUp, ThumbsDown, Eye, MessageCircle, 
  Share2, ExternalLink, Github, FileText, Play,
  Calendar, Users, Send, Heart, ChevronDown, ChevronUp,
  Plus, Image, Video, Link2, Trash2, Upload
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  addProjectComment,
  addProjectReply,
  getProjectById,
  listProjectComments,
  toggleCommentLike,
  toggleReplyLike,
  updateProject,
  voteProject,
} from "@/services/projectService";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [userVote, setUserVote] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [selectedImage, setSelectedImage] = useState(null);
  const [commentSort, setCommentSort] = useState("top");
  
  // Media contribution state
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newLinks, setNewLinks] = useState([
    { title: "", url: "", type: "demo" }
  ]);

  const currentUserId = profile?.id || null;

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const data = await getProjectById(projectId);
        if (!isMounted) return;
        setProject(data);

        if (currentUserId) {
          if (data?.upvotes?.includes(currentUserId)) setUserVote("up");
          else if (data?.downvotes?.includes(currentUserId)) setUserVote("down");
          else setUserVote(null);
        } else {
          setUserVote(null);
        }

      } catch (err) {
        if (!isMounted) return;
        setProject(null);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [projectId, currentUserId]);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        const commentData = await listProjectComments(projectId, { sort: commentSort });
        if (!isMounted) return;
        setComments(Array.isArray(commentData) ? commentData : []);
      } catch {
        if (!isMounted) return;
        setComments([]);
      }
    };

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [projectId, commentSort]);

  if (!project) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </MainLayout>
    );
  }

  const likesCount = project.upvotesCount ?? project.upvotes?.length ?? 0;

  const handleVote = (type) => {
    if (!project) return;

    if (!currentUserId) {
      toast({ title: "Please login to vote", variant: "destructive", duration: 1500 });
      return;
    }

    const nextType = userVote === type ? "clear" : type;

    voteProject(project.id, nextType)
      .then((updated) => {
        setProject(updated);
        if (nextType === "clear") setUserVote(null);
        else setUserVote(type);
        toast({ title: type === "up" ? "Upvoted!" : "Downvoted!", duration: 1500 });
      })
      .catch((err) => toast({ title: err?.message || "Failed to vote", variant: "destructive", duration: 1500 }));
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !project) return;
    if (!currentUserId) {
      toast({ title: "Please login to comment", variant: "destructive", duration: 1500 });
      return;
    }

    addProjectComment(project.id, newComment.trim())
      .then((created) => {
        setComments((prev) => [created, ...prev]);
        setNewComment("");
        toast({ title: "Comment added!", duration: 1500 });
      })
      .catch((err) => toast({ title: err?.message || "Failed to comment", variant: "destructive", duration: 1500 }));
  };

  const handleAddReply = (commentId) => {
    if (!replyContent.trim() || !project) return;
    if (!currentUserId) {
      toast({ title: "Please login to reply", variant: "destructive", duration: 1500 });
      return;
    }

    addProjectReply(project.id, commentId, replyContent.trim())
      .then((updatedComment) => {
        setComments((prev) => prev.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
        setReplyingTo(null);
        setReplyContent("");
        setExpandedReplies((prev) => new Set(prev).add(commentId));
        toast({ title: "Reply added!", duration: 1500 });
      })
      .catch((err) => toast({ title: err?.message || "Failed to reply", variant: "destructive", duration: 1500 }));
  };

  const handleLikeComment = (commentId, isReply = false, parentId) => {
    if (!project) return;
    if (!currentUserId) {
      toast({ title: "Please login to like", variant: "destructive", duration: 1500 });
      return;
    }

    if (isReply && parentId) {
      toggleReplyLike(project.id, parentId, commentId)
        .then((updatedComment) => {
          setComments((prev) => prev.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
        })
        .catch((err) => toast({ title: err?.message || "Failed to like", variant: "destructive", duration: 1500 }));
      return;
    }

    toggleCommentLike(project.id, commentId)
      .then((updatedComment) => {
        setComments((prev) => prev.map((c) => (c.id === updatedComment.id ? updatedComment : c)));
      })
      .catch((err) => toast({ title: err?.message || "Failed to like", variant: "destructive", duration: 1500 }));
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard!", duration: 1500 });
    } catch {
      toast({ title: "Failed to copy link", variant: "destructive", duration: 1500 });
    }
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim() || !project) return;
    if (!currentUserId) {
      toast({ title: "Please login to add media", variant: "destructive", duration: 1500 });
      return;
    }

    const nextImages = [...(project.media?.images ?? []), newImageUrl.trim()];
    updateProject(project.id, { media: { ...project.media, images: nextImages } })
      .then((updated) => {
        setProject(updated);
        setNewImageUrl("");
        toast({ title: "Image added successfully!", duration: 1500 });
      })
      .catch((err) => toast({ title: err?.message || "Failed to add image", variant: "destructive", duration: 1500 }));
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim() || !newVideoTitle.trim() || !project) return;
    if (!currentUserId) {
      toast({ title: "Please login to add media", variant: "destructive", duration: 1500 });
      return;
    }
    
    // Convert YouTube URL to embed format
    let embedUrl = newVideoUrl;
    if (newVideoUrl.includes("youtube.com/watch")) {
      const videoId = newVideoUrl.split("v=")[1]?.split("&")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (newVideoUrl.includes("youtu.be/")) {
      const videoId = newVideoUrl.split("youtu.be/")[1]?.split("?")[0];
      if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    
    const nextVideos = [...(project.media?.videos ?? []), { url: embedUrl, title: newVideoTitle.trim() }];
    updateProject(project.id, { media: { ...project.media, videos: nextVideos } })
      .then((updated) => {
        setProject(updated);
        setNewVideoUrl("");
        setNewVideoTitle("");
        toast({ title: "Video added successfully!", duration: 1500 });
      })
      .catch((err) => toast({ title: err?.message || "Failed to add video", variant: "destructive", duration: 1500 }));
  };

  const handleAddLinks = () => {
    if (!project) return;
    if (!currentUserId) {
      toast({ title: "Please login to add media", variant: "destructive", duration: 1500 });
      return;
    }
    
    const validLinks = newLinks.filter(link => link.title.trim() && link.url.trim());
    if (validLinks.length === 0) return;

    const nextLinks = [...(project.media?.links ?? []), ...validLinks];
    updateProject(project.id, { media: { ...project.media, links: nextLinks } })
      .then((updated) => {
        setProject(updated);
        setNewLinks([{ title: "", url: "", type: "demo" }]);
        toast({ title: `${validLinks.length} link(s) added successfully!`, duration: 1500 });
      })
      .catch((err) => toast({ title: err?.message || "Failed to add links", variant: "destructive", duration: 1500 }));
  };

  const addLinkField = () => {
    setNewLinks([...newLinks, { title: "", url: "", type: "demo" }]);
  };

  const removeLinkField = (index) => {
    if (newLinks.length > 1) {
      setNewLinks(newLinks.filter((_, i) => i !== index));
    }
  };

  const updateLinkField = (index, field, value) => {
    setNewLinks(newLinks.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    ));
  };

  const resetMediaDialog = () => {
    setNewImageUrl("");
    setNewVideoUrl("");
    setNewVideoTitle("");
    setNewLinks([{ title: "", url: "", type: "demo" }]);
    setMediaType("image");
  };

  const getLinkIcon = (type) => {
    switch (type) {
      case "github": return <Github className="h-4 w-4" />;
      case "demo": return <ExternalLink className="h-4 w-4" />;
      case "docs": return <FileText className="h-4 w-4" />;
      case "figma": return <ExternalLink className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (commentSort === "top") {
      return b.likes.length - a.likes.length;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate("/projects")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>

        {/* Project Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary">{project.category}</Badge>
                <Badge variant="outline" className="text-green-500 border-green-500/30">
                  {project.status}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold">{project.title}</h1>
              <p className="text-muted-foreground text-lg">{project.description}</p>
            </div>

            {/* Voting Panel */}
            <Card className="w-full sm:w-auto">
              <CardContent className="p-4 flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant={userVote === "up" ? "default" : "outline"} 
                    size="icon"
                    onClick={() => handleVote("up")}
                    className={userVote === "up" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="font-bold text-lg">{likesCount}</span>
                  <Button 
                    variant={userVote === "down" ? "default" : "outline"} 
                    size="icon"
                    onClick={() => handleVote("down")}
                    className={userVote === "down" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Eye className="h-4 w-4" /> {project.views} views
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" /> {comments.length} comments
                  </div>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Author Info */}
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={project.owner.avatar_url} />
                <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{project.owner.name}</p>
                <p className="text-sm text-muted-foreground">{project.owner.role}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {project.teamSize}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="px-3 py-1">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <TabsList className="justify-start">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="media">Media ({project.media.images.length + project.media.videos.length})</TabsTrigger>
              <TabsTrigger value="links">Links ({project.media.links.length})</TabsTrigger>
            </TabsList>

            {/* Contribute Media Button */}
            <Dialog open={isMediaDialogOpen} onOpenChange={(open) => {
              setIsMediaDialogOpen(open);
              if (!open) resetMediaDialog();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" /> Contribute Media
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Contribute to Project</DialogTitle>
                  <DialogDescription>
                    Share images, videos, or links related to this project
                  </DialogDescription>
                </DialogHeader>
                
                {/* Media Type Tabs */}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant={mediaType === "image" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMediaType("image")}
                    className="flex-1"
                  >
                    <Image className="h-4 w-4 mr-2" /> Image
                  </Button>
                  <Button
                    variant={mediaType === "video" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMediaType("video")}
                    className="flex-1"
                  >
                    <Video className="h-4 w-4 mr-2" /> Video
                  </Button>
                  <Button
                    variant={mediaType === "link" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMediaType("link")}
                    className="flex-1"
                  >
                    <Link2 className="h-4 w-4 mr-2" /> Links
                  </Button>
                </div>

                {/* Image Form */}
                {mediaType === "image" && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Paste a direct link to an image
                      </p>
                    </div>
                    {newImageUrl && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                        <img 
                          src={newImageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x300?text=Invalid+Image+URL";
                          }}
                        />
                      </div>
                    )}
                    <Button onClick={handleAddImage} disabled={!newImageUrl.trim()} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Image
                    </Button>
                  </div>
                )}

                {/* Video Form */}
                {mediaType === "video" && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Video Title</Label>
                      <Input
                        placeholder="Demo Video"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Video URL (YouTube or embed URL)</Label>
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports YouTube links - will be converted to embed format
                      </p>
                    </div>
                    <Button 
                      onClick={handleAddVideo} 
                      disabled={!newVideoUrl.trim() || !newVideoTitle.trim()} 
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Video
                    </Button>
                  </div>
                )}

                {/* Links Form */}
                {mediaType === "link" && (
                  <div className="space-y-4 mt-4">
                    {newLinks.map((link, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Link {index + 1}</span>
                            {newLinks.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => removeLinkField(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                          <div>
                            <Label>Title</Label>
                            <Input
                              placeholder="GitHub Repository"
                              value={link.title}
                              onChange={(e) => updateLinkField(index, "title", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>URL</Label>
                            <Input
                              placeholder="https://github.com/..."
                              value={link.url}
                              onChange={(e) => updateLinkField(index, "url", e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={link.type}
                              onValueChange={(value) => updateLinkField(index, "type", value)}
                            >
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
                        </div>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addLinkField} className="w-full">
                      <Plus className="h-4 w-4 mr-2" /> Add Another Link
                    </Button>
                    <Button 
                      onClick={handleAddLinks} 
                      disabled={!newLinks.some(l => l.title.trim() && l.url.trim())} 
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Links
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardContent className="p-6 prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground">
                  {project.fullDescription.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace('## ', '')}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                    }
                    if (line.startsWith('- **')) {
                      const match = line.match(/- \*\*(.+?)\*\*: (.+)/);
                      if (match) {
                        return (
                          <div key={i} className="flex gap-2 my-1">
                            <span className="font-semibold text-foreground">• {match[1]}:</span>
                            <span className="text-muted-foreground">{match[2]}</span>
                          </div>
                        );
                      }
                    }
                    if (line.match(/^\d+\./)) {
                      return <p key={i} className="text-muted-foreground ml-4 my-1">{line}</p>;
                    }
                    if (line.trim() === '') {
                      return <br key={i} />;
                    }
                    return <p key={i} className="text-muted-foreground my-2">{line}</p>;
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-6 space-y-6">
            {/* Images */}
            {project.media.images.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Image className="h-5 w-5" /> Images ({project.media.images.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.media.images.map((img, index) => (
                    <div 
                      key={index} 
                      className="aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 ring-primary transition-all"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} alt={`Project image ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {project.media.videos.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Video className="h-5 w-5" /> Videos ({project.media.videos.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {project.media.videos.map((video, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Play className="h-4 w-4" /> {video.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <iframe 
                            src={video.url} 
                            title={video.title}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {project.media.images.length === 0 && project.media.videos.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No media available for this project yet.</p>
                  <p className="text-sm mt-2">Be the first to contribute!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="links" className="mt-6">
            {project.media.links.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.media.links.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="hover:border-primary transition-colors cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-3">
                        {getLinkIcon(link.type)}
                        <span className="font-medium">{link.title}</span>
                        <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No links available for this project yet.</p>
                  <p className="text-sm mt-2">Add GitHub repos, demos, or documentation!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> Comments ({comments.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant={commentSort === "top" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCommentSort("top")}
                >
                  Top
                </Button>
                <Button 
                  variant={commentSort === "newest" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCommentSort("newest")}
                >
                  Newest
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-2" /> Post Comment
                </Button>
              </div>
            </div>

            <Separator />

            {/* Comments List */}
            <div className="space-y-6">
              {sortedComments.map((comment) => (
                <div key={comment.id} className="space-y-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.user.avatar_url} />
                      <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(comment.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`h-8 ${comment.likes.includes(currentUserId) ? "text-red-500" : ""}`}
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${comment.likes.includes(currentUserId) ? "fill-current" : ""}`} />
                          {comment.likes.length}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          Reply
                        </Button>
                        {comment.replies.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8"
                            onClick={() => toggleReplies(comment.id)}
                          >
                            {expandedReplies.has(comment.id) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" /> Hide {comment.replies.length} replies
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" /> Show {comment.replies.length} replies
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="flex gap-3 mt-2 pl-4 border-l-2 border-border">
                          <Textarea 
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px]"
                          />
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => handleAddReply(comment.id)} disabled={!replyContent.trim()}>
                              Reply
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {expandedReplies.has(comment.id) && comment.replies.length > 0 && (
                        <div className="space-y-4 mt-4 pl-4 border-l-2 border-border">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reply.user.avatar_url} />
                                <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">{reply.user.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(reply.createdAt), "MMM d 'at' h:mm a")}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.content}</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={`h-6 text-xs ${reply.likes.includes(currentUserId) ? "text-red-500" : ""}`}
                                  onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                >
                                  <Heart className={`h-3 w-3 mr-1 ${reply.likes.includes(currentUserId) ? "fill-current" : ""}`} />
                                  {reply.likes.length}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-[90vh] overflow-hidden rounded-lg">
              <img src={selectedImage} alt="Full size" className="w-full h-full object-contain" />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
