import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User, Building2, Search } from "lucide-react";
import { FreelancerDashboard } from "@/components/freelance/FreelancerDashboard";
import { ClientDashboard } from "@/components/freelance/ClientDashboard";
import { GigListing } from "@/components/freelance/GigListing";

export default function Freelance() {
  const [view, setView] = useState("browse");

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-primary" />
              Freelance Marketplace
            </h1>
            <p className="text-muted-foreground">Find gigs or hire talented developers</p>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v)} className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Browse Gigs
            </TabsTrigger>
            <TabsTrigger value="freelancer" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Freelancer
            </TabsTrigger>
            <TabsTrigger value="client" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Client
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <GigListing />
          </TabsContent>

          <TabsContent value="freelancer">
            <FreelancerDashboard />
          </TabsContent>

          <TabsContent value="client">
            <ClientDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
