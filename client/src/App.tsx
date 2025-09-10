import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./lib/auth";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth";
import Home from "@/pages/home";
import CasesList from "@/pages/cases";
import CaseDetail from "@/pages/cases/[id]";
import SearchPage from "@/pages/search";
import AnalyticsPage from "@/pages/analytics";
import ToolsPage from "@/pages/tools";
import SettingsPage from "@/pages/settings";
import TeamPage from "@/pages/team";
import ReportsPage from "@/pages/reports";
import DataSourcesPage from "@/pages/data";
import Sidebar from "@/components/layout/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Component />;
}

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="min-h-screen w-full max-w-[1800px] mx-auto pt-[72px] lg:pt-0">
          <Switch>
            <Route path="/" component={() => <ProtectedRoute component={Home} />} />
            <Route path="/cases" component={() => <ProtectedRoute component={CasesList} />} />
            <Route path="/cases/:id" component={() => <ProtectedRoute component={CaseDetail} />} />
            <Route path="/search" component={() => <ProtectedRoute component={SearchPage} />} />
            <Route path="/analytics" component={() => <ProtectedRoute component={AnalyticsPage} />} />
            <Route path="/tools" component={() => <ProtectedRoute component={ToolsPage} />} />
            <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
            <Route path="/team" component={() => <ProtectedRoute component={TeamPage} />} />
            <Route path="/reports" component={() => <ProtectedRoute component={ReportsPage} />} />
            <Route path="/data" component={() => <ProtectedRoute component={DataSourcesPage} />} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </ScrollArea>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;