import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Case } from "@shared/schema";
import { motion } from "framer-motion";
import CaseDashboard from "@/components/cases/case-dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

export default function Home() {
  const { data: cases } = useQuery<Case[]>({ 
    queryKey: ["/api/cases"]
  });

  return (
    <div className="container mx-auto px-4 space-y-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold">Intelligence Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your OSINT investigations
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/cases" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Investigation
          </Link>
        </Button>
      </div>

      {/* Dashboard Content */}
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-8 pr-4">
          {/* Main Dashboard */}
          <CaseDashboard caseInfo={[]} />

          {/* Recent Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cases?.slice(0, 6).map((case_) => (
                  <motion.div
                    key={case_.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Link href={`/cases/${case_.id}`}>
                      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <h3 className="font-semibold group-hover:text-primary truncate">
                              {case_.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {case_.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`capitalize px-2 py-0.5 rounded-full text-xs
                                ${case_.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                  case_.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                  'bg-red-500/10 text-red-500'}`}>
                                {case_.status}
                              </span>
                              <span className={`capitalize px-2 py-0.5 rounded-full text-xs
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