import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowBigUp, ArrowLeft, Flag, MessageCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { addDiscussComment, getDiscussPost, reportDiscussComment, reportDiscussPost, voteDiscussPost } from "@/services/discussService";
import { getBackendOrigin } from "@/lib/apiClient";

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
}

export default function DiscussionDetail() {
  const { postId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [res, setRes] = useState(null);

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const post = useMemo(() => res?.data ?? null, [res]);
  const comments = useMemo(() => res?.comments ?? [], [res]);

  const backendOrigin = getBackendOrigin();

  const load = async () => {
    if (!postId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getDiscussPost(postId);
      setRes(data);
    } catch (err) {
      setError(err?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const submitComment = async () => {
    const content = String(comment || "").trim();
    if (!content) {
      toast.error("Write a comment first");
      return;
    }

    setSubmitting(true);
    try {
      await addDiscussComment(postId, { content });
      setComment("");
      toast.success("Comment added");
      await load();
    } catch (err) {
      toast.error(err?.message || "Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async () => {
    try {
      const out = await voteDiscussPost(postId);
      setRes((prev) => {
        if (!prev?.data) return prev;
        return {
          ...prev,
          data: {
            ...prev.data,
            voteCount: out?.voteCount ?? prev.data.voteCount,
            viewerVote: out?.viewerVote ?? prev.data.viewerVote,
          },
        };
      });
    } catch (err) {
      toast.error(err?.message || "Failed to vote");
    }
  };

  const handleReportPost = async () => {
    try {
      await reportDiscussPost(postId, { reason: "" });
      toast.success("Reported. Thanks for helping keep the community safe.");
    } catch (err) {
      toast.error(err?.message || "Failed to report");
    }
  };

  const handleReportComment = async (commentId) => {
    try {
      await reportDiscussComment(commentId, { reason: "" });
      toast.success("Reported");
    } catch (err) {
      toast.error(err?.message || "Failed to report");
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-none px-4 py-8">
        <div className="mb-6">
          <Link to="/discuss" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Discuss
          </Link>
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
        ) : !post ? (
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Post not found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="glass border-border/50 mb-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-2xl">{post.title}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">{post.category || "General"}</span>
                      {post.author?.name ? ` • By ${post.author.name}` : ""}
                      {post.createdAt ? ` • ${formatDateTime(post.createdAt)}` : ""}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={post.viewerVote ? "default" : "outline"}
                      size="sm"
                      className="gap-2"
                      onClick={handleVote}
                    >
                      <ArrowBigUp className="w-4 h-4" />
                      {post.voteCount ?? 0}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={handleReportPost}>
                      <Flag className="w-4 h-4" />
                      Report
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(post.tags || []).slice(0, 10).map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{post.content}</p>

                {(post.links || []).length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-medium">Links</p>
                    <div className="space-y-1">
                      {(post.links || []).map((l) => (
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
                  </div>
                )}

                {(post.images || []).length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-medium">Images</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(post.images || []).map((img) => (
                        <img
                          key={img.url}
                          src={`${backendOrigin}${img.url}`}
                          alt={img.originalName || "image"}
                          className="rounded-md border border-border/50 object-cover w-full h-28"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(post.attachments || []).length > 0 && (
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-medium">Attachments</p>
                    <div className="space-y-1">
                      {(post.attachments || []).map((f) => (
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
              </CardContent>
            </Card>

            <Card className="glass border-border/50 mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Add a comment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Write your comment..."
                />
                <Button className="gradient-primary" onClick={submitComment} disabled={submitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Posting..." : "Post Comment"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {comments.length === 0 ? (
                <Card className="glass border-border/50">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">No comments yet.</p>
                  </CardContent>
                </Card>
              ) : (
                comments.map((c) => (
                  <Card key={c.id} className="glass border-border/50">
                    <CardContent className="p-6 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{c.author?.name ? `By ${c.author.name}` : ""}</span>
                        <span className="flex items-center gap-2">
                          {c.createdAt ? formatDateTime(c.createdAt) : ""}
                          <button
                            type="button"
                            onClick={() => handleReportComment(c.id)}
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            title="Report comment"
                          >
                            <Flag className="w-3 h-3" />
                            Report
                          </button>
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{c.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
