import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowBigUp, MessageSquarePlus, MessagesSquare, Search, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createDiscussPost, listDiscussPosts, voteDiscussPost } from "@/services/discussService";
import { getBackendOrigin } from "@/lib/apiClient";

const CATEGORIES = ["General", "Questions", "News", "Help"];

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function Discussions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postsRes, setPostsRes] = useState(null);

  const [sort, setSort] = useState("new");
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "", category: "General", links: "" });
  const [images, setImages] = useState([]);
  const [files, setFiles] = useState([]);

  const imagePreviews = useMemo(() => {
    return (images || []).map((f) => ({
      name: f?.name || "image",
      url: f ? URL.createObjectURL(f) : "",
    }));
  }, [images]);

  useEffect(() => {
    return () => {
      (imagePreviews || []).forEach((p) => {
        if (p?.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [imagePreviews]);

  const posts = useMemo(() => postsRes?.data ?? [], [postsRes]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listDiscussPosts({
        page: 1,
        limit: 20,
        sort,
        category: category === "all" ? "" : category,
        q: q.trim(),
      });
      setPostsRes(res);
    } catch (err) {
      setError(err?.message || "Failed to load discussions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category]);

  const handleCreate = async () => {
    const title = String(form.title || "").trim();
    const content = String(form.content || "").trim();
    const tags = String(form.tags || "").trim();
    const selectedCategory = String(form.category || "General").trim() || "General";

    const links = String(form.links || "")
      .split(/\r?\n/)
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 5)
      .map((url) => ({ url }));

    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }

    setCreating(true);
    try {
      await createDiscussPost({
        title,
        content,
        tags,
        category: selectedCategory,
        links,
        images,
        files,
      });
      toast.success("Posted!");
      setForm({ title: "", content: "", tags: "", category: "General", links: "" });
      setImages([]);
      setFiles([]);
      setCreateOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (postId) => {
    try {
      const res = await voteDiscussPost(postId);
      setPostsRes((prev) => {
        if (!prev?.data) return prev;
        const next = {
          ...prev,
          data: prev.data.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  voteCount: res?.voteCount ?? p.voteCount,
                  viewerVote: res?.viewerVote ?? p.viewerVote,
                }
              : p
          ),
        };
        return next;
      });
    } catch (err) {
      toast.error(err?.message || "Failed to vote");
    }
  };

  const backendOrigin = getBackendOrigin();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessagesSquare className="w-6 h-6 text-primary" />
              Discuss
            </h1>
            <p className="text-muted-foreground">Ask questions, share progress, and help others.</p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create a discussion post</DialogTitle>
                <DialogDescription>Keep it clear and helpful.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g., How to prepare for React interviews?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
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
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    placeholder="Write your post..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tags (optional)</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
                    placeholder="comma-separated, e.g. react, node, career"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Links (optional)</Label>
                  <Textarea
                    value={form.links}
                    onChange={(e) => setForm((p) => ({ ...p, links: e.target.value }))}
                    placeholder="One URL per line"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">We’ll show a simple preview in the post.</p>
                </div>

                <div className="space-y-2">
                  <Label>Upload images (max 5)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const list = Array.from(e.target.files || []).slice(0, 5);
                      setImages(list);
                    }}
                  />
                </div>

                {images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {imagePreviews.map((p, idx) => (
                        <div key={`${p.url}-${idx}`} className="space-y-1">
                          <img
                            src={p.url}
                            alt={p.name}
                            className="rounded-md border border-border/50 object-cover w-full h-24"
                            loading="lazy"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Attach files (PDF/DOC/etc. max 3)</Label>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const list = Array.from(e.target.files || []).slice(0, 3);
                      setFiles(list);
                    }}
                  />
                </div>

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Selected attachments</p>
                    <div className="space-y-2">
                      {files.map((f, idx) => (
                        <div key={`${f?.name || "file"}-${idx}`} className="flex items-center justify-between gap-2">
                          <p className="text-sm text-muted-foreground truncate flex-1">{f?.name || "file"}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleCreate} disabled={creating} className="w-full gradient-primary">
                  <Send className="w-4 h-4 mr-2" />
                  {creating ? "Posting..." : "Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 flex gap-2">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts..." />
            <Button
              variant="outline"
              onClick={() => load()}
              className="gap-2"
              title="Search"
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>

          <div className="flex gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Newest</SelectItem>
                <SelectItem value="top">Most voted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
          </div>
        ) : error ? (
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="glass border-border/50">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No posts yet. Be the first to start a discussion.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card
                key={post.id}
                className="glass border-border/50 hover-lift transition-all cursor-pointer"
                role="link"
                tabIndex={0}
                onClick={(e) => {
                  const target = e.target;
                  if (!(target instanceof Element)) {
                    navigate(`/discuss/${post.id}`);
                    return;
                  }

                  // Don't navigate when interacting with buttons/links/inputs.
                  if (target.closest("button,a,input,textarea,select")) return;

                  navigate(`/discuss/${post.id}`);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/discuss/${post.id}`);
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg">{post.title}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{post.category || "General"}</span>
                        {post.createdAt ? ` • ${formatDateTime(post.createdAt)}` : ""}
                      </div>
                    </div>

                    <Button
                      variant={post.viewerVote ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote(post.id);
                      }}
                    >
                      <ArrowBigUp className="w-4 h-4" />
                      {post.voteCount ?? 0}
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {(post.tags || []).slice(0, 6).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>

                  {(post.links || []).length > 0 && (
                    <div className="space-y-1">
                      {(post.links || []).slice(0, 2).map((l) => (
                        <a
                          key={l.url}
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary hover:underline block truncate"
                        >
                          {l.title || l.url}
                        </a>
                      ))}
                    </div>
                  )}

                  {(post.images || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(post.images || []).slice(0, 3).map((img) => (
                        <img
                          key={img.url}
                          src={`${backendOrigin}${img.url}`}
                          alt={img.originalName || "image"}
                          className="rounded-md border border-border/50 object-cover w-full h-24"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author?.name ? `By ${post.author.name}` : ""}</span>
                    <span>{(post.commentsCount ?? 0)} comments</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
