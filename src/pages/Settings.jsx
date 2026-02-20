import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bell, Shield, Eye, User, LogOut, Trash2, Moon, Sun, 
  Lock, UserX, Flag, FileText, Crown, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function Settings() {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    profileVisibility: "everyone",
    whoCanMessage: "connections",
    showOnlineStatus: true,
    darkMode: document.documentElement.classList.contains("dark"),
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleToggle = (key) => {
    if (key === "darkMode") {
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("theme", !settings.darkMode ? "dark" : "light");
    }
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success("Setting updated");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleDeleteAccount = () => {
    toast.success("Account deletion requested. You'll receive a confirmation email.");
    setDeleteDialogOpen(false);
    navigate("/");
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6">
          {/* Notifications */}
          <div className="p-4 rounded-2xl glass">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch checked={settings.emailNotifications} onCheckedChange={() => handleToggle("emailNotifications")} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <Label className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser notifications</p>
                </div>
                <Switch checked={settings.pushNotifications} onCheckedChange={() => handleToggle("pushNotifications")} />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <Label className="font-medium">Match Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you match</p>
                </div>
                <Switch checked={settings.matchNotifications} onCheckedChange={() => handleToggle("matchNotifications")} />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <Label className="font-medium">Message Notifications</Label>
                  <p className="text-sm text-muted-foreground">New message alerts</p>
                </div>
                <Switch checked={settings.messageNotifications} onCheckedChange={() => handleToggle("messageNotifications")} />
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="p-4 rounded-2xl glass">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">Privacy</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <Label className="font-medium">Profile Visibility</Label>
                  <p className="text-sm text-muted-foreground">Who can see your profile</p>
                </div>
                <Select 
                  value={settings.profileVisibility} 
                  onValueChange={(v) => { setSettings(prev => ({ ...prev, profileVisibility: v })); toast.success("Setting updated"); }}
                >
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="connections">Connections only</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div>
                  <Label className="font-medium">Who Can Message</Label>
                  <p className="text-sm text-muted-foreground">Control who can send you messages</p>
                </div>
                <Select 
                  value={settings.whoCanMessage} 
                  onValueChange={(v) => { setSettings(prev => ({ ...prev, whoCanMessage: v })); toast.success("Setting updated"); }}
                >
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="connections">Connections only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <Label className="font-medium">Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                </div>
                <Switch checked={settings.showOnlineStatus} onCheckedChange={() => handleToggle("showOnlineStatus")} />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-4 rounded-2xl glass">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">Appearance</h2>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <Label className="font-medium">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className={cn("w-4 h-4", !settings.darkMode && "text-primary")} />
                <Switch checked={settings.darkMode} onCheckedChange={() => handleToggle("darkMode")} />
                <Moon className={cn("w-4 h-4", settings.darkMode && "text-primary")} />
              </div>
            </div>
          </div>

          {/* Safety & Trust */}
          <div className="p-4 rounded-2xl glass">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">Safety & Trust</h2>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/blocked")}>
                <UserX className="w-4 h-4 mr-2" />Blocked Users
              </Button>
              <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Flag className="w-4 h-4 mr-2" />Report an Issue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report an Issue</DialogTitle>
                    <DialogDescription>Help us keep the community safe</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>What would you like to report?</Label>
                      <Select>
                        <SelectTrigger className="mt-2"><SelectValue placeholder="Select issue type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="harassment">Harassment</SelectItem>
                          <SelectItem value="spam">Spam</SelectItem>
                          <SelectItem value="fake">Fake Profile</SelectItem>
                          <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Additional details</Label>
                      <Textarea className="mt-2" rows={4} placeholder="Please describe the issue..." />
                    </div>
                    <Button className="w-full gradient-primary" onClick={() => { toast.success("Report submitted"); setReportDialogOpen(false); }}>
                      Submit Report
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/guidelines")}>
                <FileText className="w-4 h-4 mr-2" />Community Guidelines
              </Button>
            </div>
          </div>

          {/* Account */}
          <div className="p-4 rounded-2xl glass">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold">Account</h2>
            </div>
            <div className="space-y-3">
              {!profile?.is_premium && (
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/pricing")}>
                  <Crown className="w-4 h-4 mr-2 text-primary" />Upgrade to Premium
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />Log Out
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />Delete Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Delete Account
                    </DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your data, connections, and messages will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">DevLinker v1.0.0</p>
      </div>
    </MainLayout>
  );
}
