import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, Eye, UserPlus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notificationService";

const getIcon = (type) => {
  switch (type) {
    case "match": return Heart;
    case "message": return MessageCircle;
    case "view": return Eye;
    case "connection": return UserPlus;
    default: return Bell;
  }
};

const getIconColor = (type) => {
  switch (type) {
    case "match": return "text-pink-500 bg-pink-500/10";
    case "message": return "text-blue-500 bg-blue-500/10";
    case "view": return "text-purple-500 bg-purple-500/10";
    case "connection": return "text-green-500 bg-green-500/10";
    default: return "text-muted-foreground bg-muted";
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listNotifications({ limit: 100 })
      .then((items) => {
        if (!mounted) return;
        setNotifications(Array.isArray(items) ? items : []);
      })
      .catch((e) => {
        if (!mounted) return;
        toast({
          title: "Failed to load notifications",
          description: e?.message || "Please try again.",
          variant: "destructive",
        });
        setNotifications([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = () => {
    markAllNotificationsRead()
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      })
      .catch(() => {
        toast({
          title: "Action failed",
          description: "Unable to mark all as read.",
          variant: "destructive",
        });
      });
  };

  const markAsRead = (id) => {
    markNotificationRead(id)
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      })
      .catch(() => {
        toast({
          title: "Action failed",
          description: "Unable to mark as read.",
          variant: "destructive",
        });
      });
  };

  const formatTime = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="gap-1" onClick={markAllAsRead}>
              <Check className="w-4 h-4" />
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {loading && (
            <div className="text-center py-12 glass rounded-2xl">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}

          {notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div 
                key={n.id} 
                onClick={() => markAsRead(n.id)}
                className={cn(
                  "p-4 rounded-2xl glass transition-all cursor-pointer hover-lift",
                  !n.is_read && "border-l-4 border-primary"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", getIconColor(n.type))}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={cn("font-medium", !n.is_read && "font-semibold")}>{n.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground">{formatTime(n.created_at)}</span>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full gradient-primary" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {!loading && notifications.length === 0 && (
            <div className="text-center py-12 glass rounded-2xl">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
