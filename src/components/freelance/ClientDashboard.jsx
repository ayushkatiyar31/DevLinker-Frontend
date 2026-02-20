import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, CheckCircle2, Clock, DollarSign, Users, TrendingUp,
  FileText, Eye, BarChart3, ChevronRight, Plus, Crown, Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { CreateGigDialog } from "./CreateGigDialog";
import { decideGigApplication, getClientDashboard } from "@/services/freelanceService";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from "recharts";

export function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientDashboard();
      setStats(data);
    } catch (e) {
      setError(e?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postedGigs = useMemo(() => stats?.postedGigs ?? [], [stats]);
  const applicationsReceived = useMemo(() => stats?.applicationsReceived ?? [], [stats]);

  const statCards = [
    { 
      label: "Total Spent", 
      value: `$${Number(stats?.totalSpent || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500 bg-green-500/10",
      change: null
    },
    { 
      label: "Active Gigs", 
      value: stats?.activeGigs || 0,
      icon: Briefcase,
      color: "text-blue-500 bg-blue-500/10",
      change: null
    },
    { 
      label: "Completed", 
      value: stats?.completedGigs || 0,
      icon: CheckCircle2,
      color: "text-purple-500 bg-purple-500/10",
      change: "+3"
    },
    { 
      label: "Total Posted", 
      value: stats?.totalGigsPosted || 0,
      icon: FileText,
      color: "text-orange-500 bg-orange-500/10",
      change: null
    },
  ];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={refresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">No dashboard data</p>
      </div>
    );
  }

  const handleAccept = async (application) => {
    try {
      await decideGigApplication(application.gigId, application.id, "accepted");
      toast({ title: "Application accepted" });
      await refresh();
    } catch (e) {
      toast({
        title: "Failed to accept",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (application) => {
    try {
      await decideGigApplication(application.gigId, application.id, "rejected");
      toast({ title: "Application rejected" });
      await refresh();
    } catch (e) {
      toast({
        title: "Failed to reject",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Client Dashboard</h2>
          <p className="text-muted-foreground">Manage your gigs and find talent</p>
        </div>
        <CreateGigDialog
          onCreated={async () => {
            await refresh();
            setActiveTab("gigs");
          }}
          trigger={
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Post New Gig
            </Button>
          }
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label} 
              className="glass border-border/50 hover-lift transition-all animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl", stat.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {stat.change && (
                    <Badge variant="secondary" className="text-xs text-green-500">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gigs">My Gigs ({postedGigs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="freelancers">Hired</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Monthly Spending */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Monthly Spending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.monthlySpending || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                      formatter={(value) => [`$${value}`, "Amount"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Applications by Gig */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Applications by Gig
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.applicationsByGig || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="gig" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Gig Performance */}
          <Card className="glass border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Gig Performance
              </CardTitle>
              <Button variant="ghost" size="sm">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(stats.gigPerformance || []).map((item, index) => (
                  <div 
                    key={item.gig} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                    role={item.gigId ? "button" : undefined}
                    tabIndex={item.gigId ? 0 : undefined}
                    onClick={() => {
                      if (item.gigId) navigate(`/freelance/${item.gigId}`);
                    }}
                    onKeyDown={(e) => {
                      if (!item.gigId) return;
                      if (e.key === "Enter" || e.key === " ") navigate(`/freelance/${item.gigId}`);
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.gig}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {item.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {item.applications} applications
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        item.status === "open" && "border-green-500/50 text-green-500",
                        item.status === "in_progress" && "border-blue-500/50 text-blue-500",
                        item.status === "completed" && "border-muted-foreground/50 text-muted-foreground"
                      )}
                    >
                      {item.status === "open" ? "Open" : 
                       item.status === "in_progress" ? "In Progress" : "Completed"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gigs" className="space-y-4">
          {postedGigs.map((gig, index) => (
            <Card 
              key={gig.id} 
              className="glass border-border/50 hover-lift transition-all animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/freelance/${gig.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate(`/freelance/${gig.id}`);
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {gig.category}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          gig.status === "open" && "border-green-500/50 text-green-500",
                          gig.status === "in_progress" && "border-blue-500/50 text-blue-500"
                        )}
                      >
                        {gig.status === "open" ? "Open" : gig.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{gig.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {gig.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {gig.budgetType === "hourly" 
                            ? `$${gig.budgetMin}-$${gig.budgetMax}/hr` 
                            : `$${gig.budgetMin.toLocaleString()}-$${gig.budgetMax.toLocaleString()}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{gig.views} views</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{gig.applicationsCount} applications</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/freelance/${gig.id}`)}
                  >
                    Manage <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          {applicationsReceived.map((application, index) => (
            <Card 
              key={application.id} 
              className="glass border-border/50 hover-lift transition-all animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Applicant Avatar */}
                  <div className="relative shrink-0">
                    <img 
                      src={application.applicant.avatar_url}
                      alt={application.applicant.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                    />
                    {application.applicant.is_premium && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                        <Crown className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{application.applicant.name}</h4>
                      <Badge 
                        variant={
                          application.status === "accepted" ? "default" : 
                          application.status === "rejected" ? "destructive" : 
                          "secondary"
                        }
                        className="text-xs"
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {application.applicant.role} • {application.applicant.experience}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      For:{" "}
                      <button
                        type="button"
                        className="text-foreground underline-offset-2 hover:underline"
                        onClick={() => navigate(`/freelance/${application.gigId}`)}
                      >
                        {application.gig.title}
                      </button>
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {application.proposal}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <DollarSign className="w-4 h-4" />
                        <span>
                          {application.gig.budgetType === "hourly" 
                            ? `$${application.budgetQuote}/hr` 
                            : `$${application.budgetQuote.toLocaleString()}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{application.expectedDelivery}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="gradient-primary text-primary-foreground"
                      onClick={() => handleAccept(application)}
                      disabled={application.status === "accepted" || application.status === "rejected"}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(application)}
                      disabled={application.status === "accepted" || application.status === "rejected"}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/profile/${application.applicant.id}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="freelancers" className="space-y-4">
          {stats.acceptedFreelancers.length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Hired Freelancers Yet</h3>
                <p className="text-muted-foreground">
                  Review applications and hire talented freelancers for your projects!
                </p>
              </CardContent>
            </Card>
          ) : (
            stats.acceptedFreelancers.map((item, index) => (
              <Card 
                key={`${item.freelancer.id}-${item.gig.id}`} 
                className="glass border-border/50 border-l-4 border-l-green-500 hover-lift transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img 
                        src={item.freelancer.avatar_url}
                        alt={item.freelancer.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-green-500/50"
                      />
                      {item.freelancer.is_premium && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                          <Crown className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{item.freelancer.name}</h4>
                        <div className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">4.9</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.freelancer.role} • {item.freelancer.experience}
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant="secondary">{item.gig.title}</Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-primary font-semibold">
                          ${item.budget.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Button size="sm">
                      Message <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
