import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, CheckCircle2, Clock, DollarSign, Star, TrendingUp,
  FileText, Bookmark, ArrowUpRight, Target, Award, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFreelancerDashboard } from "@/services/freelanceService";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

export function FreelancerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFreelancerDashboard();
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

  const applications = useMemo(() => stats?.applications ?? [], [stats]);
  const savedGigs = useMemo(() => stats?.savedGigs ?? [], [stats]);

  const statCards = [
    { 
      label: "Total Earnings", 
      value: `$${Number(stats?.totalEarnings || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-500 bg-green-500/10",
      change: "+12%"
    },
    { 
      label: "Active Projects", 
      value: stats?.activeProjects || 0,
      icon: Briefcase,
      color: "text-blue-500 bg-blue-500/10",
      change: null
    },
    { 
      label: "Completed", 
      value: stats?.completedProjects || 0,
      icon: CheckCircle2,
      color: "text-purple-500 bg-purple-500/10",
      change: "+2"
    },
    { 
      label: "Success Rate", 
      value: `${stats?.successRate || 0}%`,
      icon: Target,
      color: "text-orange-500 bg-orange-500/10",
      change: "+3%"
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

  return (
    <div className="space-y-6">
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

      {/* Rating Card */}
      <Card className="glass border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-yellow-500/10">
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-3xl font-bold">{stats.avgRating || 0}</p>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star}
                  className={cn(
                    "w-6 h-6",
                    star <= Math.floor(stats.avgRating || 0)
                      ? "text-yellow-500 fill-yellow-500" 
                      : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applied">Applied ({applications.length})</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Applications Chart */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Weekly Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={stats.weeklyApplications || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="applications" 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Breakdown */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie
                        data={stats.applicationsByStatus || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {(stats.applicationsByStatus || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {(stats.applicationsByStatus || []).map((item) => (
                      <div key={item.status} className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.status}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applied" className="space-y-4">
          <div className="grid gap-4">
            {applications.map((application, index) => (
              <Card 
                key={application.id} 
                className="glass border-border/50 hover-lift transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/freelance/${application.gigId}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(`/freelance/${application.gigId}`);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant={
                            application.status === "accepted" ? "default" : 
                            application.status === "rejected" ? "destructive" : 
                            "secondary"
                          }
                          className="text-xs"
                        >
                          {application.status === "accepted" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {application.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Applied {Math.floor((Date.now() - new Date(application.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d ago
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{application.gig.title}</h3>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/freelance/${application.gigId}`);
                      }}
                    >
                      <ArrowUpRight className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {applications.filter(app => app.status === "accepted").length === 0 ? (
            <Card className="glass border-border/50">
              <CardContent className="p-12 text-center">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No Accepted Gigs Yet</h3>
                <p className="text-muted-foreground">
                  Keep applying to gigs and your accepted work will appear here!
                </p>
              </CardContent>
            </Card>
          ) : (
            applications.filter(app => app.status === "accepted").map((application, index) => (
              <Card 
                key={application.id} 
                className="glass border-border/50 border-l-4 border-l-green-500 hover-lift transition-all animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/freelance/${application.gigId}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate(`/freelance/${application.gigId}`);
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Badge className="mb-2 bg-green-500/10 text-green-500 border-green-500/30">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                      <h3 className="font-semibold text-lg mb-1">{application.gig.title}</h3>
                      {application.gig?.owner?.name && (
                        <div className="flex items-center gap-2 mt-2">
                          <img 
                            src={application.gig.owner.avatar_url} 
                            alt={application.gig.owner.name}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm text-muted-foreground">
                            Client: {application.gig.owner.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/freelance/${application.gigId}`);
                      }}
                    >
                      View Project <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          {savedGigs.map((gig, index) => (
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
                          gig.status === "open" && "border-green-500/50 text-green-500"
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
                        <Clock className="w-4 h-4" />
                        <span>{gig.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/freelance/${gig.id}`);
                        }}
                      >
                      <Bookmark className="w-5 h-5 fill-primary text-primary" />
                    </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/freelance/${gig.id}`);
                        }}
                      >
                      Apply <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
