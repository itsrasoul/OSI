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
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <main className="w-full min-h-screen max-w-[2000px] mx-auto p-4 md:p-6 lg:p-8 xl:p-10">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/cases" component={CasesList} />
              <Route path="/cases/:id" component={CaseDetail} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </ScrollArea>
      </div>
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