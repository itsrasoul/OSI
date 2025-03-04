import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Case } from "@shared/schema";
import { motion } from "framer-motion";
import CaseDashboard from "@/components/cases/case-dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { CaseInfo } from "@shared/schema"; // Assuming CaseInfo type is defined

export default function Home() {
  const { data: cases } = useQuery<Case[]>({ 
    queryKey: ["/api/cases"],
    // Refresh data every 5 seconds
    refetchInterval: 5000,
  });

  // Add CaseInfo query
  const { data: allCaseInfo } = useQuery<CaseInfo[]>({
    queryKey: ["/api/cases/info"],
    refetchInterval: 5000,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl sm:text-4xl font-bold">Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-3">
            Track and manage your OSINT investigations
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/cases" className="flex items-center gap-3">
            <Plus className="h-5 w-5" />
            New Investigation
          </Link>
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-8 pr-4">
          {/* Main Dashboard */}
          <CaseDashboard caseInfo={allCaseInfo || []} cases={cases || []} />

          {/* Recent Cases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {cases?.slice(0, 6).map((case_) => (
                  <motion.div
                    key={case_.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Link href={`/cases/${case_.id}`}>
                      <Card className="cursor-pointer transition-all hover:bg-muted/50 hover:shadow-md">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold group-hover:text-primary truncate">
                              {case_.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {case_.description}
                            </p>
                            <div className="flex items-center gap-3">
                              <span className={`capitalize px-3 py-1 rounded-full text-xs font-medium
                                ${case_.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                  case_.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                  'bg-red-500/10 text-red-500'}`}>
                                {case_.status}
                              </span>
                              <span className={`capitalize px-3 py-1 rounded-full text-xs font-medium
                                ${case_.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                                  case_.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                  'bg-blue-500/10 text-blue-500'}`}>
                                {case_.priority}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}