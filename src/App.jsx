import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Onboarding from "./pages/Onboarding";
import Feed from "./pages/Feed";
import Connections from "./pages/Connections";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Discussions from "./pages/Discussions";
import DiscussionDetail from "./pages/DiscussionDetail";
import MyDiscussions from "./pages/MyDiscussions";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import ProjectsDashboard from "./pages/ProjectsDashboard";
import Freelance from "./pages/Freelance";
import GigDetail from "./pages/GigDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected route - needs auth but not profile */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected routes - needs auth and profile */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute requireProfile>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/connections"
            element={
              <ProtectedRoute requireProfile>
                <Connections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute requireProfile>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute requireProfile>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute requireProfile>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute requireProfile>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requireProfile>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireProfile>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discuss"
            element={
              <ProtectedRoute requireProfile>
                <Discussions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discuss/:postId"
            element={
              <ProtectedRoute requireProfile>
                <DiscussionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-discussions"
            element={
              <ProtectedRoute requireProfile>
                <MyDiscussions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute requireProfile>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/dashboard"
            element={
              <ProtectedRoute requireProfile>
                <ProjectsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute requireProfile>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelance"
            element={
              <ProtectedRoute requireProfile>
                <Freelance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelance/:gigId"
            element={
              <ProtectedRoute requireProfile>
                <GigDetail />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
