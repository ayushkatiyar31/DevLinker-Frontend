import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Edit3,
  Eye,
  Heart,
  MessageCircle,
  ThumbsUp,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiRequest } from "@/lib/apiClient";
import { toast } from "sonner";
import { deleteProject, getMyProjectInterests, listMyProjects, updateProject } from "@/services/projectService";
import { projectCategories } from "@/data/options";
import { sendConnectionRequest } from "@/services/connectionService";

const metricCards = [
  {
    key: "views",
    label: "Views",
    icon: Eye,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    key: "upvotes",
    label: "Likes",
    icon: ThumbsUp,
    color: "text-green-500 bg-green-500/10",
  },
  {
    key: "interests",
    label: "Interests",
    icon: Heart,
    color: "text-pink-500 bg-pink-500/10",
  },
  {
    key: "comments",
    label: "Comments",
    icon: MessageCircle,
    color: "text-purple-500 bg-purple-500/10",
  },
];

function formatCompact(n) {
  const num = Number(n || 0);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export default function ProjectsDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const [myProjectsLoading, setMyProjectsLoading] = useState(true);
  const [myProjects, setMyProjects] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(true);
  const [interestGroups, setInterestGroups] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "AI/ML",
    teamSize: "",
    status: "active",
    techStackCsv: "",
    lookingForCsv: "",
  });

  const openEdit = (p) => {
    setEditingProject(p);
    setEditForm({
      title: p?.title || "",
      description: p?.description || "",
      category: p?.category || "AI/ML",
      teamSize: p?.teamSize || "",
      status: p?.status || "active",
      techStackCsv: Array.isArray(p?.techStack) ? p.techStack.join(", ") : "",
      lookingForCsv: Array.isArray(p?.lookingFor) ? p.lookingFor.join(", ") : "",
    });
  };

  const reloadAll = async () => {
    setLoading(true);
    setMyProjectsLoading(true);
    setInterestsLoading(true);
    setError("");

    try {
      const [dashRes, myRes, interestsRes] = await Promise.all([
        apiRequest("/project/dashboard?days=7&weeks=4", { method: "GET" }),
        listMyProjects(),
        getMyProjectInterests(),
      ]);

      setDashboard(dashRes?.data ?? dashRes ?? null);
      setMyProjects(Array.isArray(myRes) ? myRes : []);
      setInterestGroups(Array.isArray(interestsRes?.projects) ? interestsRes.projects : []);
    } catch (e) {
      setError(e?.message || "Failed to load dashboard");
      setDashboard(null);
      setMyProjects([]);
      setInterestGroups([]);
    } finally {
      setLoading(false);
      setMyProjectsLoading(false);
      setInterestsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setMyProjectsLoading(true);
        setInterestsLoading(true);
        setError("");
        const [res, mine, interestsRes] = await Promise.all([
          apiRequest("/project/dashboard?days=7&weeks=4", { method: "GET" }),
          listMyProjects(),
          getMyProjectInterests(),
        ]);
        if (!mounted) return;
        setDashboard(res?.data ?? null);
        setMyProjects(Array.isArray(mine) ? mine : []);
        setInterestGroups(Array.isArray(interestsRes?.projects) ? interestsRes.projects : []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load dashboard");
        setDashboard(null);
        setMyProjects([]);
        setInterestGroups([]);
      } finally {
        if (mounted) {
          setLoading(false);
          setMyProjectsLoading(false);
          setInterestsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const totals = dashboard?.totals || null;

  const dailyData = useMemo(() => {
    const rows = Array.isArray(dashboard?.daily) ? dashboard.daily : [];
    return rows.map((r) => ({
      name: r.date?.slice(5) || r.date,
      views: r.views || 0,
      votes: r.votes || 0,
      interests: r.interests || 0,
      comments: r.comments || 0,
      likes: r.likes || 0,
      interactions: r.interactions || 0,
    }));
  }, [dashboard]);

  const weeklyData = useMemo(() => {
    const rows = Array.isArray(dashboard?.weekly) ? dashboard.weekly : [];
    return rows.map((r) => ({
      name: r.week,
      views: r.views || 0,
      votes: r.votes || 0,
      interests: r.interests || 0,
      comments: r.comments || 0,
      likes: r.likes || 0,
      interactions: r.interactions || 0,
    }));
  }, [dashboard]);

  const topProjects = Array.isArray(dashboard?.topProjects) ? dashboard.topProjects : [];

  const isPositive = (value) => (Number(value || 0) >= 0);

  const handleSaveEdit = async () => {
    const projectId = editingProject?.id;
    if (!projectId) return;

    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    const techStack = editForm.techStackCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const lookingFor = editForm.lookingForCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateProject(projectId, {
        title: editForm.title,
        description: editForm.description,
        fullDescription: editForm.description,
        category: editForm.category,
        teamSize: editForm.teamSize,
        status: editForm.status,
        techStack,
        lookingFor,
      });

      toast.success("Project updated");
      setEditingProject(null);
      await reloadAll();
    } catch (e) {
      toast.error(e?.message || "Failed to update project");
    }
  };

  const handleDelete = async (projectId) => {
    try {
      await deleteProject(projectId);
      toast.success("Project deleted");
      await reloadAll();
    } catch (e) {
      toast.error(e?.message || "Failed to delete project");
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await sendConnectionRequest("interested", userId);
      toast.success("Connection request sent");
    } catch (e) {
      toast.error(e?.message || "Failed to send request");
    }
  };

  const handleChat = async (userId) => {
    try {
      await sendConnectionRequest("interested", userId);
    } catch {
      // ignore: request may already exist
    }
    navigate(`/messages?userId=${encodeURIComponent(String(userId))}`);
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}
                className="rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  Projects Dashboard
                </h1>
                <p className="text-muted-foreground">Track your project performance and engagement</p>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs w-fit">
            <Activity className="w-3 h-3 mr-1" />
            Last 7 days
          </Badge>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading dashboard…</div>
        ) : error ? (
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-destructive font-medium">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure backend is running and you’re logged in.
              </p>
            </CardContent>
          </Card>
        ) : !totals ? (
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-muted-foreground">No dashboard data yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {metricCards.map((m) => {
                const Icon = m.icon;
                const value = totals[m.key] ?? 0;
                return (
                  <Card key={m.key} className="glass border-border/50 hover-lift transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-3 rounded-xl", m.color)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          isPositive(value) ? "text-green-500" : "text-red-500"
                        )}>
                          {isPositive(value) ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-3xl font-bold">{formatCompact(value)}</p>
                        <p className="text-sm text-muted-foreground">{m.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="interested">Interested</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Daily Interactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Line type="monotone" dataKey="interactions" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                          <Line type="monotone" dataKey="views" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card className="glass border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Daily Breakdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={dailyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--background))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                          />
                          <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="comments" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="interests" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-6">
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Weekly Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="views" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="votes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="comments" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="interests" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interested" className="space-y-6">
                <Card className="glass border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Heart className="w-5 h-5 text-primary" />
                      People Interested In Your Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interestsLoading ? (
                      <p className="text-muted-foreground">Loading interested users…</p>
                    ) : interestGroups.filter((g) => (g?.count || 0) > 0).length === 0 ? (
                      <p className="text-muted-foreground">No one has shown interest yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {interestGroups
                          .filter((g) => (g?.count || 0) > 0)
                          .map((group) => (
                            <div key={group?.project?.id} className="rounded-xl border border-border/50 p-4">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div>
                                  <p className="font-semibold">{group?.project?.title || "Untitled"}</p>
                                  <p className="text-sm text-muted-foreground">{formatCompact(group?.count || 0)} interested</p>
                                </div>
                                <Button variant="outline" onClick={() => navigate(`/projects/${group?.project?.id}`)}>
                                  View Project
                                </Button>
                              </div>

                              <div className="mt-4 space-y-3">
                                {(Array.isArray(group?.users) ? group.users : []).map((u) => (
                                  <div
                                    key={u.id}
                                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3 rounded-xl bg-muted/20"
                                  >
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium truncate">{u.name || "User"}</p>
                                        {u.is_premium ? (
                                          <Badge variant="secondary" className="text-xs">Premium</Badge>
                                        ) : null}
                                      </div>
                                      <p className="text-sm text-muted-foreground truncate">{u.role || ""}</p>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <Button variant="outline" onClick={() => navigate(`/profile/${u.id}`)}>
                                        View Profile
                                      </Button>
                                      <Button variant="outline" onClick={() => handleSendRequest(u.id)}>
                                        Send Request
                                      </Button>
                                      <Button onClick={() => handleChat(u.id)}>Chat</Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Separator className="my-8" />

            {/* My Projects */}
            <Card className="glass border-border/50 mb-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  My Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myProjectsLoading ? (
                  <p className="text-muted-foreground">Loading your projects…</p>
                ) : myProjects.length === 0 ? (
                  <p className="text-muted-foreground">You haven’t posted any projects yet.</p>
                ) : (
                  <div className="space-y-3">
                    {myProjects.map((p) => {
                      const stats = p?.interactions || {};
                      return (
                        <div
                          key={p.id}
                          className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/projects/${p.id}`)}
                                  className="font-semibold text-left hover:underline truncate"
                                >
                                  {p.title || "Untitled"}
                                </button>
                                {p.category ? (
                                  <Badge variant="secondary" className="text-xs">{p.category}</Badge>
                                ) : null}
                                {p.status ? (
                                  <Badge variant="outline" className="text-xs capitalize">{p.status}</Badge>
                                ) : null}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {p.description || "No description"}
                              </p>

                              <div className="flex flex-wrap gap-2 mt-3 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-1">
                                  <Eye className="w-3.5 h-3.5" /> {formatCompact(p.views)} views
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <ThumbsUp className="w-3.5 h-3.5" /> {formatCompact(p.upvotesCount ?? 0)} likes
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5" /> {formatCompact(p.interestsCount)} interests
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Activity className="w-3.5 h-3.5" /> {formatCompact(stats.interactions)} interactions
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">{formatCompact(stats.views)} views</Badge>
                                <Badge variant="secondary" className="text-xs">{formatCompact(stats.votes)} votes</Badge>
                                <Badge variant="secondary" className="text-xs">{formatCompact(stats.comments)} comments</Badge>
                                <Badge variant="secondary" className="text-xs">{formatCompact(stats.likes)} likes</Badge>
                                <Badge variant="secondary" className="text-xs">{formatCompact(stats.interests)} interests</Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Button variant="outline" onClick={() => navigate(`/projects/${p.id}`)}>
                                View
                              </Button>

                              <Dialog open={editingProject?.id === p.id} onOpenChange={(open) => {
                                if (!open) setEditingProject(null);
                              }}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    onClick={() => openEdit(p)}
                                  >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Update
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Update Project</DialogTitle>
                                    <DialogDescription>
                                      Edit your project details. Title and description are required.
                                    </DialogDescription>
                                  </DialogHeader>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Title</Label>
                                      <Input
                                        value={editForm.title}
                                        onChange={(e) => setEditForm((s) => ({ ...s, title: e.target.value }))}
                                      />
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Description</Label>
                                      <Textarea
                                        rows={4}
                                        value={editForm.description}
                                        onChange={(e) => setEditForm((s) => ({ ...s, description: e.target.value }))}
                                      />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Select
                                          value={editForm.category}
                                          onValueChange={(v) => setEditForm((s) => ({ ...s, category: v }))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.isArray(projectCategories)
                                              ? projectCategories.map((c) => (
                                                  <SelectItem key={c} value={c}>
                                                    {c}
                                                  </SelectItem>
                                                ))
                                              : null}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select
                                          value={editForm.status}
                                          onValueChange={(v) => setEditForm((s) => ({ ...s, status: v }))}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Team Size</Label>
                                        <Input
                                          value={editForm.teamSize}
                                          onChange={(e) => setEditForm((s) => ({ ...s, teamSize: e.target.value }))}
                                          placeholder="e.g. 3"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Tech Stack (comma separated)</Label>
                                        <Input
                                          value={editForm.techStackCsv}
                                          onChange={(e) => setEditForm((s) => ({ ...s, techStackCsv: e.target.value }))}
                                          placeholder="React, Node, MongoDB"
                                        />
                                      </div>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Looking For (comma separated)</Label>
                                      <Input
                                        value={editForm.lookingForCsv}
                                        onChange={(e) => setEditForm((s) => ({ ...s, lookingForCsv: e.target.value }))}
                                        placeholder="UI/UX, Backend, DevOps"
                                      />
                                    </div>

                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setEditingProject(null)}>
                                        Cancel
                                      </Button>
                                      <Button onClick={handleSaveEdit}>Save</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action can’t be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(p.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Projects */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Top Projects (last few weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topProjects.length === 0 ? (
                  <p className="text-muted-foreground">No engagement yet. Views/likes/comments will appear here as people interact.</p>
                ) : (
                  <div className="space-y-3">
                    {topProjects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className="w-full text-left p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold">{p.title || "Untitled"}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatCompact(p.interactions)} interactions • {formatCompact(p.views)} views • {formatCompact(p.votes)} votes
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">{formatCompact(p.comments)} comments</Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
}
