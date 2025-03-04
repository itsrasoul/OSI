import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CasesList from "@/pages/cases";
import CaseDetail from "@/pages/cases/[id]";
import Sidebar from "@/components/layout/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

function Router() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <ScrollArea className="flex-1">
        <main className="min-h-screen w-full max-w-[1800px] mx-auto pt-[72px] lg:pt-0">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/cases" component={CasesList} />
            <Route path="/cases/:id" component={CaseDetail} />
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;