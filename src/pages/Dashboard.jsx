import { useEffect, useMemo, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, Users, MessageCircle, Heart, TrendingUp, TrendingDown, 
  Crown, ArrowUpRight, Clock, BarChart3, PieChart, Activity,
  Target, Zap, ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/services/dashboardService";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart as RePieChart, Pie, Cell 
} from "recharts";

const statIcons = {
  "Profile Views": Eye,
  "Connections": Users,
  "Messages": MessageCircle,
  "Interests Received": Heart,
};

const statColors = {
  "Profile Views": "text-blue-500 bg-blue-500/10",
  "Connections": "text-green-500 bg-green-500/10",
  "Messages": "text-purple-500 bg-purple-500/10",
  "Interests Received": "text-pink-500 bg-pink-500/10",
};

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Dashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    getDashboardStats()
      .then((data) => {
        if (cancelled) return;
        setDashboard(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Failed to load dashboard");
        setDashboard(null);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatTime = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const safeDashboard = useMemo(() => {
    const safeMatchRate =
      dashboard?.matchRate && typeof dashboard.matchRate === "object"
        ? dashboard.matchRate
        : { percentage: 0, weeklyChange: 0, matched: 0, sent: 0 };

    const safeResponseRate =
      dashboard?.responseRate && typeof dashboard.responseRate === "object"
        ? dashboard.responseRate
        : {
            percentage: 0,
            avgResponseTime: "N/A",
            responded: 0,
            received: 0,
          };

    return {
      stats: dashboard?.stats ?? [],
      weeklyActivity: dashboard?.weeklyActivity ?? [],
      monthlyGrowth: dashboard?.monthlyGrowth ?? [],
      recentActivity: (dashboard?.recentActivity ?? []).map((a) => ({
        ...a,
        time: formatTime(a.time),
      })),
      topSkillsViewed: dashboard?.topSkillsViewed ?? [],
      profileViewers: dashboard?.profileViewers ?? [],
      matchRate: safeMatchRate,
      responseRate: safeResponseRate,
      peakHours: dashboard?.peakHours ?? [],
    };
  }, [dashboard]);

  const { stats, weeklyActivity, monthlyGrowth, recentActivity, topSkillsViewed, profileViewers, matchRate, responseRate, peakHours } = safeDashboard;

  return (
    <MainLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">Track your profile performance and engagement</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              Last 30 days
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = statIcons[stat.label] || Eye;
            const colorClass = statColors[stat.label] || "text-primary bg-primary/10";
            const isPositive = stat.change >= 0;
            
            return (
              <Card key={stat.label} className="glass border-border/50 hover-lift transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      isPositive ? "text-green-500" : "text-red-500"
                    )}>
                      {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isPositive ? "+" : ""}{stat.change}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                  <div className="mt-4 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={(stat.trend || []).map((v) => ({ value: v }))}>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary) / 0.2)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="viewers">Who Viewed You</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Weekly Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weeklyActivity}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="connections" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="messages" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Growth Chart */}
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Growth Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--background))", 
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }} 
                      />
                      <Line type="monotone" dataKey="connections" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                      <Line type="monotone" dataKey="matches" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-2))" }} />
                      <Line type="monotone" dataKey="views" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-3))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="glass border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <Button variant="ghost" size="sm">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                      <img 
                        src={activity.avatar} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.text}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viewers" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Profile Viewers */}
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Recent Profile Viewers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profileViewers.map((viewer, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="relative">
                          <img 
                            src={viewer.profile.avatar_url} 
                            alt={viewer.profile.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-border"
                          />
                          {viewer.profile.is_premium && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                              <Crown className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{viewer.profile.name}</p>
                          <p className="text-sm text-muted-foreground">{viewer.profile.role}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className="text-xs">
                            {viewer.count}x views
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(viewer.viewedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills That Attract Views */}
              <Card className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Skills Attracting Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topSkillsViewed.map((skill, index) => (
                      <div key={skill.skill} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{skill.skill}</span>
                          <span className="text-sm text-muted-foreground">{skill.views} views</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full gradient-primary rounded-full transition-all duration-500"
                            style={{ width: `${skill.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Match Rate */}
              <Card className="glass border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-green-500/10">
                      <Target className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Match Rate</p>
                      <p className="text-2xl font-bold">{matchRate.percentage}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">+{matchRate.weeklyChange}%</span>
                    <span className="text-muted-foreground">from last week</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {matchRate.matched} matches from {matchRate.sent} sent
                  </p>
                </CardContent>
              </Card>

              {/* Response Rate */}
              <Card className="glass border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Response Rate</p>
                      <p className="text-2xl font-bold">{responseRate.percentage}%</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg. response time: {responseRate.avgResponseTime}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {responseRate.responded} responded of {responseRate.received} received
                  </p>
                </CardContent>
              </Card>

              {/* Best Time to Connect */}
              <Card className="glass border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/10">
                      <Clock className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Best Time</p>
                      <p className="text-2xl font-bold">3 PM</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Peak activity hours
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    35 interactions on average
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Peak Hours Chart */}
            <Card className="glass border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Activity by Hour
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={peakHours}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
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
                      dataKey="activity" 
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      )}
    </MainLayout>
  );
}
