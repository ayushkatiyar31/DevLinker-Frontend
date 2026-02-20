import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteDiscussPost, listDiscussPosts, updateDiscussPost } from "@/services/discussService";
import { getBackendOrigin } from "@/lib/apiClient";

const DISCUSS_CATEGORIES = ["General", "Questions", "News", "Help"];

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function MyDiscussions() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", content: "", category: "General", tags: "", links: "" });
  const [removeImages, setRemoveImages] = useState([]);
  const [removeAttachments, setRemoveAttachments] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const posts = useMemo(() => res?.data ?? [], [res]);
  const hasMore = Boolean(res?.hasMore);

  const load = async (nextPage = page) => {
    if (!profile?.id) return;

    setLoading(true);
    setError("");
    try {
      const out = await listDiscussPosts({ page: nextPage, limit: 20, sort: "new", authorId: profile.id });
      setRes(out);
      setPage(nextPage);
    } catch (err) {
      setError(err?.message || "Failed to load your posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const openEdit = (post) => {
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
    setEditOpen(true);
  };

  const save = async () => {
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

    setSaving(true);
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
      setEditOpen(false);
      setEditingPost(null);
      await load(page);
    } catch (err) {
      toast.error(err?.message || "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (postId) => {
    const ok = window.confirm("Delete this post? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteDiscussPost(postId);
      toast.success("Post deleted");
      await load(1);
    } catch (err) {
      toast.error(err?.message || "Failed to delete post");
    }
  };

  const backendOrigin = getBackendOrigin();

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold mt-2">My Discussions</h1>
            <p className="text-muted-foreground">All posts created by you.</p>
          </div>
          <Link to="/discuss">
            <Button variant="outline">Go to Discuss</Button>
          </Link>
        </div>

        {loading ? (
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">You have not created any posts yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <Card
                key={p.id}
                className="glass border-border/50 hover-lift transition-all cursor-pointer"
                onClick={(e) => {
                  const target = e.target;
                  if (target instanceof Element && target.closest("button,a")) return;
                  navigate(`/discuss/${p.id}`);
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{p.title}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium">{p.category || "General"}</span>
                        {p.createdAt ? ` • ${formatDateTime(p.createdAt)}` : ""}
                        {typeof p.voteCount === "number" ? ` • ${p.voteCount} votes` : ""}
                        {typeof p.commentsCount === "number" ? ` • ${p.commentsCount} comments` : ""}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/40 hover:bg-destructive hover:text-destructive-foreground gap-2"
                        onClick={() => remove(p.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.content}</p>
                </CardContent>
              </Card>
            ))}

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => load(page - 1)}>
                Previous
              </Button>
              <p className="text-sm text-muted-foreground">Page {page}</p>
              <Button variant="outline" disabled={!hasMore} onClick={() => load(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
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

              <Button className="w-full gradient-primary" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
