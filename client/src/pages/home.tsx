  import { useQuery } from "@tanstack/react-query";
import { Case } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Loader2,
  Crosshair,
  TrendingUp,
  Users,
  FileText,
  Search,
  BarChart3,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap
} from "lucide-react";
import CaseForm from "@/components/cases/case-form";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user } = useAuth();

  const { data: cases = [], isLoading } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/cases");
        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Expected array of cases, got:", data);
          return [];
        }
        return data;
      } catch (error) {
        console.error("Error fetching cases:", error);
        return [];
      }
    },
    staleTime: 5000,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    retry: 2,
    initialData: []
  });

  // Calculate statistics
  const activeCases = cases.filter(c => c.status === 'active').length;
  const pendingCases = cases.filter(c => c.status === 'pending').length;
  const closedCases = cases.filter(c => c.status === 'closed').length;
  const highPriorityCases = cases.filter(c => c.priority === 'high').length;
  const totalCases = cases.length;

  const completionRate = totalCases > 0 ? Math.round((closedCases / totalCases) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome back, {user?.username || 'Investigator'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Your OSINT investigations dashboard
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/cases">
              <Search className="h-4 w-4 mr-2" />
              Browse Cases
            </Link>
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            New Investigation
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Cases</p>
                <h3 className="text-3xl font-bold text-blue-600">{activeCases}</h3>
              </div>
              <div className="rounded-full p-3 bg-blue-500/10">
                <Crosshair className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <h3 className="text-3xl font-bold text-yellow-600">{pendingCases}</h3>
              </div>
              <div className="rounded-full p-3 bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <h3 className="text-3xl font-bold text-red-600">{highPriorityCases}</h3>
              </div>
              <div className="rounded-full p-3 bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <h3 className="text-3xl font-bold text-green-600">{completionRate}%</h3>
                <Progress value={completionRate} className="mt-2 h-2" />
              </div>
              <div className="rounded-full p-3 bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Investigations
                </CardTitle>
                <Badge variant="secondary">{totalCases} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading investigations...</span>
                </div>
              ) : cases && cases.length > 0 ? (
                <div className="space-y-4">
                  {cases.slice(0, 6).map((case_) => (
                    <Link key={case_.id} href={`/cases/${case_.id}`}>
                      <div className="p-4 rounded-lg bg-card/50 hover:bg-card/80 cursor-pointer border transition-all hover:shadow-md">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            {case_.imageUrl ? (
                              <AvatarImage src={case_.imageUrl} alt={case_.name} />
                            ) : (
                              <AvatarFallback className="bg-primary/5">
                                <Crosshair className="h-6 w-6 text-primary" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{case_.name}</h3>
                              <Badge
                                variant={
                                  case_.priority === 'high' ? 'destructive' :
                                  case_.priority === 'medium' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {case_.priority}
                              </Badge>
                              <Badge
                                variant={
                                  case_.status === 'active' ? 'default' :
                                  case_.status === 'pending' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {case_.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {case_.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Updated {new Date(case_.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {cases.length > 6 && (
                    <div className="text-center pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/cases">View All Cases</Link>
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Crosshair className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No investigations yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your first OSINT investigation to track leads and gather intelligence.
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Investigation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/search">
                  <Search className="h-4 w-4 mr-2" />
                  Advanced Search
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Dashboard
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Security Tools
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Team Collaboration
              </Button>
            </CardContent>
          </Card>

          {/* OSINT Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                OSINT Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <a
                  href="https://osintframework.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="font-medium">OSINT Framework</div>
                  <div className="text-sm text-muted-foreground">Comprehensive OSINT tools directory</div>
                </a>
                <a
                  href="https://start.me/p/DPYPMz/the-ultimate-osint-collection"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Ultimate OSINT Collection</div>
                  <div className="text-sm text-muted-foreground">Curated collection of OSINT tools</div>
                </a>
                <a
                  href="https://github.com/jivoi/awesome-osint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="font-medium">Awesome OSINT</div>
                  <div className="text-sm text-muted-foreground">GitHub collection of OSINT resources</div>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Tips & Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <div className="font-medium">Create Your First Case</div>
                    <div className="text-muted-foreground">Start with a clear objective and scope</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <div className="font-medium">Gather Intelligence</div>
                    <div className="text-muted-foreground">Use search tools to collect information</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <div className="font-medium">Organize & Analyze</div>
                    <div className="text-muted-foreground">Categorize findings and identify patterns</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <CaseForm open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}