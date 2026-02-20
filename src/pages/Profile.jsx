import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileStrengthMeter } from "@/components/profile/ProfileStrengthMeter";
import { 
  Edit, Camera, MapPin, Briefcase, Github, Linkedin, Globe, Check, X,
  Eye, Share2, Crown, Shield, ExternalLink, Sparkles, Star, Zap, Heart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteDiscussPost, listDiscussPosts, updateDiscussPost } from "@/services/discussService";
import { getBackendOrigin, resolveBackendAssetUrl } from "@/lib/apiClient";

const DISCUSS_CATEGORIES = ["General", "Questions", "News", "Help"];

const allSkills = [
  "React", "TypeScript", "Node.js", "Python", "Go", "Rust", 
  "AWS", "Docker", "Kubernetes", "GraphQL", "PostgreSQL", "MongoDB",
  "Vue.js", "Angular", "Next.js", "TailwindCSS", "Figma", "UI/UX"
];

const Profile = () => {
  const { profile, updateProfile, uploadProfilePhoto, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile || {});
  const [previewMode, setPreviewMode] = useState(false);

  const fileInputRef = useRef(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [myDiscussRes, setMyDiscussRes] = useState(null);
  const [myDiscussLoading, setMyDiscussLoading] = useState(false);
  const [myDiscussError, setMyDiscussError] = useState("");

  const [editPostOpen, setEditPostOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", category: "General", tags: "", links: "" });
  const [savingPost, setSavingPost] = useState(false);
  const [removeImages, setRemoveImages] = useState([]);
  const [removeAttachments, setRemoveAttachments] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);

  if (loading || !profile) {
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

  const displayProfile = previewMode ? editedProfile : (isEditing ? editedProfile : profile);

  const loadMyDiscussions = async () => {
    if (!profile?.id) return;
    setMyDiscussLoading(true);
    setMyDiscussError("");
    try {
      const res = await listDiscussPosts({ page: 1, limit: 50, sort: "new", authorId: profile.id });
      setMyDiscussRes(res);
    } catch (err) {
      setMyDiscussError(err?.message || "Failed to load your discussions");
    } finally {
      setMyDiscussLoading(false);
    }
  };

  useEffect(() => {
    loadMyDiscussions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleSave = async () => {
    await updateProfile(editedProfile);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  const openPhotoPicker = () => {
    if (!isEditing) return;
    if (photoUploading) return;
    fileInputRef.current?.click();
  };

  const onPhotoSelected = async (e) => {
    const file = e.target.files?.[0];
    // allow selecting the same file again later
    e.target.value = "";
    if (!file) return;

    if (!String(file.type || "").startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setPhotoUploading(true);
    try {
      const res = await uploadProfilePhoto(file);
      const newUrl = res?.data?.photoUrl;
      if (newUrl) {
        setEditedProfile((prev) => ({ ...prev, avatar_url: newUrl }));
      }
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err?.message || "Failed to upload photo");
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  const toggleSkill = (skill) => {
    const currentSkills = editedProfile.skills || [];
    if (currentSkills.includes(skill)) {
      setEditedProfile({ ...editedProfile, skills: currentSkills.filter((s) => s !== skill) });
    } else {
      setEditedProfile({ ...editedProfile, skills: [...currentSkills, skill] });
    }
  };

  const myPosts = myDiscussRes?.data ?? [];
  const myPostsCountLabel = myDiscussRes?.hasMore ? `${myPosts.length}+` : `${myPosts.length}`;

  const openEditPost = (post) => {
    setEditingPost(post);
    setEditForm({
      title: post?.title || "",
      content: post?.content || "",
      category: post?.category || "General",
      tags: Array.isArray(post?.tags) ? post.tags.join(", ") : "",
      links: Array.isArray(post?.links) ? post.links.map((l) => l?.url).filter(Boolean).join("\n") : "",
    });
    setRemoveImages([]);
    setRemoveAttachments([]);
    setNewImages([]);
    setNewFiles([]);
    setEditPostOpen(true);
  };

  const saveEditedPost = async () => {
    if (!editingPost?.id) return;
    const title = String(editForm.title || "").trim();
    const content = String(editForm.content || "").trim();
    const category = String(editForm.category || "General").trim() || "General";
    const tags = String(editForm.tags || "").trim();

    const links = String(editForm.links || "")
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 5)
      .map((url) => ({ url }));

    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }

    setSavingPost(true);
    try {
      await updateDiscussPost(editingPost.id, {
        title,
        content,
        category,
        tags,
        links,
        removeImages,
        removeAttachments,
        newImages,
        newFiles,
      });
      toast.success("Post updated");
      setEditPostOpen(false);
      setEditingPost(null);
      await loadMyDiscussions();
    } catch (err) {
      toast.error(err?.message || "Failed to update post");
    } finally {
      setSavingPost(false);
    }
  };

  const backendOrigin = getBackendOrigin();

  const handleDeletePost = async (postId) => {
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteDiscussPost(postId);
      toast.success("Post deleted");
      await loadMyDiscussions();
    } catch (err) {
      toast.error(err?.message || "Failed to delete post");
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto pb-8">
        {previewMode && (
          <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2"><Eye className="w-5 h-5 text-primary" /><span className="font-medium">Preview Mode</span></div>
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)}><X className="w-4 h-4 mr-2" />Exit</Button>
          </div>
        )}

        <div className="glass rounded-3xl overflow-hidden animate-scale-in">
          <div className="relative">
            <div className="h-32 rounded-t-2xl gradient-primary relative overflow-hidden">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/10 blur-2xl animate-pulse" />
            </div>
            <div className="flex justify-center -mt-16 relative z-10">
              <div className="relative group">
                <img src={resolveBackendAssetUrl(displayProfile.avatar_url) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} alt={displayProfile.name} className="relative w-32 h-32 rounded-2xl border-4 border-background object-cover shadow-2xl bg-muted" />
                {profile.is_premium && (<div className="absolute -top-3 -right-3 animate-bounce" style={{ animationDuration: '2s' }}><Badge className="gradient-primary gap-1 shadow-lg"><Crown className="w-3 h-3" />Premium</Badge></div>)}
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={openPhotoPicker}
                      disabled={photoUploading}
                      className={cn(
                        "absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg",
                        photoUploading && "opacity-60 cursor-not-allowed"
                      )}
                      aria-label="Change profile photo"
                      title={photoUploading ? "Uploading..." : "Change photo"}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onPhotoSelected}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 px-6 pb-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{displayProfile.name}</h1>
              <p className="text-primary font-medium mt-1">{displayProfile.role}</p>
              <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
                {displayProfile.experience && <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50"><Briefcase className="w-3.5 h-3.5" />{displayProfile.experience}</span>}
                {displayProfile.location && <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50"><MapPin className="w-3.5 h-3.5" />{displayProfile.location}</span>}
              </div>
              <div className="mt-4"><Badge variant="secondary" className={cn("px-4 py-1.5", displayProfile.availability === "Available" && "bg-green-500/10 text-green-500")}>{displayProfile.availability}</Badge></div>
            </div>

            {!previewMode && (
              <div className="flex gap-3 justify-center mb-6">
                <Button variant={isEditing ? "outline" : "default"} className={!isEditing ? "gradient-primary" : ""} onClick={() => isEditing ? handleSave() : (setEditedProfile(profile), setIsEditing(true))}>
                  {isEditing ? <><Check className="w-4 h-4 mr-2" />Save</> : <><Edit className="w-4 h-4 mr-2" />Edit</>}
                </Button>
                {isEditing && <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>}
                {!isEditing && (<><Button variant="outline" onClick={() => setPreviewMode(true)}><Eye className="w-4 h-4 mr-2" />Preview</Button><Button variant="outline" onClick={handleShare}><Share2 className="w-4 h-4 mr-2" />Share</Button></>)}
              </div>
            )}

            <ProfileStrengthMeter profile={displayProfile} />

            <Tabs defaultValue="about" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-3 mb-6"><TabsTrigger value="about">About</TabsTrigger><TabsTrigger value="skills">Skills</TabsTrigger><TabsTrigger value="links">Links</TabsTrigger></TabsList>
              <TabsContent value="about" className="space-y-6">
                <div className="p-5 rounded-2xl glass border border-border/50">
                  <Label className="text-muted-foreground text-sm">Bio</Label>
                  {isEditing ? <Textarea value={editedProfile.bio || ""} onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })} rows={4} className="mt-3" /> : <p className="mt-3">{displayProfile.bio || "No bio yet"}</p>}
                </div>
              </TabsContent>
              <TabsContent value="skills" className="space-y-4">
                <div className="p-5 rounded-2xl glass border border-border/50">
                  <Label className="text-muted-foreground text-sm mb-4 block">{isEditing ? "Select your skills" : "Skills"}</Label>
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? allSkills : (displayProfile.skills || [])).map((skill) => (
                      <Badge key={skill} variant={isEditing ? (editedProfile.skills?.includes(skill) ? "default" : "outline") : "secondary"} className={cn("cursor-pointer", isEditing && editedProfile.skills?.includes(skill) && "gradient-primary")} onClick={() => isEditing && toggleSkill(skill)}>{skill}</Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="links" className="space-y-4">
                <div className="p-4 rounded-2xl glass border border-border/50">
                  <div className="flex items-center gap-3"><Github className="w-5 h-5" /><div className="flex-1"><Label className="text-muted-foreground text-sm">GitHub</Label>
                  {isEditing ? <Input value={editedProfile.github || ""} onChange={(e) => setEditedProfile({ ...editedProfile, github: e.target.value })} className="mt-1" /> : displayProfile.github ? <a href={displayProfile.github} target="_blank" className="text-primary hover:underline flex items-center gap-1 mt-1">{displayProfile.github.replace('https://github.com/', '@')}<ExternalLink className="w-3 h-3" /></a> : <p className="text-muted-foreground text-sm mt-1">Not added</p>}</div></div>
                </div>
                <div className="p-4 rounded-2xl glass border border-border/50">
                  <div className="flex items-center gap-3"><Linkedin className="w-5 h-5 text-[#0077B5]" /><div className="flex-1"><Label className="text-muted-foreground text-sm">LinkedIn</Label>
                  {isEditing ? <Input value={editedProfile.linkedin || ""} onChange={(e) => setEditedProfile({ ...editedProfile, linkedin: e.target.value })} className="mt-1" /> : displayProfile.linkedin ? <a href={displayProfile.linkedin} target="_blank" className="text-[#0077B5] hover:underline flex items-center gap-1 mt-1">LinkedIn Profile<ExternalLink className="w-3 h-3" /></a> : <p className="text-muted-foreground text-sm mt-1">Not added</p>}</div></div>
                </div>
                <div className="p-4 rounded-2xl glass border border-border/50">
                  <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-primary" /><div className="flex-1"><Label className="text-muted-foreground text-sm">Portfolio</Label>
                  {isEditing ? <Input value={editedProfile.portfolio || ""} onChange={(e) => setEditedProfile({ ...editedProfile, portfolio: e.target.value })} className="mt-1" /> : displayProfile.portfolio ? <a href={displayProfile.portfolio} target="_blank" className="text-primary hover:underline flex items-center gap-1 mt-1">{displayProfile.portfolio.replace(/^https?:\/\//, '')}<ExternalLink className="w-3 h-3" /></a> : <p className="text-muted-foreground text-sm mt-1">Not added</p>}</div></div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-5 rounded-2xl glass border border-border/50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">My Discussions</h3>
                  <p className="text-sm text-muted-foreground">
                    Posts by you: <span className="font-medium text-foreground">{myDiscussLoading ? "..." : myPostsCountLabel}</span>
                  </p>
                </div>
                <Link to="/my-discussions">
                  <Button variant="outline" size="sm">View all</Button>
                </Link>
              </div>

              {myDiscussError ? (
                <p className="text-sm text-destructive mt-3">{myDiscussError}</p>
              ) : myDiscussLoading ? (
                <p className="text-sm text-muted-foreground mt-3">Loading your posts...</p>
              ) : myPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-3">You haven’t created any discussion posts yet.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {myPosts.slice(0, 10).map((p) => (
                    <div key={p.id} className="rounded-xl border border-border/50 p-4 bg-muted/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.category || "General"} • {p.voteCount ?? 0} votes • {p.commentsCount ?? 0} comments
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditPost(p)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive/40 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeletePost(p.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Dialog open={editPostOpen} onOpenChange={setEditPostOpen}>
              <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit discussion post</DialogTitle>
                  <DialogDescription>Update your post and manage links/uploads.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={editForm.category} onValueChange={(v) => setEditForm((p) => ({ ...p, category: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DISCUSS_CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm((p) => ({ ...p, content: e.target.value }))}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tags (optional)</Label>
                    <Input
                      value={editForm.tags}
                      onChange={(e) => setEditForm((p) => ({ ...p, tags: e.target.value }))}
                      placeholder="comma-separated, e.g. react, node"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Links (optional)</Label>
                    <Textarea
                      value={editForm.links}
                      onChange={(e) => setEditForm((p) => ({ ...p, links: e.target.value }))}
                      placeholder="One URL per line"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Add new images (optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).slice(0, 5);
                        setNewImages(files);
                      }}
                    />
                    {newImages.length > 0 && (
                      <p className="text-xs text-muted-foreground">Selected {newImages.length} image(s)</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Add new attachments (optional)</Label>
                    <Input
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).slice(0, 3);
                        setNewFiles(files);
                      }}
                    />
                    {newFiles.length > 0 && (
                      <p className="text-xs text-muted-foreground">Selected {newFiles.length} file(s)</p>
                    )}
                  </div>

                  {editingPost && (
                    <div className="space-y-3">
                      {(editingPost.images || []).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Current images</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(editingPost.images || []).map((img) => (
                              <div key={img.url} className="space-y-1">
                                <img
                                  src={`${backendOrigin}${img.url}`}
                                  alt={img.originalName || "image"}
                                  className={`rounded-md border border-border/50 object-cover w-full h-24 ${
                                    removeImages.includes(img.url) ? "opacity-40" : ""
                                  }`}
                                  loading="lazy"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="w-full"
                                  onClick={() =>
                                    setRemoveImages((prev) =>
                                      prev.includes(img.url) ? prev.filter((u) => u !== img.url) : [...prev, img.url]
                                    )
                                  }
                                >
                                  {removeImages.includes(img.url) ? "Undo remove" : "Remove"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(editingPost.attachments || []).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Current attachments</p>
                          <div className="space-y-1">
                            {(editingPost.attachments || []).map((f) => (
                              <div key={f.url} className="flex items-center justify-between gap-2">
                                <a
                                  href={`${backendOrigin}${f.url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`text-sm text-primary hover:underline block truncate flex-1 ${
                                    removeAttachments.includes(f.url) ? "opacity-40" : ""
                                  }`}
                                >
                                  {f.originalName || f.url}
                                </a>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setRemoveAttachments((prev) =>
                                      prev.includes(f.url) ? prev.filter((u) => u !== f.url) : [...prev, f.url]
                                    )
                                  }
                                >
                                  {removeAttachments.includes(f.url) ? "Undo" : "Remove"}
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Links (optional)</Label>
                    <Textarea
                      value={editForm.links}
                      onChange={(e) => setEditForm((p) => ({ ...p, links: e.target.value }))}
                      placeholder="One URL per line"
                      rows={3}
                    />
                  </div>

                  {editingPost && (
                    <div className="space-y-3">
                      {(editingPost.images || []).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Current images</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(editingPost.images || []).map((img) => (
                              <img
                                key={img.url}
                                src={`${backendOrigin}${img.url}`}
                                alt={img.originalName || "image"}
                                className="rounded-md border border-border/50 object-cover w-full h-24"
                                loading="lazy"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {(editingPost.attachments || []).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Current attachments</p>
                          <div className="space-y-1">
                            {(editingPost.attachments || []).map((f) => (
                              <a
                                key={f.url}
                                href={`${backendOrigin}${f.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary hover:underline block truncate"
                              >
                                {f.originalName || f.url}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <Button className="w-full gradient-primary" onClick={saveEditedPost} disabled={savingPost}>
                    {savingPost ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {!profile.is_premium && (
              <div className="mt-8 p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center"><Crown className="w-6 h-6 text-primary-foreground" /></div>
                  <div className="flex-1"><h3 className="font-semibold">Who viewed your profile?</h3><p className="text-sm text-muted-foreground">Upgrade to see who's interested</p></div>
                  <Button className="gradient-primary"><Zap className="w-4 h-4 mr-2" />Upgrade</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
