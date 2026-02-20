import { useEffect, useMemo, useRef, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Check, X, Clock, Crown, MapPin, Briefcase, Github, Linkedin, Search } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { getConnections, getReceivedRequests, getSentRequests, reviewConnectionRequest } from "@/services/connectionService";

export default function Connections() {
  const [accepted, setAccepted] = useState([]);
  const [pending, setPending] = useState([]);
  const [sent, setSent] = useState([]);
  const [loadingAccepted, setLoadingAccepted] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingSent, setLoadingSent] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [newPendingCount, setNewPendingCount] = useState(0);
  const prevPendingIdsRef = useRef(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const totals = useMemo(
    () => ({ accepted: accepted.length, pending: pending.length, sent: sent.length }),
    [accepted.length, pending.length, sent.length]
  );

  const mapUserToProfile = (u) => {
    if (!u) return null;
    return {
      id: u._id || u.id,
      name: u.fullName || u.name,
      role: u.role,
      bio: u.bio ?? u.about,
      avatar_url: u.photoUrl || u.avatar_url,
      experience: u.experience,
      location: u.location,
      skills: u.skills || [],
      availability: u.availability,
      github: u.github,
      linkedin: u.linkedin,
      is_premium: u.isPremium ?? u.is_premium,
    };
  };

  const fetchAccepted = async () => {
    setLoadingAccepted(true);
    try {
      const res = await getConnections();
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const mapped = rows
        .map((row) => {
          // Backend may return either users or wrapped data
          const user = row?.user || row?.profile || row;
          const profile = mapUserToProfile(user);
          if (!profile) return null;
          return { id: profile.id, status: "accepted", profile };
        })
        .filter(Boolean);
      setAccepted(mapped);
    } catch (err) {
      toast.error(err?.message || "Failed to load connections");
    } finally {
      setLoadingAccepted(false);
    }
  };

  const fetchSent = async ({ isPoll = false } = {}) => {
    if (!isPoll) setLoadingSent(true);
    try {
      const res = await getSentRequests();
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const mapped = rows
        .map((row) => {
          const requestId = row?._id || row?.id;
          const toUser = row?.toUserId || row?.toUser || row?.to;
          const profile = mapUserToProfile(toUser);
          if (!requestId || !profile) return null;
          return { id: requestId, status: "sent", profile };
        })
        .filter(Boolean);

      setSent(mapped);
    } catch (err) {
      toast.error(err?.message || "Failed to load sent requests");
    } finally {
      if (!isPoll) setLoadingSent(false);
    }
  };

  const normalizedQuery = useMemo(() => String(searchQuery || "").trim().toLowerCase(), [searchQuery]);

  const matchesQuery = (profile) => {
    if (!normalizedQuery) return true;
    const parts = [
      profile?.name,
      profile?.role,
      profile?.location,
      profile?.experience,
      profile?.bio,
      ...(Array.isArray(profile?.skills) ? profile.skills : []),
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return parts.some((p) => p.includes(normalizedQuery));
  };

  const filteredAccepted = useMemo(
    () => accepted.filter((c) => matchesQuery(c.profile)),
    [accepted, normalizedQuery]
  );
  const filteredPending = useMemo(
    () => pending.filter((c) => matchesQuery(c.profile)),
    [pending, normalizedQuery]
  );
  const filteredSent = useMemo(
    () => sent.filter((c) => matchesQuery(c.profile)),
    [sent, normalizedQuery]
  );

  const counts = useMemo(
    () => ({ accepted: filteredAccepted.length, pending: filteredPending.length, sent: filteredSent.length }),
    [filteredAccepted.length, filteredPending.length, filteredSent.length]
  );

  const fetchPending = async ({ isPoll = false } = {}) => {
    if (!isPoll) setLoadingPending(true);
    try {
      const res = await getReceivedRequests();
      const rows = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const mapped = rows
        .map((row) => {
          const requestId = row?._id || row?.id;
          const fromUser = row?.fromUserId || row?.fromUser || row?.from;
          const profile = mapUserToProfile(fromUser);
          if (!requestId || !profile) return null;
          return { id: requestId, status: "pending", profile };
        })
        .filter(Boolean);

      if (isPoll) {
        const nextIds = new Set(mapped.map((m) => m.id));
        const prevIds = prevPendingIdsRef.current;
        let newlyAdded = 0;
        nextIds.forEach((id) => {
          if (!prevIds.has(id)) newlyAdded += 1;
        });
        if (newlyAdded > 0) setNewPendingCount((c) => c + newlyAdded);
        prevPendingIdsRef.current = nextIds;
      } else {
        prevPendingIdsRef.current = new Set(mapped.map((m) => m.id));
        setNewPendingCount(0);
      }

      setPending(mapped);
    } catch (err) {
      toast.error(err?.message || "Failed to load pending requests");
    } finally {
      if (!isPoll) setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchAccepted();
    fetchPending();
    fetchSent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const pendingInterval = setInterval(() => {
      fetchPending({ isPoll: true });
    }, 30_000);
    const connectionsInterval = setInterval(() => {
      fetchAccepted();
    }, 60_000);
    const sentInterval = setInterval(() => {
      fetchSent({ isPoll: true });
    }, 60_000);

    return () => {
      clearInterval(pendingInterval);
      clearInterval(connectionsInterval);
      clearInterval(sentInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: "accepted" }));
    try {
      await reviewConnectionRequest("accepted", requestId);
      setPending((prev) => prev.filter((c) => c.id !== requestId));
      toast.success("Connection accepted!");
      fetchAccepted();
    } catch (err) {
      toast.error(err?.message || "Failed to accept request");
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: "rejected" }));
    try {
      await reviewConnectionRequest("rejected", requestId);
      setPending((prev) => prev.filter((c) => c.id !== requestId));
      toast("Connection rejected");
    } catch (err) {
      toast.error(err?.message || "Failed to reject request");
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[requestId];
        return next;
      });
    }
  };

  const ConnectionCard = ({ connection, kind = "accepted" }) => {
    const dev = connection.profile;
    return (
      <div className="p-5 rounded-2xl glass hover-lift border border-border/50">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Link to={`/profile/${dev.id}`}>
              <img 
                src={dev.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dev.id}`} 
                alt={dev.name} 
                className="w-16 h-16 rounded-xl object-cover ring-2 ring-border" 
              />
            </Link>
            {dev.is_premium && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
                <Crown className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{dev.name}</h3>
              {dev.availability === "Open to work" && (
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 shrink-0">
                  Open to work
                </Badge>
              )}
            </div>
            <p className="text-sm text-primary font-medium">{dev.role}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {dev.experience && (
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />{dev.experience}
                </span>
              )}
              {dev.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{dev.location}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(dev.skills || []).slice(0, 4).map(s => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
              {(dev.skills || []).length > 4 && (
                <Badge variant="outline" className="text-xs">+{dev.skills.length - 4}</Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
          {dev.github && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={`https://${dev.github}`} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
              </a>
            </Button>
          )}
          {dev.linkedin && (
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <a href={`https://${dev.linkedin}`} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
              </a>
            </Button>
          )}
          <div className="flex-1" />
          {kind === "pending" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive"
                onClick={() => handleReject(connection.id)}
                disabled={Boolean(actionLoading[connection.id])}
              >
                <X className="w-4 h-4 mr-1" />Decline
              </Button>
              <Button
                size="sm"
                className="gradient-primary"
                onClick={() => handleAccept(connection.id)}
                disabled={Boolean(actionLoading[connection.id])}
              >
                <Check className="w-4 h-4 mr-1" />Accept
              </Button>
            </>
          ) : kind === "accepted" ? (
            <Link to={`/messages?userId=${dev.id}`}>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-1" />Message
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <Clock className="w-4 h-4 mr-1" />Sent
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Connections</h1>
          <p className="text-muted-foreground">{totals.accepted} connections • {totals.pending} pending • {totals.sent} sent</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search connections, pending, sent…"
              className="pl-9"
            />
          </div>
        </div>
        
        <Tabs defaultValue="accepted" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="accepted" className="gap-2">
              <Check className="w-4 h-4" />Connected ({counts.accepted})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />Pending ({counts.pending})
              {newPendingCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  New {newPendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Clock className="w-4 h-4" />Sent ({counts.sent})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="accepted" className="space-y-4">
            {loadingAccepted ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">Loading connections…</p>
              </div>
            ) : filteredAccepted.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">
                  {normalizedQuery ? "No matching connections" : "No connections yet"}
                </p>
                {!normalizedQuery && (
                  <Link to="/feed">
                    <Button className="mt-4 gradient-primary">Find Developers</Button>
                  </Link>
                )}
              </div>
            ) : (
              filteredAccepted.map((c) => <ConnectionCard key={c.id} connection={c} kind="accepted" />)
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {loadingPending ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">Loading pending requests…</p>
              </div>
            ) : filteredPending.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">
                  {normalizedQuery ? "No matching pending requests" : "No pending requests"}
                </p>
              </div>
            ) : (
              filteredPending.map((c) => <ConnectionCard key={c.id} connection={c} kind="pending" />)
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {loadingSent ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">Loading sent requests…</p>
              </div>
            ) : filteredSent.length === 0 ? (
              <div className="text-center py-12 glass rounded-2xl">
                <p className="text-muted-foreground">
                  {normalizedQuery ? "No matching sent requests" : "No sent requests"}
                </p>
              </div>
            ) : (
              filteredSent.map((c) => <ConnectionCard key={c.id} connection={c} kind="sent" />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
